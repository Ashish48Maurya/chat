import { Pinecone } from '@pinecone-database/pinecone'
import { getEmbeddings,completion } from '../../utils/feature'
import { NextResponse } from 'next/server';
export async function POST(req) {
    const { Query,ind } = await req.json();

    const questionEmb = await getEmbeddings(Query)
    const pc = new Pinecone({
        apiKey: process.env.PDB_KEY
    });
    const index = pc.Index(ind)


    const queryRequest = {
        vector: questionEmb,
        topK: 5,
        includeValues: true,
        includeMetadata: true,
    };

    let result = await index.query(queryRequest);

    let contexts = result['matches'].map(item => item['metadata'].text)

    contexts = contexts.join("\n\n---\n\n")
    const promptStart = `Answer the question based on the context below:\n\n`
    const promptEnd = `\n\nQuestion: ${Query} \n\nAnswer:`

    const prompt = `${promptStart} ${contexts} ${promptEnd}`
    let response = await completion(prompt)
    return NextResponse.json({success:true ,message:response},{status:200})
}