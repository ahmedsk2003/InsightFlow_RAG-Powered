import express from "express";
import multer from "multer";
import fs from "fs";
import { parse } from "csv-parse/sync";
import { Pinecone } from "@pinecone-database/pinecone";
import { fakeEmbedding } from "../utils/fakeEmbedding.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

router.post("/", upload.array("files"), async (req, res) => {
  try {
    const uploadedFiles = [];

    for (const file of req.files) {
      const fileText = fs.readFileSync(file.path, "utf8");

      let chartData = [];

      // ---------- IF CSV → TRY PARSING ----------
      if (file.originalname.toLowerCase().endsWith(".csv")) {
        try {
          const rows = parse(fileText, {
            columns: true,
            skip_empty_lines: true,
          });

          if (rows.length > 0) {
            // detect first numeric column
            const numericCols = Object.keys(rows[0]).filter((col) =>
              !isNaN(rows[0][col])
            );

            if (numericCols.length > 0) {
              const col = numericCols[0];

              chartData = rows.slice(0, 12).map((row, i) => ({
                month: row.Month || row.Date || `Row ${i + 1}`,
                value: Number(row[col]),
              }));
            }
          }
        } catch (e) {
          console.log("CSV Parse failed — continuing normally");
        }
      }

      // ---------- STORE IN PINECONE ----------
      await index.upsert([
        {
          id: file.filename,
          values: fakeEmbedding(384),
          metadata: {
            source: file.originalname,
            text: fileText,
            chartData, // << NEW — may be []
          },
        },
      ]);

      uploadedFiles.push({
        id: file.filename,
        name: file.originalname,
        size: file.size,
        chartData,
      });
    }

    res.json({ success: true, files: uploadedFiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

export default router;
