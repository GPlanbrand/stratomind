/**
 * 用户登录接口
 * POST /api/auth/login
 */

import { prisma } from '../../lib/db'
import { verifyPassword, generateToken } from '../../lib/auth'
import { apiSuccess, apiError, parseBody } from '../../lib/api'


export default async function handler(req: Request) {
  // CORS预检
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  if (req.method !== 'POST') {
    return apiError('方法不允许', 405)
  }

  try {
    const body = await parseBody<{
      email: string
      password: string
    }>(req)

    if (!body?.email || !body.password) {
      return apiError('请输入邮箱和密码')
    }

    const { email, password } = body

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return apiError('邮箱或密码错误')
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return apiError('邮箱或密码错误')
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // 生成Token
    const token = generateToken(user.id)

    return apiSuccess({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        memberLevel: user.memberLevel,
        points: user.points,
        memberExpiresAt: user.memberExpiresAt,
        signInDays: user.signInDays,
        lastSignInDate: user.lastSignInDate,
        inviteCode: user.inviteCode,
        createdAt: user.createdAt
      },
      token
    }, '登录成功')

  } catch (error) {
    console.error('登录错误:', error)
    return apiError('登录失败，请稍后重试', 500)
  }
}
