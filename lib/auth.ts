/**
 * 认证工具
 * JWT生成/验证 + 密码加密
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'stratomind-secret-key-2024'
const JWT_EXPIRES = '7d'

// ==================== 密码处理 ====================

/**
 * 密码加密
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10)
}

/**
 * 密码验证
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

// ==================== JWT处理 ====================

/**
 * 生成JWT Token
 */
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

/**
 * 验证JWT Token
 */
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

// ==================== 用户工具 ====================

/**
 * 生成邀请码
 */
export const generateInviteCode = (): string => {
  return 'SM' + Math.random().toString(36).substr(2, 6).toUpperCase()
}

/**
 * 从请求头获取当前用户
 */
export const getUserFromRequest = async (req: Request): Promise<{
  id: string
  username: string
  email: string
  memberLevel: string
  points: number
} | null> => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      email: true,
      memberLevel: true,
      points: true
    }
  })

  return user
}

/**
 * 检查用户是否已签到今天
 */
export const hasSignedToday = (lastSignInDate: Date | null): boolean => {
  if (!lastSignInDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lastDate = new Date(lastSignInDate)
  lastDate.setHours(0, 0, 0, 0)
  return today.getTime() === lastDate.getTime()
}

/**
 * 计算连续签到天数
 */
export const calculateSignInStreak = (lastSignInDate: Date | null, currentStreak: number): number => {
  if (!lastSignInDate) return 1
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const lastDate = new Date(lastSignInDate)
  lastDate.setHours(0, 0, 0, 0)
  
  // 如果昨天签到了，连续天数+1
  if (lastDate.getTime() === yesterday.getTime()) {
    return currentStreak + 1
  }
  
  // 如果今天已签到，保持当前天数
  if (lastDate.getTime() === today.getTime()) {
    return currentStreak
  }
  
  // 否则重置为1
  return 1
}
