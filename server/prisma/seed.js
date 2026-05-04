import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const adminPass = await bcrypt.hash('admin123', 10)
  const userPass = await bcrypt.hash('user123', 10)

  const alice = await prisma.user.upsert({
    where: { email: 'alice@strata.app' },
    update: {},
    create: { name: 'Alice Chen', email: 'alice@strata.app', password: adminPass, role: 'admin' },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@strata.app' },
    update: {},
    create: { name: 'Bob Kim', email: 'bob@strata.app', password: userPass, role: 'user' },
  })

  const carol = await prisma.user.upsert({
    where: { email: 'carol@strata.app' },
    update: {},
    create: { name: 'Carol Ray', email: 'carol@strata.app', password: userPass, role: 'user' },
  })

  const tags = await Promise.all([
    prisma.tag.upsert({ where: { name: 'design' }, update: {}, create: { name: 'design', color: '#7c3aed' } }),
    prisma.tag.upsert({ where: { name: 'eng' }, update: {}, create: { name: 'eng', color: '#2563eb' } }),
    prisma.tag.upsert({ where: { name: 'bug' }, update: {}, create: { name: 'bug', color: '#dc2626' } }),
    prisma.tag.upsert({ where: { name: 'research' }, update: {}, create: { name: 'research', color: '#059669' } }),
    prisma.tag.upsert({ where: { name: 'mkt' }, update: {}, create: { name: 'mkt', color: '#d97706' } }),
    prisma.tag.upsert({ where: { name: 'ops' }, update: {}, create: { name: 'ops', color: '#6b7280' } }),
  ])

  const tasks = [
    { title: 'Redesign onboarding flow', description: 'Improve first-run experience for new users', status: 'in_progress', priority: 'high', tagIdx: [0, 1], assignees: [alice.id, bob.id] },
    { title: 'Fix login redirect bug', description: 'Users are not redirected after login on mobile', status: 'todo', priority: 'urgent', tagIdx: [2], assignees: [bob.id] },
    { title: 'Write API documentation', description: 'Document all REST endpoints using OpenAPI spec', status: 'backlog', priority: 'medium', tagIdx: [1], assignees: [carol.id] },
    { title: 'Conduct user interviews', description: 'Talk to 10 power users about their workflow', status: 'todo', priority: 'high', tagIdx: [3], assignees: [alice.id] },
    { title: 'Set up CI/CD pipeline', description: 'Automate testing and deployment with GitHub Actions', status: 'in_review', priority: 'high', tagIdx: [1, 5], assignees: [bob.id, carol.id] },
    { title: 'Launch Q1 marketing campaign', description: 'Email blast + social media rollout', status: 'backlog', priority: 'medium', tagIdx: [4], assignees: [carol.id] },
    { title: 'Optimize database queries', description: 'Slow queries on task listing endpoint', status: 'done', priority: 'high', tagIdx: [1, 2], assignees: [bob.id] },
  ]

  for (const t of tasks) {
    await prisma.task.create({
      data: {
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assignees: { create: t.assignees.map(uid => ({ userId: uid })) },
        tags: { create: t.tagIdx.map(i => ({ tagId: tags[i].id })) },
      },
    })
  }

  console.log('Seed complete!')
  console.log('Admin: alice@strata.app / admin123')
  console.log('User:  bob@strata.app  / user123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
