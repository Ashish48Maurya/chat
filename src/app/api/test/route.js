const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyB7Tc8Nzt0y8Kdbimleo-TPdvXtA0uKr5Y");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const prompt = "Write a code for printing hello world 10 times in cpp , java as well as in python";

async function run() {

    try {
        const result = await model.generateContentStream([prompt]);
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            console.log(chunkText);
        }
    } catch (error) {
        console.error("Error generating content:", error);
    }
}

run();
