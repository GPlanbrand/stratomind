/**
 * 认证中间件 for Vercel Serverless Functions
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'stratomind-secret-key';

export interface AuthResult {
  success: boolean;
  userId?: string;
  user?: any;
  error?: string;
}

/**
 * 验证请求的认证状态
 */
export async function authMiddleware(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: '未登录，请先登录' };
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type?: string };
    
    // 验证用户存在
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        // 数据库不可用时，允许 mock token 通过
        if (decoded.userId && decoded.userId.startsWith('mock_')) {
          return {
            success: true,
            userId: decoded.userId,
            user: { id: decoded.userId, mock: true },
          };
        }
        return { success: false, error: '用户不存在' };
      }

      return {
        success: true,
        userId: decoded.userId,
        user,
      };
    } catch {
      // 数据库不可用时，允许 mock token 通过
      if (decoded.userId && decoded.userId.startsWith('mock_')) {
        return {
          success: true,
          userId: decoded.userId,
          user: { id: decoded.userId, mock: true },
        };
      }
      return { success: false, error: '用户不存在' };
    }
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { success: false, error: '登录已过期，请重新登录' };
    }
    return { success: false, error: '认证失败' };
  }
}

/**
 * 解析请求体
 */
export async function parseBody<T = any>(request: NextRequest): Promise<T> {
  try {
    return await request.json();
  } catch {
    return {} as T;
  }
}

/**
 * 提取查询参数
 */
export function getQueryParams(request: NextRequest): Record<string, string> {
  const params: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * 统一的响应格式
 */
export function jsonResponse(data: any, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function errorResponse(error: string, status = 500) {
  return Response.json({ success: false, error }, { status });
}
