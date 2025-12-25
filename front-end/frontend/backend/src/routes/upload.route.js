import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { ensureUploadsDir, generateFileMeta } from '../services/file.service.js'
import { nanoid } from '../utils/id.js'

ensureUploadsDir()

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), 'backend', 'uploads')),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${nanoid()}${ext}`)
  },
})

const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/vnd.ms-excel.sheet.macroenabled.12']

const fileFilter = (_req, file, cb) => {
  if (allowed.includes(file.mimetype) || allowed.some((type) => file.mimetype.startsWith(type))) {
    cb(null, true)
  } else {
    cb(new Error('Unsupported file type'))
  }
}

const upload = multer({ storage, fileFilter })

const router = Router()

router.post('/', upload.array('files'), async (req, res) => {
  try {
    const files = req.files || []
    if (!files.length) {
      return res.status(400).json({ error: 'No files uploaded' })
    }
    const mapped = files.map(generateFileMeta)
    return res.json({ files: mapped })
  } catch (err) {
    console.error('upload error', err)
    return res.status(400).json({ error: 'Upload failed' })
  }
})

export default router

