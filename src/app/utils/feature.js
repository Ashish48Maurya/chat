import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import { ourFileRouter } from "../api/uploadthing/core";
// import { PineconeClient } from "@pinecone-database/pinecone";
const { GoogleGenerativeAI } = require("@google/generative-ai");

export const UploadButton = generateUploadButton(ourFileRouter);
export const UploadDropzone = generateUploadDropzone(ourFileRouter);



const genAI = new GoogleGenerativeAI(process.env.G_KEY);

export async function getEmbeddings(text) {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent(text);
  const embedding = result.embedding;
  return embedding.values;
}

export async function completion(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}
