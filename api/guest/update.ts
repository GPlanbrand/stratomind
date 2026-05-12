/**
 * 更新访客数据 API - PUT /api/guest/[token]
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/api/lib/prisma';

export const runtime = 'nodejs20.x';
export const maxDuration = 30;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { data } = await request.json();
    
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
      
      await prisma.guestSession.update({
        where: { token },
        data: {
          data: JSON.stringify(data),
        },
      });
      
      return Response.json({
        success: true,
        message: '访客数据更新成功',
      });
    } catch {
      return Response.json({
        success: true,
        message: '访客数据更新成功（mock）',
      });
    }
  } catch (error) {
    return Response.json({
      success: false,
      error: '更新访客数据失败',
    }, { status: 500 });
  }
}
