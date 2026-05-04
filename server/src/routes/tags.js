import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    res.json(await prisma.tag.findMany())
  } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, color } = z.object({ name: z.string().min(1), color: z.string().min(1) }).parse(req.body)
    res.status(201).json(await prisma.tag.create({ data: { name, color } }))
  } catch (e) { next(e) }
})

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.tag.delete({ where: { id: Number(req.params.id) } })
    res.status(204).end()
  } catch (e) { next(e) }
})

export default router
