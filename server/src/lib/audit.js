import prisma from './prisma.js'

export async function writeAudit({ action, entity, entityId, actorId, meta = {} }) {
  await prisma.auditLog.create({
    data: { action, entity, entityId: String(entityId), actorId, meta },
  })
}
