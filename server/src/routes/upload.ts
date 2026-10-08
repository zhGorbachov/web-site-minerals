import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Router } from 'express'
import multer from 'multer'
import { requireAdmin } from '../lib/auth.js'
import { processNewUpload } from '../lib/mediaProcess.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const uploadsDir = path.resolve(__dirname, '../../uploads')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}-${safe}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 80 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/')
    if (ok) cb(null, true)
    else cb(new Error('Only image and video files are allowed'))
  },
})

export const uploadRouter = Router()

uploadRouter.post('/', requireAdmin, upload.array('files', 12), async (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined
  if (!files?.length) {
    res.status(400).json({ error: 'No files uploaded' })
    return
  }

  const stored = []
  for (const file of files) {
    const result = await processNewUpload(file.path, file.mimetype)
    stored.push({
      url: `/uploads/${path.basename(result.filePath)}`,
      type: result.type,
      name: file.originalname,
      size: result.size,
    })
  }

  res.status(201).json({ files: stored })
})
