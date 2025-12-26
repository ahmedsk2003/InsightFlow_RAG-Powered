import { useRef, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'

const salesYearPoints = [
  { label: 'Apr', value: 120 },
  { label: 'May', value: 135 },
  { label: 'Jun', value: 155 },
  { label: 'Jul', value: 165 },
  { label: 'Aug', value: 180 },
  { label: 'Sep', value: 190 },
  { label: 'Oct', value: 205 },
  { label: 'Nov', value: 220 },
  { label: 'Dec', value: 240 },
  { label: 'Jan', value: 230 },
  { label: 'Feb', value: 245 },
  { label: 'Mar', value: 260 },
]

const suggestedQuestions = [
  'Compare regional performance',
  'What if we increase marketing budget by 10%?',
  'Which products drive the highest Q4 margin?',
  'Identify segments with rising churn risk',
  'Seasonality impact over the last 3 years',
]

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadedFileIds, setUploadedFileIds] = useState([])
  const [prompt, setPrompt] = useState('')
  const [activeQuestion, setActiveQuestion] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState([])
  


 const [insight, setInsight] = useState({
  summary: '',
  kpis: [],
  recommendations: [],
  chartData: [],
  sources: [],
  chartTitle: ''
})
  const inputRef = useRef(null)
  const queryRef = useRef(null)   
  const location = useLocation()
//Upload Api function
  const uploadFilesToApi = async (selectedFiles) => {
    const fd = new FormData()
    selectedFiles.forEach((file) => fd.append('files', file))
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: fd,
    })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.files || []
  }

  const runAnalyzeApi = async (query, fileIds) => {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, files: fileIds }),
    })
    if (!res.ok) throw new Error('Analyze failed')
    return res.json()
  }
//For uploading files
  const handleFiles = async (fileList) => {
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv']
    const filesArray = Array.from(fileList || [])

    const accepted = []
    let rejected = false

    filesArray.forEach((file) => {
      const ext = (file.name.split('.').pop() || '').toLowerCase()
      if (allowedExtensions.includes(ext)) {
        accepted.push(file)
        //   {
        //   name: file.name,
        //   size: file.size,
        //   id: crypto.randomUUID(),
        // }
     
      } else {
        rejected = true
      }
    })
/////


   if (accepted.length) {
  try {
    setLoading(true)
    setError('')

    const uploaded = await uploadFilesToApi(accepted)

    setUploadedFiles(uploaded.map(f => ({
      name: f.name,
      size: f.size,
      id: f.id
    })))

    setUploadedFileIds(uploaded.map(f => f.id))

    // Request preview (headers → charts → suggested Qs)
    const fd = new FormData()
    accepted.forEach(f => fd.append("file", f))

    const previewRes = await fetch(`${API_BASE}/preview`, {
      method: "POST",
      body: fd
    })

    const preview = await previewRes.json()

    // ONLY update using preview if available
    setInsight(prev => ({
      ...prev,
      kpis: preview.kpis || prev.kpis,
      chartData: preview.chartData || prev.chartData
    }))

    if (preview.suggested) {
      setSuggestedQuestions(preview.suggested)
    }

  } catch (err) {
    console.error(err)
    setError('Upload failed. Please try again.')
  } finally {
    setLoading(false)
  }
}

    setUploadError(
      rejected ? 'Only PDF, DOC/DOCX, XLS/XLSX, and CSV files are supported.' : ''
    )
  }

  const handleDrop = (event) => {
    event.preventDefault()
    handleFiles(event.dataTransfer.files)
  }

  const handleAnalyze = async (text) => {
  const query = (text ?? prompt).trim()
  if (!query) return

  setLoading(true)
  setError('')

  try {
    const result = await runAnalyzeApi(query, uploadedFileIds)

    setInsight(prev => ({
      ...prev,
      summary: result.summary || prev.summary,
      kpis: result.kpis?.length ? result.kpis : prev.kpis,
      chartData: result.chartData?.length ? result.chartData : prev.chartData,
      sources: result.sources || prev.sources
    }))

    setSuggestedQuestions(result.suggestedQuestions || [])

  } catch (err) {
    console.error(err)
    setError('Analysis failed. Please try again.')
  } finally {
    setLoading(false)
  }
}


  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1)
    return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
  }

  const kpisToShow = insight.kpis || []

