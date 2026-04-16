import { Router } from 'express';
import { getKnowledgeItems, getKnowledgeItem, createKnowledgeItem, updateKnowledgeItem, deleteKnowledgeItem } from '../routes/knowledge';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// 获取知识库列表
router.get('/', getKnowledgeItems);

// 获取单个知识项
router.get('/:itemId', getKnowledgeItem);

// 创建知识项
router.post('/', createKnowledgeItem);

// 更新知识项
router.put('/:itemId', updateKnowledgeItem);

// 删除知识项
router.delete('/:itemId', deleteKnowledgeItem);

export default router;
