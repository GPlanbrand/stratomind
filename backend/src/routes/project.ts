import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// Mock 项目数据
const mockProjects = [
  { id: '1', name: '品牌升级方案', status: 'active', createdAt: new Date().toISOString() },
  { id: '2', name: '新品上市计划', status: 'draft', createdAt: new Date().toISOString() },
];

const mockProjectSteps = {
  '1': ['市场调研', '竞品分析', '策略制定', '创意产出', '执行落地'],
  '2': ['需求收集', '方案设计', '审核确认'],
};

// 获取项目列表
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, data: mockProjects });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取项目列表失败' });
  }
};

// 获取单个项目
export const getProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取项目失败' });
  }
};

// 获取项目步骤数据
export const getProjectSteps = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const steps = mockProjectSteps[projectId as keyof typeof mockProjectSteps];
    if (!steps) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }
    res.json({ success: true, data: steps });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取项目步骤失败' });
  }
};

// 创建项目
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const newProject = {
      id: String(mockProjects.length + 1),
      name,
      description,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    res.status(500).json({ success: false, error: '创建项目失败' });
  }
};

// 更新项目
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, status } = req.body;
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }
    res.json({ success: true, data: { ...project, name, status } });
  } catch (error) {
    res.status(500).json({ success: false, error: '更新项目失败' });
  }
};

// 删除项目
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '删除项目失败' });
  }
};

// 绑定路由
router.get('/', authMiddleware, getProjects);
router.get('/:id', authMiddleware, getProject);
router.get('/:id/steps', authMiddleware, getProjectSteps);
router.post('/', authMiddleware, createProject);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, deleteProject);

export default router;
