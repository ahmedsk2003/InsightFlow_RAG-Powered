import express from "express";
import { Pinecone } from "@pinecone-database/pinecone";
import ollama from "ollama";

const router = express.Router();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);


// -------- KPI GENERATOR ----------
function generateKPIs(query, sources) {
  const q = (query || "").toLowerCase();

  let revenue = "+8%";
  let churn = "Medium";
  let confidence = "Medium";

  if (q.includes("churn") || q.includes("retention")) {
    churn = "High Risk";
    confidence = "High";
  }

  if (q.includes("revenue") || q.includes("sales") || q.includes("growth")) {
    revenue = "+18%";
    confidence = "High";
  }

  if (q.includes("forecast")) confidence = "High";

  if (q.includes("profit") || q.includes("margin")) revenue = "+10%";

  if (sources && sources.length > 0) {
    const text = (sources[0].metadata?.text || "").toLowerCase();

    if (text.includes("decline") || text.includes("loss") || text.includes("drop"))
      revenue = "-4%";

    if (text.includes("record") || text.includes("increase") || text.includes("growth"))
      revenue = "+22%";
  }

  return [
    { label: "Revenue Growth", value: revenue },
    { label: "Churn Risk", value: churn },
    { label: "Forecast Confidence", value: confidence },
  ];
}


// -------- SUGGESTED QUESTIONS ----------
function generateSuggestedQuestions(text, query) {
  text = (text || "").toLowerCase();
  query = (query || "").toLowerCase();

  const questions = [];

  if (text.includes("revenue") || text.includes("sales"))
    questions.push(
      "What is the monthly revenue trend?",
      "Which regions generate the highest revenue?",
      "What are the key drivers of revenue growth?"
    );

  if (text.includes("customer") || text.includes("segment"))
    questions.push(
      "Which customer segments are the most profitable?",
      "Which customers have the highest churn risk?"
    );

  if (text.includes("forecast") || query.includes("forecast"))
    questions.push("How reliable is the forecast?", "What risks may impact the forecast?");

  if (text.includes("cost") || text.includes("expense"))
    questions.push(
      "Which areas contribute most to cost?",
      "How can we optimize operational expenses?"
    );

  if (questions.length === 0)
    questions.push(
      "Summarize key risks and opportunities",
      "What KPIs should we track from this data?",
      "Generate 3 strategic recommendations"
    );

  return questions;
}



// -------- ROUTE ----------
router.post("/", async (req, res) => {
  try {
    const { query } = req.body;

    // fake query embedding
    const vector = Array.from({ length: 384 }, () => Math.random());

    const results = await index.query({
      vector,
      topK: 1,
      includeMetadata: true
    });

    const matches = results.matches || [];

    // KPIs
    const kpis = generateKPIs(query, matches);

    // Suggested Questions
    const firstDocText = matches[0]?.metadata?.text || "";
    const suggestedQuestions = generateSuggestedQuestions(firstDocText, query);
//////////
   let aiAnswer = `Here are some insights related to "${query}".`;

try {

  // ⏬ keep only 1 match + 300 chars
  const contextText = matches[0]?.metadata?.text?.slice(0, 300) || "";

  const ollamaResponse = await ollama.chat({
    model: "llama3.2:3b",            // ✅ FAST MODEL
    options: {
      num_predict: 200               // ✅ limit output size
    },
    messages: [
      {
        role: "system",
        content: "You are a helpful data insights assistant. Answer clearly in 3–6 short bullet points."
      },
      {
        role: "user",
        content: `Question: ${query}\n\nRelevant data:\n${contextText}`
      }
    ]
  });

  aiAnswer = ollamaResponse.message?.content || aiAnswer;

} catch (e) {
  console.error("Ollama failed — using fallback text", e);
}



    // -------- SEND RESPONSE ----------
    res.json({
        summary: aiAnswer,
        kpis,
        suggestedQuestions,

        chartTitle: query
        ? `Trend Analysis Based On: ${query}`
        : "Trend Visualization From Uploaded Data",


      chartData: [
        { month: "Apr", value: 120 },
        { month: "May", value: 135 },
        { month: "Jun", value: 155 },
        { month: "Jul", value: 165 },
        { month: "Aug", value: 180 },
        { month: "Sep", value: 190 },
        { month: "Oct", value: 205 },
        { month: "Nov", value: 220 },
        { month: "Dec", value: 240 },
        { month: "Jan", value: 230 },
        { month: "Feb", value: 245 },
        { month: "Mar", value: 260 }
      ],
      recommendations: [
        "Expand high-performing regions",
        "Reduce CAC by focusing optimized channels",
        "Invest in retention programs"
      ],
      sources: matches.map(m => ({
        source: m.metadata?.source,
        snippet: m.metadata?.text?.slice(0, 200) || ""
      }))
    });

  } catch (err) {
    console.error("ERROR in /api/analyze", err);
    res.status(500).json({ error: "Analyze failed" });
  }
});

export default router;
