/**
 * 每日签到接口
 * POST /api/auth/signin
 */

import { prisma } from '../../lib/db'
import { getUserFromRequest, hasSignedToday, calculateSignInStreak } from '../../lib/auth'
import { apiSuccess, apiError, apiUnauthorized } from '../../lib/api'


// 签到积分规则
const POINTS_RULES = {
  dailySignIn: 10,      // 每日签到基础积分
  signInStreak: 5,      // 连续签到额外奖励（每天+5）
  maxStreakBonus: 50    // 最大连续签到奖励上限
}

export default async function handler(req: Request) {
  // CORS预检
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  if (req.method !== 'POST') {
    return apiError('方法不允许', 405)
  }

  try {
    const user = await getUserFromRequest(req)
    
    if (!user) {
      return apiUnauthorized()
    }

    // 获取完整用户信息
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!fullUser) {
      return apiUnauthorized()
    }

    // 检查今天是否已签到
    if (hasSignedToday(fullUser.lastSignInDate)) {
      return apiError('今天已签到，明天再来吧')
    }

    // 计算连续签到天数
    const newStreak = calculateSignInStreak(fullUser.lastSignInDate, fullUser.signInDays)
    
    // 计算签到积分
    const streakBonus = Math.min((newStreak - 1) * POINTS_RULES.signInStreak, POINTS_RULES.maxStreakBonus)
    const totalPoints = POINTS_RULES.dailySignIn + streakBonus

    // 更新用户数据
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastSignInDate: new Date(),
        signInDays: newStreak,
        points: { increment: totalPoints }
      }
    })

    // 记录积分流水
    await prisma.pointsTransaction.create({
      data: {
        userId: user.id,
        type: 'earn',
        amount: totalPoints,
        balanceAfter: updatedUser.points,
        source: 'signIn',
        description: `每日签到（连续${newStreak}天）`
      }
    })

    return apiSuccess({
      points: totalPoints,
      streak: newStreak,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        points: updatedUser.points,
        signInDays: updatedUser.signInDays,
        lastSignInDate: updatedUser.lastSignInDate
      }
    }, `签到成功！获得${totalPoints}积分${newStreak > 1 ? `（连续${newStreak}天）` : ''}`)

  } catch (error) {
    console.error('签到错误:', error)
    return apiError('签到失败，请稍后重试', 500)
  }
}
