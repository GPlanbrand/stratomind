import { Router } from 'express';
import { getPointsInfo, getPointsHistory } from '../routes/points';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// 获取积分信息
router.get('/info', getPointsInfo);

// 获取积分记录
router.get('/history', getPointsHistory);

export default router;
