import * as pdfjsLib from 'pdfjs-dist';
import { getEmbeddings } from '../../utils/feature'
import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone'
pdfjsLib.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry');

export async function POST(req) {
    const { url,ind } = await req.json();
    try {
        let vectors = []
        let myFiledata = await fetch(url)
        console.log("myFiledata",myFiledata);
        if (myFiledata.ok) {
            let pdfDoc = await pdfjsLib.getDocument(await myFiledata.arrayBuffer()).promise


            const numPages = pdfDoc.numPages


            for (let i = 0; i < numPages; i++) {
                let page = await pdfDoc.getPage(i + 1)
                let textContent = await page.getTextContent()



                const text = textContent.items.map(item => item.str).join('');


                const embedding = await getEmbeddings(text)


                vectors.push({
                    id: `page${i + 1}`,
                    values: embedding,
                    metadata: {
                        pageNum: i + 1,
                        text,
                    },
                })

            }
            const pc = new Pinecone({
                apiKey: process.env.PDB_KEY
            });
            const index = pc.Index(ind)
            await index.upsert(vectors);
            return NextResponse.json({ success: true, message: 'File processed successfully' }, { status: 200 })
        }
        else {
            return NextResponse.json({ success: false, message: 'Error Getting File Content' }, { status: 500 })
        }
    }
    catch (err) {
        return NextResponse.json({ success: false, message: `Internal Server Error: ${err.message}` }, { status: 500 })
    }
}