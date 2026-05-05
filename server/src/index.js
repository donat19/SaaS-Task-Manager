import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import commentRoutes from './routes/comments.js'
import attachmentRoutes from './routes/attachments.js'
import userRoutes from './routes/users.js'
import tagRoutes from './routes/tags.js'
import notificationRoutes from './routes/notifications.js'
import searchRoutes from './routes/search.js'
import auditRoutes from './routes/audit.js'
import statsRoutes from './routes/stats.js'
import { errorHandler } from './middleware/errorHandler.js'
import { setupSocket } from './lib/socket.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const httpServer = createServer(app)

export const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
})

setupSocket(io)

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })
app.use('/api', limiter)

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/attachments', attachmentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/stats', statsRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
