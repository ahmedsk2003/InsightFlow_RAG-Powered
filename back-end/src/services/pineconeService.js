import {Pinecone } from "@pinecone-database/pinecone"

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
})

export const getPineconeIndex = () => {
    return pinecone.Index(process.env.PINECONE_INDEX_KEY)
}

// import { fakeEmbedding } from "./fakeEmbedding.js";

// const vector = fakeEmbedding(384);

// await index.upsert([
//   {
//     id: fileName,
//     values: vector,
//     metadata: {
//       source: fileName,
//       text: text
//     }
//   }
// ]);
