/**
 * 获取当前用户信息
 * GET /api/auth/me
 */

import { getUserFromRequest } from '../../lib/auth'
import { apiSuccess, apiError, apiUnauthorized } from '../../lib/api'

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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  if (req.method !== 'GET') {
    return apiError('方法不允许', 405)
  }

  try {
    const user = await getUserFromRequest(req)
    
    if (!user) {
      return apiUnauthorized()
    }

    return apiSuccess({ user })

  } catch (error) {
    console.error('获取用户信息错误:', error)
    return apiError('获取用户信息失败', 500)
  }
}
