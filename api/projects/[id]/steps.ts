/**
 * 项目步骤数据接口
 * GET /api/projects/[id]/steps - 获取步骤数据
 * PUT /api/projects/[id]/steps - 保存步骤数据
 */

import { prisma } from '../../../../lib/db'
import { getUserFromRequest } from '../../../../lib/auth'
import { apiSuccess, apiError, apiUnauthorized, parseBody } from '../../../../lib/api'


export default async function handler(req: Request) {
  // CORS预检
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  // 获取当前用户
  const user = await getUserFromRequest(req)
  if (!user) {
    return apiUnauthorized()
  }

  // 从URL获取项目ID
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')
  const projectId = pathParts[pathParts.length - 2] // /api/projects/[id]/steps

  if (!projectId) {
    return apiError('项目ID不存在')
  }

  // 验证项目归属
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
      deletedAt: null
    }
  })

  if (!project) {
    return apiError('项目不存在', 404)
  }

  // GET - 获取步骤数据
  if (req.method === 'GET') {
    try {
      const steps = await prisma.projectStep.findUnique({
        where: { projectId }
      })

      return apiSuccess({
        clientInfo: steps?.clientInfo || null,
        requirements: steps?.requirements || null,
        competitors: steps?.competitors || null,
        brief: steps?.brief || null,
        strategy: steps?.strategy || null
      })

    } catch (error) {
      console.error('获取步骤数据错误:', error)
      return apiError('获取步骤数据失败', 500)
    }
  }

  // PUT - 保存步骤数据
  if (req.method === 'PUT') {
    try {
      const body = await parseBody<{
        clientInfo?: any
        requirements?: any
        competitors?: any
        brief?: any
        strategy?: any
      }>(req)

      if (!body) {
        return apiError('请提供数据')
      }

      // 更新或创建步骤数据
      const steps = await prisma.projectStep.upsert({
        where: { projectId },
        create: {
          projectId,
          ...body
        },
        update: {
          ...body
        }
      })

      // 更新项目的updatedAt
      await prisma.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() }
      })

      return apiSuccess({ steps }, '保存成功')

    } catch (error) {
      console.error('保存步骤数据错误:', error)
      return apiError('保存失败', 500)
    }
  }

  return apiError('方法不允许', 405)
}
