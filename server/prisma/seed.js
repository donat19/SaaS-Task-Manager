import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding tags...')

  await Promise.all([
    prisma.tag.upsert({ where: { name: 'design' },   update: {}, create: { name: 'design',   color: '#7c3aed' } }),
    prisma.tag.upsert({ where: { name: 'eng' },      update: {}, create: { name: 'eng',      color: '#2563eb' } }),
    prisma.tag.upsert({ where: { name: 'bug' },      update: {}, create: { name: 'bug',      color: '#dc2626' } }),
    prisma.tag.upsert({ where: { name: 'research' }, update: {}, create: { name: 'research', color: '#059669' } }),
    prisma.tag.upsert({ where: { name: 'mkt' },      update: {}, create: { name: 'mkt',      color: '#d97706' } }),
    prisma.tag.upsert({ where: { name: 'ops' },      update: {}, create: { name: 'ops',      color: '#6b7280' } }),
  ])

  console.log('Seed complete. Register at /register to create your admin account.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
