/**
 * AI调用日志接口
 * GET /api/ai-logs - 获取AI调用日志
 * GET /api/ai-logs/stats - 获取AI使用统计
 * POST /api/ai-logs - 记录AI调用
 */

import { prisma } from '../../lib/db'
import { getUserFromRequest } from '../../lib/auth'
import { apiSuccess, apiError, apiUnauthorized, parseBody } from '../../lib/api'

export const config = {
  runtime: 'edge'
}

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

  const user = await getUserFromRequest(req)
  if (!user) {
    return apiUnauthorized()
  }

  const url = new URL(req.url)
  const path = url.pathname.split('/').pop()

  try {
    // GET /api/ai-logs/stats - 获取统计
    if (req.method === 'GET' && path === 'stats') {
      // 今日统计
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayLogs = await prisma.aiUsageLog.aggregate({
        where: {
          userId: user.id,
          createdAt: { gte: today }
        },
        _count: true,
        _sum: {
          tokensUsed: true,
          pointsCost: true
        }
      })

      // 本月统计
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const monthLogs = await prisma.aiUsageLog.aggregate({
        where: {
          userId: user.id,
          createdAt: { gte: monthStart }
        },
        _count: true,
        _sum: {
          tokensUsed: true,
          pointsCost: true
        }
      })

      // 总计
      const totalLogs = await prisma.aiUsageLog.aggregate({
        where: { userId: user.id },
        _count: true,
        _sum: {
          tokensUsed: true,
          pointsCost: true
        }
      })

      // 按功能统计
      const featureStats = await prisma.aiUsageLog.groupBy({
        by: ['feature'],
        where: { userId: user.id },
        _count: true,
        _sum: {
          tokensUsed: true,
          pointsCost: true
        }
      })

      return apiSuccess({
        today: {
          count: todayLogs._count || 0,
          tokens: todayLogs._sum.tokensUsed || 0,
          points: todayLogs._sum.pointsCost || 0
        },
        month: {
          count: monthLogs._count || 0,
          tokens: monthLogs._sum.tokensUsed || 0,
          points: monthLogs._sum.pointsCost || 0
        },
        total: {
          count: totalLogs._count || 0,
          tokens: totalLogs._sum.tokensUsed || 0,
          points: totalLogs._sum.pointsCost || 0
        },
        byFeature: featureStats.map(f => ({
          feature: f.feature,
          count: f._count,
          tokens: f._sum.tokensUsed || 0,
          points: f._sum.pointsCost || 0
        }))
      })
    }

    // GET /api/ai-logs - 获取日志列表
    if (req.method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '1', 10)
      const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10)
      const feature = url.searchParams.get('feature')
      const projectId = url.searchParams.get('projectId')

      const where: any = { userId: user.id }
      if (feature) where.feature = feature
      if (projectId) where.projectId = projectId

      const [logs, total] = await Promise.all([
        prisma.aiUsageLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        prisma.aiUsageLog.count({ where })
      ])

      return apiSuccess({
        logs,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      })
    }

    // POST /api/ai-logs - 记录AI调用
    if (req.method === 'POST') {
      const body = await parseBody<{
        feature: string
        projectId?: string
        inputData?: any
        outputData?: any
        modelUsed?: string
        tokensUsed?: number
        pointsCost?: number
        status?: string
        errorMessage?: string
        durationMs?: number
      }>(req)

      if (!body?.feature) {
        return apiError('请提供功能类型')
      }

      const log = await prisma.aiUsageLog.create({
        data: {
          userId: user.id,
          projectId: body.projectId,
          feature: body.feature,
          inputData: body.inputData,
          outputData: body.outputData,
          modelUsed: body.modelUsed,
          tokensUsed: body.tokensUsed || 0,
          pointsCost: body.pointsCost || 0,
          status: body.status || 'success',
          errorMessage: body.errorMessage,
          durationMs: body.durationMs
        }
      })

      // 如果消耗积分，更新用户积分
      if (body.pointsCost && body.pointsCost > 0) {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { points: { decrement: body.pointsCost } }
          }),
          prisma.pointsTransaction.create({
            data: {
              userId: user.id,
              type: 'spend',
              amount: -body.pointsCost,
              balanceAfter: user.points - body.pointsCost,
              source: 'ai_feature',
              description: `AI功能调用：${body.feature}`
            }
          })
        ])
      }

      return apiSuccess({ log }, '记录成功')
    }

  } catch (error) {
    console.error('AI日志操作错误:', error)
    return apiError('操作失败', 500)
  }

  return apiError('方法不允许', 405)
}
