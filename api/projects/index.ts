/**
 * 项目 API - GET/POST /api/projects
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
 * 获取项目列表 - GET /api/projects
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: 401 });
    }

    return Response.json({ success: true, data: mockProjects });
  } catch (error) {
    return Response.json({ success: false, error: '获取项目列表失败' }, { status: 500 });
  }
}

/**
 * 创建项目 - POST /api/projects
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: 401 });
    }

    const { name, description } = await request.json();
    const newProject = {
      id: String(mockProjects.length + 1),
      name,
      description,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    
    return Response.json({ success: true, data: newProject }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: '创建项目失败' }, { status: 500 });
  }
}
