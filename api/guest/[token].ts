/**
 * 验证访客Token API - GET /api/guest/[token]
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/api/lib/prisma';

export const runtime = 'nodejs20.x';
export const maxDuration = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    if (!token || !token.startsWith('guest_')) {
      return Response.json({
        success: false,
        error: '无效的Token格式',
      }, { status: 400 });
    }
    
    try {
      const session = await prisma.guestSession.findUnique({
        where: { token },
      });
      
      if (!session) {
        return Response.json({
          success: false,
          error: 'Token不存在',
        }, { status: 404 });
      }
      
      if (new Date() > session.expireAt) {
        return Response.json({
          success: false,
          error: 'Token已过期',
        }, { status: 401 });
      }
      
      return Response.json({
        success: true,
        data: {
          valid: true,
          data: session.data ? JSON.parse(session.data) : null,
        },
      });
    } catch {
      // 数据库不可用
      return Response.json({
        success: true,
        data: {
          valid: true,
          data: null,
        },
      });
    }
  } catch (error) {
    return Response.json({
      success: false,
      error: '验证Token失败',
    }, { status: 500 });
  }
}
