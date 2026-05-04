import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { writeAudit } from '../lib/audit.js'
import { io } from '../index.js'

const router = Router()
router.use(requireAuth)

const taskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().optional().nullable(),
  assigneeIds: z.array(z.number().int()).optional(),
  tagIds: z.array(z.number().int()).optional(),
})

router.get('/', async (req, res, next) => {
  try {
    const { status, priority, assigneeId, tagId } = req.query
    const tasks = await prisma.task.findMany({
      where: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assigneeId && { assignees: { some: { userId: Number(assigneeId) } } }),
        ...(tagId && { tags: { some: { tagId: Number(tagId) } } }),
      },
      include: taskInclude,
      orderBy: { createdAt: 'desc' },
    })
    res.json(tasks)
  } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    const { assigneeIds = [], tagIds = [], ...data } = taskSchema.parse(req.body)
    const task = await prisma.task.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assignees: { create: assigneeIds.map(uid => ({ userId: uid })) },
        tags: { create: tagIds.map(tid => ({ tagId: tid })) },
      },
      include: taskInclude,
    })
    await writeAudit({ action: 'create', entity: 'task', entityId: task.id, actorId: req.user.id })
    io.emit('task:created', task)
    res.status(201).json(task)
  } catch (e) { next(e) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: Number(req.params.id) }, include: taskInclude })
    if (!task) return res.status(404).json({ error: 'Not found' })
    res.json(task)
  } catch (e) { next(e) }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const { assigneeIds, tagIds, ...data } = taskSchema.partial().parse(req.body)
    const id = Number(req.params.id)
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
        ...(assigneeIds !== undefined && {
          assignees: { deleteMany: {}, create: assigneeIds.map(uid => ({ userId: uid })) },
        }),
        ...(tagIds !== undefined && {
          tags: { deleteMany: {}, create: tagIds.map(tid => ({ tagId: tid })) },
        }),
      },
      include: taskInclude,
    })
    await writeAudit({ action: 'update', entity: 'task', entityId: id, actorId: req.user.id })
    io.emit('task:updated', task)
    res.json(task)
  } catch (e) { next(e) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    await prisma.task.delete({ where: { id } })
    await writeAudit({ action: 'delete', entity: 'task', entityId: id, actorId: req.user.id })
    io.emit('task:deleted', { id })
    res.status(204).end()
  } catch (e) { next(e) }
})

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']) }).parse(req.body)
    const id = Number(req.params.id)
    const task = await prisma.task.update({ where: { id }, data: { status }, include: taskInclude })
    io.emit('task:moved', { id, status })
    res.json(task)
  } catch (e) { next(e) }
})

const taskInclude = {
  assignees: { include: { user: { select: { id: true, name: true, avatar: true } } } },
  tags: { include: { tag: true } },
  _count: { select: { comments: true, attachments: true } },
}

export default router
