import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// Mock 资产数据
const mockAssets = [
  { id: '1', name: 'logo.png', type: 'image', size: 1024, url: '/uploads/logo.png', createdAt: new Date().toISOString() },
  { id: '2', name: 'banner.jpg', type: 'image', size: 2048, url: '/uploads/banner.jpg', createdAt: new Date().toISOString() },
];

// 获取资产列表
export const getAssets = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, data: mockAssets });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取资产列表失败' });
  }
};

// 上传资产
export const uploadAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, size } = req.body;
    const newAsset = {
      id: String(mockAssets.length + 1),
      name,
      type,
      size,
      url: `/uploads/${name}`,
      createdAt: new Date().toISOString(),
    };
    res.status(201).json({ success: true, data: newAsset });
  } catch (error) {
    res.status(500).json({ success: false, error: '上传资产失败' });
  }
};

// 删除资产
export const deleteAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { assetId } = req.params;
    const asset = mockAssets.find(a => a.id === assetId);
    if (!asset) {
      return res.status(404).json({ success: false, error: '资产不存在' });
    }
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '删除资产失败' });
  }
};

// 绑定路由
router.get('/', authMiddleware, getAssets);
router.post('/upload', authMiddleware, uploadAsset);
router.delete('/:id', authMiddleware, deleteAsset);

export default router;
