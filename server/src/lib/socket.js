import jwt from 'jsonwebtoken'

export function setupSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Unauthorized'))
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET)
      next()
    } catch {
      next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`)
    socket.on('disconnect', () => {})
  })
}
