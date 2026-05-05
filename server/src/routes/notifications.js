import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(notifications)
  } catch (e) { next(e) }
})

router.patch('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user.id, read: false }, data: { read: true } })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

router.patch('/:id/read', async (req, res, next) => {
  try {
    const n = await prisma.notification.findUnique({ where: { id: Number(req.params.id) } })
    if (!n || n.userId !== req.user.id) return res.status(404).json({ error: 'Not found' })
    res.json(await prisma.notification.update({ where: { id: n.id }, data: { read: true } }))
  } catch (e) { next(e) }
})

export default router
