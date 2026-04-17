import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// Mock 搜索数据
const mockSearchData = {
  projects: [
    { id: '1', name: '品牌升级方案', type: 'project', path: '/projects/files?id=1' },
    { id: '2', name: '新品上市计划', type: 'project', path: '/projects/files?id=2' },
    { id: '3', name: '营销活动策划', type: 'project', path: '/projects/files?id=3' },
  ],
  knowledge: [
    { id: 'k1', title: '品牌策略指南', type: 'knowledge', path: '/projects/knowledge' },
    { id: 'k2', title: '创意方法论', type: 'knowledge', path: '/projects/knowledge' },
    { id: 'k3', title: '市场分析方法', type: 'knowledge', path: '/projects/knowledge' },
  ],
  history: [
    { id: 'h1', content: '生成品牌策略', type: 'history', path: '/projects/assistant' },
    { id: 'h2', content: '竞品分析报告', type: 'history', path: '/projects/assistant' },
  ]
};

// 全局搜索
export const search = async (req: AuthRequest, res: Response) => {
  try {
    const { q, type } = req.query;
    const query = (q as string || '').toLowerCase();
    
    if (!query) {
      return res.json({ success: true, data: { projects: [], knowledge: [], history: [] } });
    }

    const result: {
      projects: typeof mockSearchData.projects;
      knowledge: typeof mockSearchData.knowledge;
      history: typeof mockSearchData.history;
    } = { projects: [], knowledge: [], history: [] };

    // 搜索项目
    if (!type || type === 'project') {
      result.projects = mockSearchData.projects.filter(
        p => p.name.toLowerCase().includes(query)
      ).slice(0, 5);
    }

    // 搜索知识库
    if (!type || type === 'knowledge') {
      result.knowledge = mockSearchData.knowledge.filter(
        k => k.title.toLowerCase().includes(query)
      ).slice(0, 5);
    }

    // 搜索历史记录
    if (!type || type === 'history') {
      result.history = mockSearchData.history.filter(
        h => h.content.toLowerCase().includes(query)
      ).slice(0, 5);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: '搜索失败' });
  }
};

// 获取搜索历史
export const getSearchHistory = async (req: AuthRequest, res: Response) => {
  try {
    // 从请求中获取用户ID（如果有的话）
    const userId = req.user?.id || 'anonymous';
    const historyKey = `search_history_${userId}`;
    
    // 模拟历史记录数据
    const mockHistory = [
      { id: '1', query: '品牌策略', timestamp: Date.now() - 86400000 },
      { id: '2', query: '竞品分析', timestamp: Date.now() - 172800000 },
      { id: '3', query: '创意简报', timestamp: Date.now() - 259200000 },
    ];
    
    res.json({ success: true, data: mockHistory });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取搜索历史失败' });
  }
};

// 清除搜索历史
export const clearSearchHistory = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, message: '搜索历史已清除' });
  } catch (error) {
    res.status(500).json({ success: false, error: '清除搜索历史失败' });
  }
};

// 绑定路由
router.get('/', authMiddleware, search);
router.get('/history', authMiddleware, getSearchHistory);
router.delete('/history', authMiddleware, clearSearchHistory);

export default router;
