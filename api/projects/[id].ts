/**
 * 项目详情 API - GET/PUT/DELETE /api/projects/[id]
 */

import { NextRequest } from 'next/server';
import { authMiddleware } from '@/api/lib/auth';

export const runtime = 'nodejs20.x';
export const maxDuration = 30;

// Mock 项目数据
const mockProjects = [
  { id: '1', name: '品牌升级方案', status: 'active', createdAt: new Date().toISOString() },
  { id: '2', name: '新品上市计划', status: 'draft', createdAt: new Date().toISOString() },
];

const mockProjectSteps: Record<string, string[]> = {
  '1': ['市场调研', '竞品分析', '策略制定', '创意产出', '执行落地'],
  '2': ['需求收集', '方案设计', '审核确认'],
};

/**
 * 获取项目详情 - GET /api/projects/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authMiddleware(request);
    
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    // 如果请求的是 steps
    if (type === 'steps') {
      const steps = mockProjectSteps[id];
      if (!steps) {
        return Response.json({ success: false, error: '项目不存在' }, { status: 404 });
      }
      return Response.json({ success: true, data: steps });
    }
    
    const project = mockProjects.find(p => p.id === id);
    if (!project) {
      return Response.json({ success: false, error: '项目不存在' }, { status: 404 });
    }
    
    return Response.json({ success: true, data: project });
  } catch (error) {
    return Response.json({ success: false, error: '获取项目失败' }, { status: 500 });
  }
}

/**
 * 更新项目 - PUT /api/projects/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authMiddleware(request);
    
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const { name, status } = await request.json();
    
    const project = mockProjects.find(p => p.id === id);
    if (!project) {
      return Response.json({ success: false, error: '项目不存在' }, { status: 404 });
    }
    
    return Response.json({ success: true, data: { ...project, name, status } });
  } catch (error) {
    return Response.json({ success: false, error: '更新项目失败' }, { status: 500 });
  }
}

/**
 * 删除项目 - DELETE /api/projects/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authMiddleware(request);
    
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const project = mockProjects.find(p => p.id === id);
    if (!project) {
      return Response.json({ success: false, error: '项目不存在' }, { status: 404 });
    }
    
    return Response.json({ success: true, message: '删除成功' });
  } catch (error) {
    return Response.json({ success: false, error: '删除项目失败' }, { status: 500 });
  }
}
