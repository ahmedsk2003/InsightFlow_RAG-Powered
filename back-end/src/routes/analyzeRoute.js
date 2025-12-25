import express from "express";
import { Pinecone } from "@pinecone-database/pinecone";

const router = express.Router();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

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

    res.json({
      summary: `Mock insight for: ${query}`,
      kpis: [
        { label: "Revenue Growth", value: "+12%" },
        { label: "Churn Risk", value: "Medium" },
        { label: "Forecast Confidence", value: "High" },
      ],
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
    console.error(err);
    res.status(500).json({ error: "Analyze failed" });
  }
});

export default router;
