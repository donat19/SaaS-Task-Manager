import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const registerSchema = z.object({
  name: z.string().min(2).max(64),
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body)
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: 'Email already registered' })
    const hash = await bcrypt.hash(password, 10)
    const isFirst = (await prisma.user.count()) === 0
    const user = await prisma.user.create({
      data: { name, email, password: hash, role: isFirst ? 'admin' : 'user' },
    })
    res.status(201).json({ token: signToken(user), user: sanitize(user) })
  } catch (e) {
    next(e)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' })
    res.json({ token: signToken(user), user: sanitize(user) })
  } catch (e) {
    next(e)
  }
})

// Generate a short-lived invite token (admin only)
router.post('/invite', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
    const token = jwt.sign({ invite: true }, process.env.JWT_SECRET, { expiresIn: '48h' })
    res.json({ token, expiresIn: '48 hours' })
  } catch (e) { next(e) }
})

// Register via invite token
router.post('/register/invite', async (req, res, next) => {
  try {
    const { token, name, email, password } = z.object({
      token: z.string(),
      name: z.string().min(2).max(64),
      email: z.string().email(),
      password: z.string().min(6),
    }).parse(req.body)

    // Verify invite token
    try { jwt.verify(token, process.env.JWT_SECRET) }
    catch { return res.status(400).json({ error: 'Invite link is invalid or expired' }) }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: 'Email already registered' })
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hash, role: 'user' },
    })
    res.status(201).json({ token: signToken(user), user: sanitize(user) })
  } catch (e) { next(e) }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(sanitize(user))
  } catch (e) {
    next(e)
  }
})

function sanitize(u) {
  const { password, ...rest } = u
  return rest
}

export default router
