/**
 * 知识库接口
 * GET /api/knowledge - 获取知识库列表
 * POST /api/knowledge - 创建知识条目
 * GET /api/knowledge/[id] - 获取详情
 * PUT /api/knowledge/[id] - 更新知识条目
 * DELETE /api/knowledge/[id] - 删除知识条目
 */

import { prisma } from '../../lib/db'
import { getUserFromRequest } from '../../lib/auth'
import { apiSuccess, apiError, apiUnauthorized, parseBody } from '../../lib/api'

// 知识库分类
const CATEGORIES = ['methodology', 'case', 'template', 'material'] as const


export default async function handler(req: Request) {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    return apiUnauthorized()
  }

  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')
  const itemId = pathParts.length > 3 ? pathParts[3] : null

  try {
    // GET /api/knowledge - 获取列表
    if (req.method === 'GET' && !itemId) {
      const page = parseInt(url.searchParams.get('page') || '1', 10)
      const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10)
      const category = url.searchParams.get('category')
      const search = url.searchParams.get('search')
      const isPublic = url.searchParams.get('public')

      const where: any = {
        deletedAt: null,
        OR: [
          { userId: user.id },
          { isPublic: true }
        ]
      }
      if (category && CATEGORIES.includes(category as any)) {
        where.category = category
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      }
      if (isPublic === 'true') {
        where.isPublic = true
      }

      const [items, total] = await Promise.all([
        prisma.knowledge.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        prisma.knowledge.count({ where })
      ])

      return apiSuccess({
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      })
    }

    // GET /api/knowledge/[id] - 获取详情
    if (req.method === 'GET' && itemId) {
      const item = await prisma.knowledge.findFirst({
        where: {
          id: itemId,
          deletedAt: null,
          OR: [
            { userId: user.id },
            { isPublic: true }
          ]
        }
      })

      if (!item) {
        return apiError('知识条目不存在', 404)
      }

      // 增加浏览次数
      await prisma.knowledge.update({
        where: { id: itemId },
        data: { viewCount: { increment: 1 } }
      })

      return apiSuccess({ item })
    }

    // POST - 创建知识条目
    if (req.method === 'POST') {
      const body = await parseBody<{
        title: string
        content: string
        category: string
        tags?: string[]
        isPublic?: boolean
      }>(req)

      if (!body?.title || !body.content || !body.category) {
        return apiError('请填写完整信息')
      }

      if (!CATEGORIES.includes(body.category as any)) {
        return apiError('分类不正确')
      }

      const item = await prisma.knowledge.create({
        data: {
          userId: user.id,
          title: body.title,
          content: body.content,
          category: body.category,
          tags: body.tags || [],
          isPublic: body.isPublic || false
        }
      })

      return apiSuccess({ item }, '创建成功')
    }

    // PUT - 更新知识条目
    if (req.method === 'PUT' && itemId) {
      const item = await prisma.knowledge.findFirst({
        where: { id: itemId, userId: user.id, deletedAt: null }
      })

      if (!item) {
        return apiError('知识条目不存在或无权限', 404)
      }

      const body = await parseBody<{
        title?: string
        content?: string
        category?: string
        tags?: string[]
        isPublic?: boolean
      }>(req)

      if (body.category && !CATEGORIES.includes(body.category as any)) {
        return apiError('分类不正确')
      }

      const updated = await prisma.knowledge.update({
        where: { id: itemId },
        data: {
          ...body.title && { title: body.title },
          ...body.content && { content: body.content },
          ...body.category && { category: body.category },
          ...body.tags && { tags: body.tags },
          ...body.isPublic !== undefined && { isPublic: body.isPublic }
        }
      })

      return apiSuccess({ item: updated }, '更新成功')
    }

    // DELETE - 删除知识条目
    if (req.method === 'DELETE' && itemId) {
      const item = await prisma.knowledge.findFirst({
        where: { id: itemId, userId: user.id, deletedAt: null }
      })

      if (!item) {
        return apiError('知识条目不存在或无权限', 404)
      }

      await prisma.knowledge.update({
        where: { id: itemId },
        data: { deletedAt: new Date() }
      })

      return apiSuccess({}, '删除成功')
    }

  } catch (error) {
    console.error('知识库操作错误:', error)
    return apiError('操作失败', 500)
  }

  return apiError('方法不允许', 405)
}
