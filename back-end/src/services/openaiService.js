import OpenAI from "openai"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../../.env")
});


const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY

})

// tempo : no RAG sirf LLM test karrahe hai

export const handleQuery =async(query) => {
   /* const completion = await client.chat.completions.create({
        model:"gpt-4o-mini",
        messages: [
            {role: "system",content: "You are an intelligent Business assistant."},
            {role: "user", content: query}
        ],
    })

    const answer = completion.choices[0].message.content
    */

    return { 
        answer: `Mock answer for: "${query}". 
    This response simulates the LLM output. 
    RAG context will be injected here later.`,
         
        sources: ["mock-doc-1.txt", "mock-doc-2.txt"] // will fill rag here later
    }
}
//for testing OpenAI's Api key
console.log("OPENAI_API_KEY loaded:",process.env.OPENAI_API_KEY?.slice(0,10))
