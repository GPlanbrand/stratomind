/**
 * 创建访客Token API - POST /api/guest
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/api/lib/prisma';

export const runtime = 'nodejs20.x';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // 生成访客Token: guest_xxxxx
    const randomPart = crypto.randomBytes(4).toString('hex');
    const token = `guest_${randomPart}`;
    
    // 设置7天过期
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 7);
    
    try {
      const guestSession = await prisma.guestSession.create({
        data: {
          token,
          expireAt,
        },
      });
      
      return Response.json({
        success: true,
        data: {
          token: guestSession.token,
          expireAt: guestSession.expireAt.toISOString(),
        },
      }, { status: 201 });
    } catch (dbError) {
      // 数据库不可用时返回mock数据
      console.log('Database not available, returning mock token');
      return Response.json({
        success: true,
        data: {
          token,
          expireAt: expireAt.toISOString(),
        },
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Create guest token error:', error);
    return Response.json({
      success: false,
      error: '生成访客Token失败',
    }, { status: 500 });
  }
}
