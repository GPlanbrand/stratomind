/**
 * 项目列表接口
 * GET /api/projects - 获取项目列表
 * POST /api/projects - 创建项目
 */

import { prisma } from '../../lib/db'
import { getUserFromRequest } from '../../lib/auth'
import { apiSuccess, apiError, apiUnauthorized, parseBody } from '../../lib/api'

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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  // 获取当前用户
  const user = await getUserFromRequest(req)
  if (!user) {
    return apiUnauthorized()
  }

  // GET - 获取项目列表
  if (req.method === 'GET') {
    try {
      const projects = await prisma.project.findMany({
        where: {
          userId: user.id,
          deletedAt: null
        },
        orderBy: {
          updatedAt: 'desc'
        },
        include: {
          steps: true
        }
      })

      return apiSuccess({ projects })

    } catch (error) {
      console.error('获取项目列表错误:', error)
      return apiError('获取项目列表失败', 500)
    }
  }

  // POST - 创建项目
  if (req.method === 'POST') {
    try {
      const body = await parseBody<{
        name: string
        clientName: string
      }>(req)

      if (!body?.name || !body.clientName) {
        return apiError('请填写项目名称和客户名称')
      }

      const { name, clientName } = body

      // 创建项目
      const project = await prisma.project.create({
        data: {
          userId: user.id,
          name,
          clientName,
          status: 'active'
        }
      })

      // 创建空的步骤数据
      await prisma.projectStep.create({
        data: {
          projectId: project.id
        }
      })

      return apiSuccess({
        project: {
          id: project.id,
          name: project.name,
          clientName: project.clientName,
          status: project.status,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        }
      }, '项目创建成功')

    } catch (error) {
      console.error('创建项目错误:', error)
      return apiError('创建项目失败', 500)
    }
  }

  return apiError('方法不允许', 405)
}
