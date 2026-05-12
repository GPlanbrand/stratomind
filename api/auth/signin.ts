/**
 * 签到 API - POST /api/auth/signin
 */

import { NextRequest } from 'next/server';
import { authMiddleware } from '@/api/lib/auth';

export const runtime = 'nodejs20.x';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: 401 });
    }

    return Response.json({
      success: true,
      message: '签到成功',
      data: { points: 10, userId: auth.userId }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return Response.json({ success: false, error: '签到失败' }, { status: 500 });
  }
}
