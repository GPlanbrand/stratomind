import { Router } from 'express';
import { analyzeCompetitors, generateBrief, generateStrategy, getAILogs } from '../routes/ai';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// 竞品分析
router.post('/analyze-competitors', analyzeCompetitors);

// 生成创意简报
router.post('/generate-brief', generateBrief);

// 生成创意策略
router.post('/generate-strategy', generateStrategy);

// 获取AI使用记录
router.get('/logs', getAILogs);

export default router;
