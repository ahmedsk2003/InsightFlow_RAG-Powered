import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
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

      await index.upsert([
        {
          id: file.filename,
          values: fakeEmbedding(384),
          metadata: {
            source: file.originalname,
            text: fileText
          },
        },
      ]);

      uploadedFiles.push({
        id: file.filename,
        name: file.originalname,
        size: file.size
      });
    }

    res.json({ success: true, files: uploadedFiles });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

export default router;
