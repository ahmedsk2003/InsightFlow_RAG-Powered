# BetterCallSQL


# 🧠 InsightFlow — RAG-Powered Data Understanding Tool

InsightFlow is a smart data assistant that helps users **upload datasets**, **ask questions**, and **instantly understand insights** using **Retrieval-Augmented Generation (RAG)** and **LLMs** (Ollama – llama3.2:3b).

Think of it as:

> “Upload CSV / Docs → System analyzes → You ask questions → It shows insights, KPIs, charts & answers.”

---

## ✅ Core Features

### 🔹 Upload Your Data

Users can upload files like:

* CSV
* Excel
* PDF
* DOC / DOCX

The system **reads the file & prepares it for analysis**.

---

### 🔹 Ask Natural-Language Questions

Example questions:

* *“Show me customers from Chile”*
* *“What is the sales trend?”*
* *“What KPIs should I track?”*

The system generates:
✔ Clean bullet-point answers
✔ KPIs
✔ Suggested questions
✔ Visual charts
✔ Data source info

---

### 🔹 Smart Suggested Questions

After upload, InsightFlow analyzes the data and **auto-suggests useful questions** like:

> “Which region has the highest revenue?”
> “What risks may impact the forecast?”

Clicking a question:
✔ Auto-fills the input box
✔ Scrolls the page
✔ Runs analysis instantly

---

### 🔹 KPI Cards

KPIs **update dynamically** based on:

* Query keywords
* Uploaded data context

Examples:

* 📈 Revenue Growth
* ⚠️ Churn Risk
* 🔮 Forecast Confidence

---

### 🔹 Dynamic Charts

InsightFlow builds **auto-generated charts** from uploaded data.

Charts are:
✔ Clean
✔ Auto-scaled
✔ Rotated labels to avoid overlap
✔ Smooth & readable

If no data exists:

> “No chart data available yet.”

---

### 🔹 LLM Answering (Ollama)

We use **llama3.2:3b locally** — fast & private.

It replies in:
✔ 3-6 bullet points
✔ Simple English
✔ Clean format (no markdown mess)

---

## 🏗 Project Architecture

### 🖥 Frontend — React + Vite

* Upload UI
* Query input
* KPI cards
* Chart rendering
* Suggested Questions
* Shows Sources

---

### ⚙ Backend — Node + Express

APIs include:

* `/upload`

  * Stores vector embeddings in Pinecone
* `/preview`

  * Extracts sample rows
* `/analyze`

  * Runs RAG + LLM
  * Generates KPIs
  * Builds chart data

---

### 🧠 Vector DB — Pinecone

Stores:

* File text
* Metadata
* Snippets for context

Used to retrieve **relevant chunks for LLM**.

---

### 🤖 LLM — Ollama llama3.2:3b

Used for:

* Answer generation
* Clean bullet responses
* Context-aware summaries

---

# 🚀 Development Phases

## 🟢 Phase-1 — Base RAG + UI Skeleton

✔ Setup Git repo & branches
✔ Built frontend layout
✔ Created backend APIs
✔ Connected Pinecone
✔ Mocked insights & KPIs
✔ Basic query handling

Purpose:

> “Make it work — even with fake data.”

---

## 🟡 Phase-2 — Dynamic Insights & Answer Formatting

✔ Added real insights flow
✔ Integrated **Ollama** instead of OpenAI
✔ Clean bullet-style answers
✔ Loading states
✔ Data sources visible
✔ UI polish

Purpose:

> “Make the answers look clean & human-friendly.”

---

## 🔵 Phase-3 — Smart KPIs + Auto Suggested Questions + Charts

✔ KPIs respond to data & queries
✔ Suggested questions generated
✔ Clicking them runs auto-analysis
✔ Auto-scroll to query box
✔ CSV preview → auto graph
✔ Chart labels rotated
✔ Prevented chart from crashing
✔ Made default state blank
✔ Improved performance

Purpose:

> “Make the system feel intelligent & interactive.”

---

## 🟣 Phase-4 — Stability + Docs + Final Polish

✔ Prevented crashes
✔ Validated all chart data
✔ Llama model upgraded → **3.2:3b**
✔ Fixed UI & readability
✔ Final README + explanation
✔ Branch workflow cleaned
✔ Ready for demo & submission

Purpose:

> “Make it stable, fast, documented & production-ready.”

---

# 🧪 How To Run Locally

### Backend

```bash
cd back-end
npm install
npm start
```

Requires:

```
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
```

---

### Frontend

```bash
cd front-end/frontend
npm install
npm run dev
```

---

### Start Ollama

```bash
ollama run llama3.2:3b
```

Download once if needed:

```bash
ollama pull llama3.2:3b
```

---

# 🌟 Future Enhancements

🔲 Multi-file upload with combined insights
🔲 Chat interface on top of insights
🔲 Multiple graph styles
🔲 Export reports
🔲 Role-based dashboards

---

# ❤️ Team Vision

We wanted to build a tool that helps **non-technical people understand data easily** — without SQL or BI dashboards.

Upload → Ask → Understand.
Simple. Human. Insightful.
