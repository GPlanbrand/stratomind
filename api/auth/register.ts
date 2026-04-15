/**
 * 用户注册接口
 * POST /api/auth/register
 */

import { prisma } from '../../lib/db'
import { hashPassword, generateToken, generateInviteCode } from '../../lib/auth'
import { apiSuccess, apiError, parseBody } from '../../lib/api'

export const config = {
  runtime: 'edge'
}

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
      username: string
      email: string
      password: string
      inviteCode?: string
    }>(req)

    if (!body?.username || !body.email || !body.password) {
      return apiError('请填写完整信息')
    }

    const { username, email, password, inviteCode } = body

    // 验证用户名长度
    if (username.length < 2 || username.length > 20) {
      return apiError('用户名长度需在2-20字符之间')
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return apiError('邮箱格式不正确')
    }

    // 验证密码长度
    if (password.length < 6) {
      return apiError('密码至少6位')
    }

    // 检查邮箱是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      return apiError('该邮箱已被注册')
    }

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })
    if (existingUsername) {
      return apiError('该用户名已被使用')
    }

    // 处理邀请码
    let invitedBy: string | undefined
    if (inviteCode) {
      const inviter = await prisma.user.findUnique({
        where: { inviteCode }
      })
      if (!inviter) {
        return apiError('邀请码无效')
      }
      invitedBy = inviter.id
    }

    // 创建用户
    const passwordHash = await hashPassword(password)
    const newInviteCode = generateInviteCode()
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        inviteCode: newInviteCode,
        invitedBy,
        points: 600, // 注册赠送600积分
        memberLevel: 'normal'
      }
    })

    // 如果有邀请人，给邀请人加积分
    if (invitedBy) {
      await prisma.user.update({
        where: { id: invitedBy },
        data: { points: { increment: 50 } }
      })
      
      // 记录邀请积分
      await prisma.pointsTransaction.create({
        data: {
          userId: invitedBy,
          type: 'earn',
          amount: 50,
          balanceAfter: (await prisma.user.findUnique({ where: { id: invitedBy } }))!.points,
          source: 'invite',
          description: `邀请用户 ${username} 注册`
        }
      })
    }

    // 记录注册积分
    await prisma.pointsTransaction.create({
      data: {
        userId: user.id,
        type: 'earn',
        amount: 600,
        balanceAfter: 600,
        source: 'register',
        description: '注册赠送'
      }
    })

    // 生成Token
    const token = generateToken(user.id)

    return apiSuccess({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        memberLevel: user.memberLevel,
        points: user.points,
        inviteCode: user.inviteCode,
        createdAt: user.createdAt
      },
      token
    }, '注册成功！已赠送600积分')

  } catch (error) {
    console.error('注册错误:', error)
    return apiError('注册失败，请稍后重试', 500)
  }
}
