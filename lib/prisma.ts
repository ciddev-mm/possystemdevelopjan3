import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Enable WAL mode for SQLite to prevent "database is locked" errors under load
prisma.$queryRawUnsafe('PRAGMA journal_mode=WAL;')
  .catch(err => console.error('Failed to enable WAL mode:', err))


if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


