import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import analyzeRouter from './routes/analyze.route.js'
import uploadRouter from './routes/upload.route.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const PORT = process.env.PORT || 4000
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

app.use('/api/analyze', analyzeRouter)
app.use('/api/upload', uploadRouter)

app.use((err, _req, res, _next) => {
  console.error('API error:', err)
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? String(err) : undefined,
  })
})

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})

