/**
 * 资产库接口
 * GET /api/assets - 获取资产列表
 * POST /api/assets - 上传资产
 * DELETE /api/assets/[id] - 删除资产
 */

import { prisma } from '../../lib/db'
import { getUserFromRequest } from '../../lib/auth'
import { apiSuccess, apiError, apiUnauthorized, parseBody } from '../../lib/api'

export const config = {
  runtime: 'edge'
}

// 资产类型
const ASSET_TYPES = ['document', 'image', 'video', 'audio', 'other'] as const

export default async function handler(req: Request) {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    return apiUnauthorized()
  }

  const url = new URL(req.url)
  const assetId = url.pathname.split('/').pop()

  try {
    // GET - 获取资产列表
    if (req.method === 'GET' && assetId === 'assets') {
      const page = parseInt(url.searchParams.get('page') || '1', 10)
      const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10)
      const type = url.searchParams.get('type')
      const projectId = url.searchParams.get('projectId')
      const search = url.searchParams.get('search')

      const where: any = {
        userId: user.id,
        deletedAt: null
      }
      if (type && ASSET_TYPES.includes(type as any)) {
        where.type = type
      }
      if (projectId) {
        where.projectId = projectId
      }
      if (search) {
        where.name = { contains: search, mode: 'insensitive' }
      }

      const [assets, total] = await Promise.all([
        prisma.asset.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        prisma.asset.count({ where })
      ])

      return apiSuccess({
        assets,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      })
    }

    // POST - 创建资产（记录文件信息）
    if (req.method === 'POST') {
      const body = await parseBody<{
        name: string
        type: string
        fileUrl: string
        fileSize?: number
        projectId?: string
        tags?: string[]
        description?: string
      }>(req)

      if (!body?.name || !body.type || !body.fileUrl) {
        return apiError('请提供完整的资产信息')
      }

      if (!ASSET_TYPES.includes(body.type as any)) {
        return apiError('资产类型不正确')
      }

      const asset = await prisma.asset.create({
        data: {
          userId: user.id,
          projectId: body.projectId,
          name: body.name,
          type: body.type,
          fileUrl: body.fileUrl,
          fileSize: body.fileSize || 0,
          tags: body.tags || [],
          description: body.description
        }
      })

      return apiSuccess({ asset }, '资产创建成功')
    }

    // DELETE - 删除资产
    if (req.method === 'DELETE' && assetId && assetId !== 'assets') {
      // 检查资产归属
      const asset = await prisma.asset.findFirst({
        where: {
          id: assetId,
          userId: user.id,
          deletedAt: null
        }
      })

      if (!asset) {
        return apiError('资产不存在', 404)
      }

      // 软删除
      await prisma.asset.update({
        where: { id: assetId },
        data: { deletedAt: new Date() }
      })

      return apiSuccess({}, '资产已删除')
    }

  } catch (error) {
    console.error('资产操作错误:', error)
    return apiError('操作失败', 500)
  }

  return apiError('方法不允许', 405)
}
