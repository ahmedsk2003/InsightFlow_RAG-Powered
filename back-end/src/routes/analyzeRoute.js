import express from "express";
import { Pinecone } from "@pinecone-database/pinecone";

const router = express.Router();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);


// -------- KPI GENERATOR ----------
function generateKPIs(query, sources) {
  const q = (query || "").toLowerCase();

  // defaults
  let revenue = "+8%";
  let churn = "Medium";
  let confidence = "Medium";

  // Query keyword logic
  if (q.includes("churn") || q.includes("retention")) {
    churn = "High Risk";
    confidence = "High";
  }

  if (q.includes("revenue") || q.includes("sales") || q.includes("growth")) {
    revenue = "+18%";
    confidence = "High";
  }

  if (q.includes("forecast")) {
    confidence = "High";
  }

  if (q.includes("profit") || q.includes("margin")) {
    revenue = "+10%";
  }

  // -------- OPTIONAL — React to doc text sentiment --------
  if (sources && sources.length > 0) {
    const text = (sources[0].metadata?.text || "").toLowerCase();

    if (
      text.includes("decline") ||
      text.includes("loss") ||
      text.includes("drop") ||
      text.includes("slowdown")
    ) {
      revenue = "-4%";
    }

    if (
      text.includes("record") ||
      text.includes("increase") ||
      text.includes("growth")
    ) {
      revenue = "+22%";
    }
  }

  return [
    { label: "Revenue Growth", value: revenue },
    { label: "Churn Risk", value: churn },
    { label: "Forecast Confidence", value: confidence },
  ];
}


// -------- ROUTE ----------
router.post("/", async (req, res) => {
  try {
    const { query } = req.body;

    // fake query embedding
    const vector = Array.from({ length: 384 }, () => Math.random());

    const results = await index.query({
      vector,
      topK: 3,
      includeMetadata: true
    });

    // Generate KPIs dynamically
    const kpis = generateKPIs(query, results.matches);

    res.json({
      summary: `Insight for: ${query}`,
      kpis,
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
      sources: results.matches.map(m => ({
        source: m.metadata.source,
        snippet: m.metadata.text.slice(0, 200)
      }))
    });

  } catch (err) {
    console.error("ERROR in /api/analyze", err);
    res.status(500).json({ error: "Analyze failed" });
  }
});

export default router;
