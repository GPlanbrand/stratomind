import { Router } from 'express';
import { getMemberInfo, getMemberPlans, upgradeMember } from '../routes/member';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// 获取会员信息
router.get('/info', getMemberInfo);

// 获取会员套餐
router.get('/plans', getMemberPlans);

// 升级会员
router.post('/upgrade', upgradeMember);

export default router;
