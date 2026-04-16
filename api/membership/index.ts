/**
 * 会员系统接口
 * GET /api/membership/info - 获取会员信息
 * GET /api/membership/plans - 获取会员套餐列表
 * POST /api/membership/subscribe - 开通/续费会员
 */

import { prisma } from '../../lib/db'
import { getUserFromRequest } from '../../lib/auth'
import { apiSuccess, apiError, apiUnauthorized, parseBody } from '../../lib/api'

// 会员等级配置
const MEMBER_LEVELS = {
  normal: { name: '普通会员', icon: '👤', discount: 1.0, dailyPoints: 0 },
  silver: { name: '白银会员', icon: '🥈', discount: 0.9, dailyPoints: 50 },
  gold: { name: '黄金会员', icon: '🥇', discount: 0.8, dailyPoints: 100 },
  diamond: { name: '钻石会员', icon: '💎', discount: 0.7, dailyPoints: 200 }
}

// 会员套餐配置
const MEMBER_PLANS = [
  { id: 'monthly_silver', name: '白银月卡', level: 'silver', price: 39, days: 30 },
  { id: 'monthly_gold', name: '黄金月卡', level: 'gold', price: 69, days: 30 },
  { id: 'monthly_diamond', name: '钻石月卡', level: 'diamond', price: 99, days: 30 },
  { id: 'yearly_silver', name: '白银年卡', level: 'silver', price: 299, days: 365 },
  { id: 'yearly_gold', name: '黄金年卡', level: 'gold', price: 599, days: 365 },
  { id: 'yearly_diamond', name: '钻石年卡', level: 'diamond', price: 999, days: 365 }
]


export default async function handler(req: Request) {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  const url = new URL(req.url)
  const path = url.pathname.split('/').pop()

  // GET /api/membership/plans - 获取套餐列表（无需登录）
  if (req.method === 'GET' && path === 'plans') {
    return apiSuccess({
      levels: MEMBER_LEVELS,
      plans: MEMBER_PLANS
    })
  }

  // 需要登录的接口
  const user = await getUserFromRequest(req)
  if (!user) {
    return apiUnauthorized()
  }

  // GET /api/membership/info - 获取会员信息
  if (req.method === 'GET') {
    try {
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          memberLevel: true,
          memberExpiresAt: true,
          points: true,
          signInDays: true
        }
      })

      const level = fullUser?.memberLevel || 'normal'
      const levelConfig = MEMBER_LEVELS[level as keyof typeof MEMBER_LEVELS]
      
      // 检查是否过期
      let isExpired = false
      if (fullUser?.memberExpiresAt) {
        isExpired = new Date() > new Date(fullUser.memberExpiresAt)
        if (isExpired && level !== 'normal') {
          // 自动降级为普通会员
          await prisma.user.update({
            where: { id: user.id },
            data: { memberLevel: 'normal', memberExpiresAt: null }
          })
        }
      }

      // 计算剩余天数
      let remainingDays = 0
      if (fullUser?.memberExpiresAt && !isExpired) {
        const diff = new Date(fullUser.memberExpiresAt).getTime() - Date.now()
        remainingDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
      }

      return apiSuccess({
        level: isExpired ? 'normal' : level,
        levelConfig,
        expiresAt: fullUser?.memberExpiresAt,
        remainingDays,
        isExpired,
        points: fullUser?.points || 0,
        signInDays: fullUser?.signInDays || 0
      })

    } catch (error) {
      console.error('获取会员信息错误:', error)
      return apiError('获取会员信息失败', 500)
    }
  }

  // POST /api/membership/subscribe - 开通会员
  if (req.method === 'POST') {
    try {
      const body = await parseBody<{ planId: string }>(req)
      if (!body?.planId) {
        return apiError('请选择套餐')
      }

      const plan = MEMBER_PLANS.find(p => p.id === body.planId)
      if (!plan) {
        return apiError('套餐不存在')
      }

      // 获取当前用户信息
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id }
      })

      if (!fullUser) {
        return apiError('用户不存在', 404)
      }

      // 检查积分是否足够（如果用积分购买）
      // 实际项目中应该调用支付接口
      // 这里仅作演示，模拟开通成功

      // 计算到期时间
      let expiresAt: Date
      if (fullUser.memberExpiresAt && new Date(fullUser.memberExpiresAt) > new Date()) {
        // 已有会员，延长
        expiresAt = new Date(fullUser.memberExpiresAt)
        expiresAt.setDate(expiresAt.getDate() + plan.days)
      } else {
        // 新开通
        expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + plan.days)
      }

      // 更新会员信息
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          memberLevel: plan.level,
          memberExpiresAt: expiresAt
        }
      })

      // 记录积分变动（赠送积分）
      const bonusPoints = MEMBER_LEVELS[plan.level as keyof typeof MEMBER_LEVELS].dailyPoints
      if (bonusPoints > 0) {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { points: { increment: bonusPoints } }
          }),
          prisma.pointsTransaction.create({
            data: {
              userId: user.id,
              type: 'earn',
              amount: bonusPoints,
              balanceAfter: updatedUser.points + bonusPoints,
              source: 'membership',
              description: `开通${plan.name}赠送积分`
            }
          })
        ])
      }

      return apiSuccess({
        level: plan.level,
        levelConfig: MEMBER_LEVELS[plan.level as keyof typeof MEMBER_LEVELS],
        expiresAt,
        plan
      }, `开通${plan.name}成功`)

    } catch (error) {
      console.error('开通会员错误:', error)
      return apiError('开通会员失败', 500)
    }
  }

  return apiError('方法不允许', 405)
}
