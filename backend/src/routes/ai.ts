import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// Mock AI 日志
const mockAILogs = [
  { id: '1', type: 'strategy', prompt: '生成品牌策略', result: '策略已生成', createdAt: new Date().toISOString() },
  { id: '2', type: 'brief', prompt: '生成创意简报', result: '简报已生成', createdAt: new Date().toISOString() },
];

// Mock 竞品分析结果
const mockCompetitorAnalysis = {
  competitors: ['品牌A', '品牌B', '品牌C'],
  insights: ['差异化定位机会', '价格策略建议', '目标人群洞察'],
};

// Mock 创意简报
const mockBrief = {
  title: '新品上市创意简报',
  target: '25-35岁都市白领',
  keyMessage: '简约、高效、品质',
  channels: ['社交媒体', 'KOL合作', '线下活动'],
};

// Mock 创意策略
const mockStrategy = {
  coreMessage: '引领品质生活',
  creativeDirection: '都市精英风格',
  tonality: '专业、现代、有温度',
  keyVisual: '城市天际线+产品特写',
};

// 竞品分析
export const analyzeCompetitors = async (req: AuthRequest, res: Response) => {
  try {
    const { brandName, industry } = req.body;
    res.json({ success: true, data: mockCompetitorAnalysis });
  } catch (error) {
    res.status(500).json({ success: false, error: '竞品分析失败' });
  }
};

// 生成创意简报
export const generateBrief = async (req: AuthRequest, res: Response) => {
  try {
    const { projectName, targetAudience, keyMessage } = req.body;
    res.json({ success: true, data: mockBrief });
  } catch (error) {
    res.status(500).json({ success: false, error: '生成简报失败' });
  }
};

// 生成创意策略
export const generateStrategy = async (req: AuthRequest, res: Response) => {
  try {
    const { brandIdentity, competitors, targetAudience } = req.body;
    res.json({ success: true, data: mockStrategy });
  } catch (error) {
    res.status(500).json({ success: false, error: '生成策略失败' });
  }
};

// 获取AI使用记录
export const getAILogs = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, data: mockAILogs });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取AI日志失败' });
  }
};

// 绑定路由
router.post('/analyze-competitors', authMiddleware, analyzeCompetitors);
router.post('/generate-brief', authMiddleware, generateBrief);
router.post('/generate-strategy', authMiddleware, generateStrategy);
router.get('/logs', authMiddleware, getAILogs);

export default router;
