/**
 * API响应工具
 * 统一API返回格式
 */

/**
 * 成功响应
 */
export const apiSuccess = (data: any, message?: string): Response => {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      message
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
}

/**
 * 错误响应
 */
export const apiError = (message: string, status = 400): Response => {
  return new Response(
    JSON.stringify({
      success: false,
      message
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
}

/**
 * 未授权响应
 */
export const apiUnauthorized = (message = '请先登录'): Response => {
  return apiError(message, 401)
}

/**
 * 服务器错误响应
 */
export const apiServerError = (message = '服务器错误'): Response => {
  return apiError(message, 500)
}

/**
 * 解析请求体JSON
 */
export const parseBody = async <T = any>(req: Request): Promise<T | null> => {
  try {
    return await req.json()
  } catch {
    return null
  }
}

/**
 * CORS预检响应
 */
export const corsResponse = (): Response => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