const chartPoints = Array.isArray(insight.chartData)
  ? insight.chartData
  : [];


  const recommendationsToShow =
    insight.recommendations.length > 0
      ? insight.recommendations
      : ['Awaiting analysis to generate recommendations.']

  // const sourcesToShow =
  //   insight.sources.length > 0
  //     ? insight.sources
  //     : uploadedFiles.length > 0
  //       ? uploadedFiles.map((f) => f.name)
  //       : ['No sources yet']
  const sourcesToShow =
  (insight.sources && insight.sources.length > 0
    ? insight.sources
    : uploadedFiles.length > 0
    ? uploadedFiles.map((f) => f.name)
    : ['No sources yet']
  ).map((s) =>
    typeof s === 'string'
      ? { source: s, snippet: '' }
      : s
  );


  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <span className="pulse-dot" />
            <span className="pulse-dot secondary" />
          </div>
          <span className="brand-name">InsightFlow AI</span>
        </div>
        <nav className="main-nav">
          <Link className="nav-link" to="/">
            Dashboard
          </Link>
          <Link className="nav-link" to="/about">
            About Us
          </Link>
          <Link className="nav-link" to="/contact">
            Contact Us
          </Link>
        </nav>
        <div className="top-actions">
          <button className="ghost-btn" aria-label="Notifications">
            <span className="icon">🔔</span>
          </button>
          <button className="ghost-btn" aria-label="Settings">
            <span className="icon">⚙️</span>
          </button>
          <div className="avatar" aria-label="Profile">
            <span>JD</span>
          </div>
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route
            path="/"
            element={
              <section className="prompt-card">

          <div className="prompt-input">
            <input
            ref={queryRef}   // ← add this
            type="text"
            placeholder="Predict sales for Q4 based on historical trends..."
            aria-label="Insight prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
  />
            
            <button
              className="primary-btn"
              onClick={() => handleAnalyze()}
              disabled={loading}
            >
              {loading ? 'Working...' : 'Analyze'}
            </button>
          </div>
          <section
            className="upload-card"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
          >
            <div className="upload-icon">📂</div>
            <div className="upload-text">
              <p className="upload-title">Upload data sources</p>
              <p className="upload-sub">
                Drop PDF, DOC/DOCX, XLS/XLSX, or CSV files, or browse to attach
              </p>
            </div>
            <button className="primary-btn ghost">Browse files</button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden-input"
            />
          </section>

          {uploadError && <p className="upload-error">{uploadError}</p>}
          {error && <p className="upload-error">{error}</p>}

          {uploadedFiles.length > 0 && (
            <div className="upload-list">
              <div className="upload-list-header">Attached files</div>
              <ul>
                {uploadedFiles.map((file) => (
                  <li key={file.id}>
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{formatSize(file.size)}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
            }
          />
          <Route
            path="/about"
            element={
              <section className="page-shell">
                <About />
              </section>
            }
          />
          <Route
            path="/contact"
            element={
              <section className="page-shell">
                <Contact />
              </section>
            }
          />
        </Routes>

        {location.pathname === '/' && (
          <section className="dashboard">
          <div className="kpi-panel">
            <div className="panel-header">
              <h3>KPI Metric Cards</h3>
              <button className="link-btn">Show seasonal trends</button>
            </div>

            <div className="kpi-cards">
              {Array.isArray(kpisToShow) && kpisToShow.length > 0 ? (
                kpisToShow.map((kpi, idx) => (
                  <div
                    key={kpi.label}
                    className={`kpi-card ${idx === 0 ? 'primary' : idx === 2 ? 'subtle' : ''}`}
                  >
                    <span className="icon-box">📊</span>
                    <div>
                      <p className="kpi-value">{kpi.value}</p>
                      <p className="kpi-label">{kpi.label}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ opacity: 0.6 }}>
                  No KPIs yet — upload a file or run an analysis.
                </p>
              )}
</div>



            {suggestedQuestions.length > 0 && (
            <div className="suggested">
              <h4>Suggested Questions</h4>
              <div className="suggested-actions">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    className="secondary-btn"

                   onClick={() => {
                      setPrompt(question)

                     setTimeout(() => {
                      if (queryRef.current) {
                        queryRef.current.scrollIntoView({
                          behavior: "smooth",
                          block: "center"
                        })
                        queryRef.current.focus()
                        // optional → highlight text
                        // queryRef.current.select()
                      }
                    }, 80)

                      handleAnalyze(question)
                    }}

                                      >

                    {question}
                  </button>
                ))}
              </div>
            </div>
            )}
          </div>


          <div className="insight-panel">
            <div className="panel-header">
              <h3>Insight Output Card</h3>
            </div>

            <div className="insight-body">

           <div className="insight-text">
  {!insight.summary ? (
    <p>Awaiting analysis...</p>
  ) : (
    <ul style={{ 
      margin: 0,
      paddingLeft: "18px",
      fontSize: "15px",
      fontWeight: 400,
      lineHeight: "1.5"
    }}>
      {insight.summary
        .split('\n')
        .filter(line => line.trim() !== "")
        .map((line, i) => {
          // remove bullets, *, -, •, numbers like 1. 2)
          const cleaned = line
            .trim()
            .replace(/^[\s•*-\d\)\.]+/, "");

          return (
            <li key={i} style={{ marginBottom: "6px" }}>
              {cleaned}
            </li>
          );
        })}
    </ul>
  )}
</div>




              <div className="chart-section">
                <div className="chart-section-header">

                  
                <h4>
                  {insight.chartTitle || "Upload data to see trends"}
                </h4>
                  
                </div>

                 <div className="chart">
                  {Array.isArray(chartPoints) && chartPoints.length > 0 ? (
                    <Chart points={chartPoints} />
                  ) : (
                    <p style={{ opacity: 0.6 }}>
                      No chart data available yet.
                    </p>
                  )}
                </div>


                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-swatch legend-area" />
                    <span>Sales area</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-swatch legend-line" />
                    <span>Sales line</span>
                  </div>
                </div>
              </div>

              {/* <div className="recommendations">
                <h4>Recommendations</h4>
                <ul>
                  {recommendationsToShow.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div> */}

              <div className="data-sources">
                <h4>Data Sources:</h4>
                <div className="source-actions">
                  
                  {/* {sourcesToShow.map((source, idx) => (
                    <button key={idx} className="primary-btn ghost">
                      {source}
                    </button>
                  ))} */}
                    {sourcesToShow.map((s, idx) => (
                     <button key={idx} className="primary-btn ghost">
                      {s.source}
                     </button>
                  ))}


                </div>
              </div>
            </div>
          </div>
        </section>
        )}
      </main>
    </div>
  )
}
function Chart({ points = [] }) {
  // ---- SAFETY NET so app NEVER crashes ----
  if (!Array.isArray(points) || points.length === 0) {
    return (
      <p style={{ opacity: 0.6 }}>
        No chart data available yet.
      </p>
    );
  }

  // Normalize missing fields
  const safePoints = points
    .filter(p => p && typeof p.value === "number")
    .map((p, i) => ({
      label: p.label || `Point ${i + 1}`,
      value: p.value
    }));

  if (safePoints.length === 0) {
    return (
      <p style={{ opacity: 0.6 }}>
        No valid chart data found.
      </p>
    );
  }

  const viewWidth = 760;
  const viewHeight = 360;
  const paddingX = 30;
  const paddingY = 28;
  const innerWidth = viewWidth - paddingX * 2;
  const innerHeight = viewHeight - paddingY * 2;

  const maxValue = Math.max(...safePoints.map(p => p.value));
  const minValue = Math.min(...safePoints.map(p => p.value));
  const range = Math.max(maxValue - minValue, 1);

  const stepX = innerWidth / Math.max(safePoints.length - 1, 1);

  const pathPoints = safePoints
    .map((p, idx) => {
      const x = paddingX + idx * stepX;
      const y =
        paddingY +
        innerHeight -
        ((p.value - minValue) / range) * innerHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = `
    M ${paddingX} ${paddingY + innerHeight}
    L ${pathPoints}
    L ${paddingX + innerWidth} ${paddingY + innerHeight}
    Z
  `;

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      preserveAspectRatio="none"
    >
      <g className="grid-lines">
        {[0, 0.25, 0.5, 0.75, 1].map(frac => (
          <line
            key={frac}
            x1="0"
            y1={paddingY + innerHeight * frac}
            x2={viewWidth}
            y2={paddingY + innerHeight * frac}
          />
        ))}
      </g>

      <path className="chart-area" d={areaPath} />
      <polyline className="chart-line" points={pathPoints} />

      {safePoints.map((p, idx) => (
        <circle
          key={idx}
          cx={paddingX + idx * stepX}
          cy={
            paddingY +
            innerHeight -
            ((p.value - minValue) / range) * innerHeight
          }
          r="6"
        />
      ))}

      <g className="axis-labels">
        {safePoints.map((p, idx) => (
          <text
            key={idx}
            x={paddingX + idx * stepX}
            y={paddingY + innerHeight + 28}
            textAnchor="end"
            transform={`rotate(-35 ${
              paddingX + idx * stepX
            } ${paddingY + innerHeight + 28})`}
            style={{ fontSize: "11px" }}
          >
            {(p.label || "").length > 12
              ? p.label.slice(0, 12) + "…"
              : p.label}
          </text>
        ))}
      </g>
    </svg>
  );
}



export default App;
