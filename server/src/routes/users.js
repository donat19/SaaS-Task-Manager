import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { writeAudit } from '../lib/audit.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true } })
    res.json(users)
  } catch (e) { next(e) }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (req.user.id !== id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
    const { name, avatar } = z.object({ name: z.string().min(2).max(64).optional(), avatar: z.string().url().optional() }).parse(req.body)
    const user = await prisma.user.update({ where: { id }, data: { name, avatar }, select: { id: true, name: true, email: true, role: true, avatar: true } })
    res.json(user)
  } catch (e) { next(e) }
})

router.patch('/:id/role', requireAdmin, async (req, res, next) => {
  try {
    const { role } = z.object({ role: z.enum(['admin', 'user']) }).parse(req.body)
    const id = Number(req.params.id)
    const user = await prisma.user.update({ where: { id }, data: { role }, select: { id: true, name: true, role: true } })
    await writeAudit({ action: 'role_change', entity: 'user', entityId: id, actorId: req.user.id, meta: { role } })
    res.json(user)
  } catch (e) { next(e) }
})

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' })
    await prisma.user.delete({ where: { id } })
    await writeAudit({ action: 'delete', entity: 'user', entityId: id, actorId: req.user.id, meta: {} })
    res.status(204).end()
  } catch (e) { next(e) }
})

export default router
