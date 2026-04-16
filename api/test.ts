/**
 * 简单测试接口
 */

export default function handler(req: any, res: any) {
  res.status(200).json({
    success: true,
    message: 'API工作正常！',
    timestamp: new Date().toISOString()
  })
}
