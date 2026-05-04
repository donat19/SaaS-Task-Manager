import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Number(req.query.limit) || 50)
    const { action, entity } = req.query

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          ...(action && { action: String(action) }),
          ...(entity && { entity: String(entity) }),
        },
        include: { actor: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count(),
    ])

    res.json({ logs, total, page, pages: Math.ceil(total / limit) })
  } catch (e) { next(e) }
})

export default router
