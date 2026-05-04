import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) return res.json({ tasks: [], comments: [] })

    const [tasks, comments] = await Promise.all([
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        include: {
          assignees: { include: { user: { select: { id: true, name: true, avatar: true } } } },
          tags: { include: { tag: true } },
        },
        take: 20,
      }),
      prisma.comment.findMany({
        where: { text: { contains: q } },
        include: {
          user: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
        take: 10,
      }),
    ])

    res.json({ tasks, comments })
  } catch (e) { next(e) }
})

export default router
