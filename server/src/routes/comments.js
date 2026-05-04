import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { io } from '../index.js'

const router = Router()
router.use(requireAuth)

router.get('/task/:taskId', async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: Number(req.params.taskId) },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    })
    res.json(comments)
  } catch (e) { next(e) }
})

router.post('/task/:taskId', async (req, res, next) => {
  try {
    const { text } = z.object({ text: z.string().min(1) }).parse(req.body)
    const comment = await prisma.comment.create({
      data: { text, taskId: Number(req.params.taskId), userId: req.user.id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })
    io.emit('comment:added', comment)
    res.status(201).json(comment)
  } catch (e) { next(e) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: Number(req.params.id) } })
    if (!comment) return res.status(404).json({ error: 'Not found' })
    if (comment.userId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Forbidden' })
    await prisma.comment.delete({ where: { id: Number(req.params.id) } })
    res.status(204).end()
  } catch (e) { next(e) }
})

export default router
