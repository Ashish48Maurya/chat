import { NextResponse } from "next/server";
import { Pinecone } from '@pinecone-database/pinecone'

export async function POST(req) {
    const url = new URL(req.url);
    const slugName = url.searchParams.get('slug');
    if (!slugName) {
        return NextResponse.json({ success: false, message: "SlugName is required" }, { status: 400 });
    }
    try {
        const pc = new Pinecone({
          apiKey: process.env.PDB_KEY
        });

        await pc.createIndex({
          name: slugName,
          dimension: 768,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        return NextResponse.json({ success: true, message: "File uploaded and index created" }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}