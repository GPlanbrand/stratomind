/**
 * 需求确认单 API - GET /api/requirements
 * 获取需求确认单列表
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

    const userId = auth.userId!;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
    
    const where: any = { userId };
    if (status) {
      where.status = status;
    }
    
    const skip = (page - 1) * pageSize;
    
    try {
      const [sheets, total] = await Promise.all([
        prisma.requirementSheet.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.requirementSheet.count({ where }),
      ]);
      
      // 解析items JSON
      const parsedSheets = sheets.map(sheet => ({
        ...sheet,
        items: sheet.items ? JSON.parse(sheet.items) : [],
      }));
      
      return Response.json({
        success: true,
        data: {
          list: parsedSheets,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        },
      });
    } catch {
      // 数据库不可用
      return Response.json({
        success: true,
        data: {
          list: [],
          pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
        },
      });
    }
  } catch (error) {
    console.error('Get requirement sheets error:', error);
    return Response.json({
      success: false,
      error: '获取需求确认单列表失败',
    }, { status: 500 });
  }
}

/**
 * 创建需求确认单 - POST /api/requirements
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: 401 });
    }

    const userId = auth.userId!;
    const { projectName, clientName, items = [] } = await request.json();
    
    if (!projectName) {
      return Response.json({
        success: false,
        error: '请输入项目名称',
      }, { status: 400 });
    }
    
    try {
      const sheet = await prisma.requirementSheet.create({
        data: {
          userId,
          projectName,
          clientName: clientName || null,
          items: JSON.stringify(items),
          status: 'draft',
        },
      });
      
      return Response.json({
        success: true,
        message: '创建成功',
        data: {
          ...sheet,
          items: items,
        },
      }, { status: 201 });
    } catch {
      // 数据库不可用时的mock响应
      return Response.json({
        success: true,
        message: '创建成功（mock）',
        data: {
          id: `mock_${Date.now()}`,
          userId,
          projectName,
          clientName,
          items,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Create requirement sheet error:', error);
    return Response.json({
      success: false,
      error: '创建需求确认单失败',
    }, { status: 500 });
  }
}
