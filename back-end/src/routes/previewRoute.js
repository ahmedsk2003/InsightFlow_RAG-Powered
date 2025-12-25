import express from "express";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const rows = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => {

        const columns = Object.keys(rows[0] || {});

        // detect numeric columns
        const numericCols = columns.filter(c =>
          rows.some(r => !isNaN(parseFloat(r[c])))
        );

        // compute averages for KPIs
        const kpis = numericCols.slice(0, 3).map(c => {
          const values = rows
            .map(r => parseFloat(r[c]))
            .filter(v => !isNaN(v));

          const avg = (values.reduce((a,b) => a+b, 0) / values.length).toFixed(2);

          return { label: `Avg ${c}`, value: avg };
        });

        // pick a column for chart
        const chartX = columns[0];
        const chartY = numericCols[0];

        const chartData = rows.slice(0, 12).map(r => ({
          label: r[chartX],
          value: parseFloat(r[chartY]) || 0
        }));

        res.json({
          columns,
          kpis,
          chartData,
          sample: rows.slice(0, 5)
        });
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Preview failed" });
  }
});

export default router;
