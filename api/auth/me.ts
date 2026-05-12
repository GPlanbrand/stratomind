/**
 * 认证相关 API - GET /api/auth/me
 * 获取当前登录用户信息
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/api/lib/prisma';
import { authMiddleware } from '@/api/lib/auth';

export const runtime = 'nodejs20.x';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: 401 });
    }

    return Response.json({
      success: true,
      data: {
        id: auth.user.id,
        email: auth.user.email,
        username: auth.user.username,
        phone: auth.user.phone,
        nickname: auth.user.nickname,
        role: auth.user.role,
        memberLevel: auth.user.memberLevel,
        isPaid: auth.user.isPaid,
        paidExpireAt: auth.user.paidExpireAt,
        points: auth.user.points,
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return Response.json({ success: false, error: '获取用户信息失败' }, { status: 500 });
  }
}
