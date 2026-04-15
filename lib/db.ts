/**
 * 数据库连接工具
 * 使用Prisma Client连接Vercel Postgres
 */

import { PrismaClient } from '@prisma/client'

// 在开发环境避免热重载创建多个Prisma实例
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
