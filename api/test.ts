/**
 * 简单测试接口
 */

export const config = {
  runtime: 'edge'
}

export default async function handler(req: Request) {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'API工作正常！',
      timestamp: new Date().toISOString(),
      env: {
        hasDb: !!process.env.DATABASE_URL,
        hasJwt: !!process.env.JWT_SECRET
      }
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
