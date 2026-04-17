import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// Mock 积分信息
const mockPointsInfo = {
  balance: 1250,
  totalEarned: 5000,
  totalSpent: 3750,
  level: 'gold',
};

// Mock 积分记录
const mockPointsHistory = [
  { id: '1', type: 'earn', amount: 100, reason: '完成项目', createdAt: new Date().toISOString() },
  { id: '2', type: 'spend', amount: 50, reason: '使用AI功能', createdAt: new Date().toISOString() },
  { id: '3', type: 'earn', amount: 200, reason: '邀请好友', createdAt: new Date().toISOString() },
];

// 获取积分信息
export const getPointsInfo = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, data: mockPointsInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取积分信息失败' });
  }
};

// 获取积分记录
export const getPointsHistory = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, data: mockPointsHistory });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取积分记录失败' });
  }
};

// 绑定路由
router.get('/info', authMiddleware, getPointsInfo);
router.get('/history', authMiddleware, getPointsHistory);

export default router;
