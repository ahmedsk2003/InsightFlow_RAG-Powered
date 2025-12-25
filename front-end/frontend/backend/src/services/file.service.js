import fs from 'fs'
import path from 'path'

const uploadsDir = path.join(process.cwd(), 'backend', 'uploads')

export function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
}

export function generateFileMeta(file) {
  return {
    id: file.filename,
    name: file.originalname,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    uploadedAt: new Date().toISOString(),
  }
}

export function listUploaded() {
  return fs.readdirSync(uploadsDir)
}

export function getFilePath(fileId) {
  return path.join(uploadsDir, fileId)
}

export function readTextSafe(fileId) {
  try {
    const filePath = getFilePath(fileId)
    const buffer = fs.readFileSync(filePath)
    // naive fallback: treat as utf-8 text; real impl should parse PDF/Doc/Excel
    return buffer.toString('utf-8')
  } catch (err) {
    console.warn('readTextSafe failed', err)
    return ''
  }
}

