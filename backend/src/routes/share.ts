import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// 生成唯一分享码
function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 分享链接存储（内存中，生产环境应使用数据库）
const shareLinks: Map<string, {
  projectId: string;
  projectName: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  viewCount: number;
}> = new Map();

// 创建项目分享链接
export const createShareLink = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, projectName, expiresInDays = 7 } = req.body;
    const userId = req.user?.id || 'anonymous';

    if (!projectId) {
      return res.status(400).json({ success: false, error: '项目ID不能为空' });
    }

    // 生成唯一分享码
    const shareCode = generateShareCode();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + expiresInDays * 24 * 60 * 60 * 1000);

    // 存储分享信息
    shareLinks.set(shareCode, {
      projectId,
      projectName: projectName || '未命名项目',
      createdBy: userId,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      viewCount: 0,
    });

    // 生成分享链接
    const shareUrl = `${process.env.FRONTEND_URL || 'https://stratomind.vercel.app'}/shared/${shareCode}`;

    res.json({
      success: true,
      data: {
        shareCode,
        shareUrl,
        expiresAt: expiresAt.toISOString(),
        projectName: projectName || '未命名项目',
      }
    });
  } catch (error) {
    console.error('Create share link error:', error);
    res.status(500).json({ success: false, error: '创建分享链接失败' });
  }
};

// 获取分享内容
export const getShareContent = async (req: Request, res: Response) => {
  try {
    const { shareCode } = req.params;

    const shareInfo = shareLinks.get(shareCode);
    if (!shareInfo) {
      return res.status(404).json({ success: false, error: '分享链接不存在或已失效' });
    }

    // 检查是否过期
    if (new Date(shareInfo.expiresAt) < new Date()) {
      shareLinks.delete(shareCode);
      return res.status(410).json({ success: false, error: '分享链接已过期' });
    }

    // 增加浏览次数
    shareInfo.viewCount++;

    res.json({
      success: true,
      data: {
        projectId: shareInfo.projectId,
        projectName: shareInfo.projectName,
        createdAt: shareInfo.createdAt,
        viewCount: shareInfo.viewCount,
      }
    });
  } catch (error) {
    console.error('Get share content error:', error);
    res.status(500).json({ success: false, error: '获取分享内容失败' });
  }
};

// 验证分享链接
export const verifyShareLink = async (req: Request, res: Response) => {
  try {
    const { shareCode } = req.params;

    const shareInfo = shareLinks.get(shareCode);
    if (!shareInfo) {
      return res.json({
        success: true,
        data: { valid: false, error: '分享链接不存在或已失效' }
      });
    }

    // 检查是否过期
    if (new Date(shareInfo.expiresAt) < new Date()) {
      shareLinks.delete(shareCode);
      return res.json({
        success: true,
        data: { valid: false, error: '分享链接已过期' }
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        projectName: shareInfo.projectName,
        expiresAt: shareInfo.expiresAt,
      }
    });
  } catch (error) {
    console.error('Verify share link error:', error);
    res.status(500).json({ success: false, error: '验证分享链接失败' });
  }
};

// 取消分享
export const deleteShareLink = async (req: AuthRequest, res: Response) => {
  try {
    const { shareCode } = req.params;
    const userId = req.user?.id || 'anonymous';

    const shareInfo = shareLinks.get(shareCode);
    if (!shareInfo) {
      return res.status(404).json({ success: false, error: '分享链接不存在' });
    }

    // 验证权限
    if (shareInfo.createdBy !== userId) {
      return res.status(403).json({ success: false, error: '无权删除此分享链接' });
    }

    shareLinks.delete(shareCode);
    res.json({ success: true, message: '分享链接已删除' });
  } catch (error) {
    console.error('Delete share link error:', error);
    res.status(500).json({ success: false, error: '删除分享链接失败' });
  }
};

// 获取我的分享链接列表
export const getMyShareLinks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'anonymous';

    const myShares = Array.from(shareLinks.entries())
      .filter(([_, info]) => info.createdBy === userId)
      .map(([code, info]) => ({
        shareCode: code,
        shareUrl: `${process.env.FRONTEND_URL || 'https://stratomind.vercel.app'}/shared/${code}`,
        projectId: info.projectId,
        projectName: info.projectName,
        createdAt: info.createdAt,
        expiresAt: info.expiresAt,
        viewCount: info.viewCount,
        isExpired: new Date(info.expiresAt) < new Date(),
      }));

    res.json({ success: true, data: myShares });
  } catch (error) {
    console.error('Get my share links error:', error);
    res.status(500).json({ success: false, error: '获取分享链接列表失败' });
  }
};

// 绑定路由
router.post('/', authMiddleware, createShareLink);
router.get('/:shareCode', getShareContent);
router.get('/:shareCode/verify', verifyShareLink);
router.delete('/:shareCode', authMiddleware, deleteShareLink);
router.get('/', authMiddleware, getMyShareLinks);

export default router;
