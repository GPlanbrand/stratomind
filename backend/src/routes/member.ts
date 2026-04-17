import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// Mock 会员信息
const mockMemberInfo = {
  level: 'pro',
  expireDate: '2025-12-31',
  features: ['unlimited_projects', 'ai_generation', 'priority_support'],
};

// Mock 会员套餐
const mockPlans = [
  { id: 'free', name: '免费版', price: 0, features: ['3个项目', '基础AI'] },
  { id: 'pro', name: '专业版', price: 99, features: ['无限项目', '高级AI', '优先支持'] },
  { id: 'enterprise', name: '企业版', price: 299, features: ['团队协作', 'API访问', '专属客服'] },
];

// 获取会员信息
export const getMemberInfo = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, data: mockMemberInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取会员信息失败' });
  }
};

// 获取会员套餐
export const getMemberPlans = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, data: mockPlans });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取会员套餐失败' });
  }
};

// 升级会员
export const upgradeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, error: '请选择套餐' });
    }
    res.json({ success: true, message: '升级成功', data: { planId } });
  } catch (error) {
    res.status(500).json({ success: false, error: '升级失败' });
  }
};

export default router;
