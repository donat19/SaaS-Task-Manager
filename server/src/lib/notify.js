import prisma from './prisma.js'
import { io } from '../index.js'

export async function sendNotification({ userId, text, taskId = null }) {
  const n = await prisma.notification.create({
    data: { userId, text, taskId },
  })
  io.to(`user:${userId}`).emit('notification:new', n)
  return n
}
