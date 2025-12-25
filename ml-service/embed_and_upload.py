import os
import glob
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
load_dotenv("../back-end/.env")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

pc = Pinecone(api_key = PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX_NAME)



model = SentenceTransformer( "all-MiniLM-L6-v2",
backend="onnx")# 384 dims

DATA_DIR = "../data"
files = glob.glob(os.path.join(DATA_DIR, "*.txt"))

print(f"Found {len(files)} files")
vectors = [] 
for f in files: 
    with open(f, "r", encoding="utf-8") as fh:
        text = fh.read().strip()

    emb = model.encode(text).tolist()
    
    vectors.append({
        "id": os.path.basename(f),
        "values":emb,
        "metadata": {
            "source": os.path.basename(f),
            "text":text
        }
    })
    print(f"Embedded: {os.path.basename(f)}")

    # Upsert in batches
    if vectors: 
        index.upsert(vectors=vectors)
        print("All Documents are uploaded to Pinecone")
    else:
        print("No Documents found")