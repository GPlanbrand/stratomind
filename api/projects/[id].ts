/**
 * 项目详情接口
 * GET /api/projects/[id] - 获取项目
 * PUT /api/projects/[id] - 更新项目
 * DELETE /api/projects/[id] - 删除项目
 */

import { prisma } from '../../../lib/db'
import { getUserFromRequest } from '../../../lib/auth'
import { apiSuccess, apiError, apiUnauthorized, parseBody } from '../../../lib/api'


export default async function handler(req: Request) {
  // CORS预检
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
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
  const projectId = pathParts[pathParts.length - 1]

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

  // GET - 获取项目
  if (req.method === 'GET') {
    try {
      if (!project) {
        return apiError('项目不存在', 404)
      }

      const steps = await prisma.projectStep.findUnique({
        where: { projectId }
      })

      return apiSuccess({
        project: {
          id: project.id,
          name: project.name,
          clientName: project.clientName,
          status: project.status,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        },
        steps
      })

    } catch (error) {
      console.error('获取项目错误:', error)
      return apiError('获取项目失败', 500)
    }
  }

  // PUT - 更新项目
  if (req.method === 'PUT') {
    try {
      if (!project) {
        return apiError('项目不存在', 404)
      }

      const body = await parseBody<{
        name?: string
        clientName?: string
        status?: string
      }>(req)

      if (!body) {
        return apiError('请提供更新数据')
      }

      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
          ...body.name && { name: body.name },
          ...body.clientName && { clientName: body.clientName },
          ...body.status && { status: body.status }
        }
      })

      return apiSuccess({
        project: updatedProject
      }, '项目更新成功')

    } catch (error) {
      console.error('更新项目错误:', error)
      return apiError('更新项目失败', 500)
    }
  }

  // DELETE - 删除项目（软删除）
  if (req.method === 'DELETE') {
    try {
      if (!project) {
        return apiError('项目不存在', 404)
      }

      await prisma.project.update({
        where: { id: projectId },
        data: { deletedAt: new Date() }
      })

      return apiSuccess({}, '项目已删除')

    } catch (error) {
      console.error('删除项目错误:', error)
      return apiError('删除项目失败', 500)
    }
  }

  return apiError('方法不允许', 405)
}
