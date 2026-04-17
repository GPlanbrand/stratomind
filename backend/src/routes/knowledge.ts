import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// Mock 知识库数据
const mockKnowledgeItems = [
  { id: '1', title: '品牌策略指南', content: '品牌策略核心要点...', category: 'strategy', createdAt: new Date().toISOString() },
  { id: '2', title: '创意方法论', content: '创意产生流程...', category: 'creative', createdAt: new Date().toISOString() },
];

// 获取知识库列表
export const getKnowledgeItems = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, data: mockKnowledgeItems });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取知识库列表失败' });
  }
};

// 获取单个知识项
export const getKnowledgeItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const item = mockKnowledgeItems.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: '知识项不存在' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取知识项失败' });
  }
};

// 创建知识项
export const createKnowledgeItem = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, category } = req.body;
    const newItem = {
      id: String(mockKnowledgeItems.length + 1),
      title,
      content,
      category,
      createdAt: new Date().toISOString(),
    };
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: '创建知识项失败' });
  }
};

// 更新知识项
export const updateKnowledgeItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { title, content, category } = req.body;
    const item = mockKnowledgeItems.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: '知识项不存在' });
    }
    res.json({ success: true, data: { ...item, title, content, category } });
  } catch (error) {
    res.status(500).json({ success: false, error: '更新知识项失败' });
  }
};

// 删除知识项
export const deleteKnowledgeItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const item = mockKnowledgeItems.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: '知识项不存在' });
    }
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '删除知识项失败' });
  }
};

// 绑定路由
router.get('/', authMiddleware, getKnowledgeItems);
router.get('/:id', authMiddleware, getKnowledgeItem);
router.post('/', authMiddleware, createKnowledgeItem);
router.put('/:id', authMiddleware, updateKnowledgeItem);
router.delete('/:id', authMiddleware, deleteKnowledgeItem);

export default router;
