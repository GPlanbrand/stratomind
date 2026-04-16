import { Router } from 'express';
import { getProjects, getProject, createProject, updateProject, deleteProject, getProjectSteps } from '../routes/project';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// 获取项目列表
router.get('/', getProjects);

// 获取单个项目
router.get('/:projectId', getProject);

// 获取项目步骤数据
router.get('/:projectId/steps', getProjectSteps);

// 创建项目
router.post('/', createProject);

// 更新项目
router.put('/:projectId', updateProject);

// 删除项目
router.delete('/:projectId', deleteProject);

export default router;
