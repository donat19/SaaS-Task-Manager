import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.join(__dirname, '../../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

const router = Router()
router.use(requireAuth)

router.get('/task/:taskId', async (req, res, next) => {
  try {
    const attachments = await prisma.attachment.findMany({
      where: { taskId: Number(req.params.taskId) },
      include: { user: { select: { id: true, name: true } } },
    })
    res.json(attachments)
  } catch (e) { next(e) }
})

router.post('/task/:taskId', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.originalname,
        path: req.file.filename,
        size: req.file.size,
        taskId: Number(req.params.taskId),
        userId: req.user.id,
      },
      include: { user: { select: { id: true, name: true } } },
    })
    res.status(201).json(attachment)
  } catch (e) { next(e) }
})

router.post('/avatar', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' })
    const avatarUrl = `/uploads/${req.file.filename}`
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarUrl },
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    })
    res.json(user)
  } catch (e) { next(e) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const att = await prisma.attachment.findUnique({ where: { id: Number(req.params.id) } })
    if (!att) return res.status(404).json({ error: 'Not found' })
    if (att.userId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Forbidden' })
    fs.unlink(path.join(uploadDir, att.path), () => {})
    await prisma.attachment.delete({ where: { id: Number(req.params.id) } })
    res.status(204).end()
  } catch (e) { next(e) }
})

export default router
