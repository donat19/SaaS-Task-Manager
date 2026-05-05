import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const now = new Date()

    // Basic counts
    const [total, done, inProgress, overdue] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: 'done' } }),
      prisma.task.count({ where: { status: { in: ['in_progress', 'in_review'] } } }),
      prisma.task.count({
        where: { dueDate: { lt: now }, status: { not: 'done' } },
      }),
    ])

    // Tasks by status
    const byStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    // Tasks by priority
    const byPriority = await prisma.task.groupBy({
      by: ['priority'],
      _count: { id: true },
    })

    // Weekly completions — last 8 weeks
    const weeks = []
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now)
      start.setDate(now.getDate() - i * 7)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(start.getDate() + 7)

      const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const created = await prisma.task.count({ where: { createdAt: { gte: start, lt: end } } })
      const completed = await prisma.task.count({ where: { status: 'done', updatedAt: { gte: start, lt: end } } })
      weeks.push({ label, created, completed })
    }

    // Top assignees by completed tasks
    const assigneeStats = await prisma.taskAssignee.findMany({
      where: { task: { status: 'done' } },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })
    const assigneeMap = {}
    for (const a of assigneeStats) {
      const key = a.userId
      if (!assigneeMap[key]) assigneeMap[key] = { user: a.user, count: 0 }
      assigneeMap[key].count++
    }
    const topAssignees = Object.values(assigneeMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Tasks created in last 30 days
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)
    const recentlyCreated = await prisma.task.count({ where: { createdAt: { gte: thirtyDaysAgo } } })

    res.json({
      summary: { total, done, inProgress, overdue, recentlyCreated },
      byStatus,
      byPriority,
      weekly: weeks,
      topAssignees,
    })
  } catch (e) { next(e) }
})

export default router
