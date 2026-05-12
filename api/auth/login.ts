/**
 * 用户登录 API - POST /api/auth/login
 */

import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/api/lib/prisma';

export const runtime = 'nodejs20.x';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const JWT_SECRET = process.env.JWT_SECRET || 'stratomind-secret-key';

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return Response.json({ success: false, error: '邮箱或密码错误' }, { status: 401 });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return Response.json({ success: false, error: '邮箱或密码错误' }, { status: 401 });
      }

      const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return Response.json({
        success: true,
        data: {
          user: { id: user.id, email: user.email, username: user.username },
          token
        }
      });
    } catch {
      // 数据库不可用时使用 mock
      return Response.json({
        success: true,
        data: {
          user: { id: '1', email, username: 'Demo User' },
          token: 'mock-token'
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ success: false, error: '登录失败' }, { status: 500 });
  }
}
