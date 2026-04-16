import { Router } from 'express';
import { getAssets, uploadAsset, deleteAsset } from '../routes/asset';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// 获取资产列表
router.get('/', getAssets);

// 上传资产
router.post('/', uploadAsset);

// 删除资产
router.delete('/:assetId', deleteAsset);

export default router;
