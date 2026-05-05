import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  next()
}

export function requirePerm(perm) {
  return (req, res, next) => {
    if (req.user?.role === 'admin') return next()
    const perms = req.user?.permissions || {}
    if (!perms[perm]) return res.status(403).json({ error: `Permission denied: ${perm}` })
    next()
  }
}
