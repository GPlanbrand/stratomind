/**
 * 积分流水查询接口
 * GET /api/points/transactions - 获取积分流水
 * GET /api/points/balance - 获取积分余额
 */

import { prisma } from '../../lib/db'
import { getUserFromRequest } from '../../lib/auth'
import { apiSuccess, apiError, apiUnauthorized } from '../../lib/api'


export default async function handler(req: Request) {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  if (req.method !== 'GET') {
    return apiError('方法不允许', 405)
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    return apiUnauthorized()
  }

  const url = new URL(req.url)
  const path = url.pathname.split('/').pop()

  try {
    // GET /api/points/balance - 获取积分余额
    if (path === 'balance') {
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          points: true,
          signInDays: true,
          lastSignInDate: true,
          memberLevel: true,
          memberExpiresAt: true
        }
      })

      // 计算今日是否已签到
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const lastSignIn = fullUser?.lastSignInDate ? new Date(fullUser.lastSignInDate) : null
      const canSignInToday = !lastSignIn || lastSignIn < today

      return apiSuccess({
        points: fullUser?.points || 0,
        signInDays: fullUser?.signInDays || 0,
        canSignInToday,
        memberLevel: fullUser?.memberLevel || 'normal',
        memberExpiresAt: fullUser?.memberExpiresAt
      })
    }

    // GET /api/points/transactions - 获取积分流水
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10)
    const type = url.searchParams.get('type') // earn, spend, expire

    const where: any = { userId: user.id }
    if (type) {
      where.type = type
    }

    const [transactions, total] = await Promise.all([
      prisma.pointsTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.pointsTransaction.count({ where })
    ])

    // 统计
    const stats = await prisma.pointsTransaction.aggregate({
      where: { userId: user.id },
      _sum: {
        amount: true
      }
    })

    const earned = await prisma.pointsTransaction.aggregate({
      where: { userId: user.id, type: 'earn' },
      _sum: { amount: true }
    })

    const spent = await prisma.pointsTransaction.aggregate({
      where: { userId: user.id, type: 'spend' },
      _sum: { amount: true }
    })

    return apiSuccess({
      transactions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      },
      stats: {
        totalEarned: Math.abs(earned._sum.amount || 0),
        totalSpent: Math.abs(spent._sum.amount || 0),
        balance: user.points
      }
    })

  } catch (error) {
    console.error('获取积分信息错误:', error)
    return apiError('获取积分信息失败', 500)
  }
}
