import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

const router = Router();

// 管理员配置 - 实际生产环境建议存储在数据库或环境变量
const ADMIN_CONFIG = {
  username: 'admin',
  password: 'admin123' // 生产环境请使用更复杂的密码并加密存储
};

// 生成管理员token的密钥
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'stratomind-admin-secret-key-2024';

// 管理员登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: '请填写用户名和密码' });
    }

    // 验证管理员凭据
    if (username !== ADMIN_CONFIG.username || password !== ADMIN_CONFIG.password) {
      return res.status(401).json({ success: false, error: '用户名或密码错误' });
    }

    // 生成token
    const token = jwt.sign(
      { username, role: 'admin' },
      ADMIN_JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        admin: { username }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, error: '登录失败' });
  }
});

// 验证管理员token
export const verifyAdmin = (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: '未授权访问' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as { username: string; role: string };

    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    (req as any).admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token无效或已过期' });
  }
};

// 获取统计数据
router.get('/stats', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 并行查询多个统计数据
    const [totalUsers, totalProjects, todayNewUsers, activeProjects] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.user.count({
        where: { createdAt: { gte: todayStart } }
      }),
      prisma.project.count({
        where: { status: 'active' }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        todayNewUsers,
        activeProjects
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, error: '获取统计数据失败' });
  }
});

// 获取用户列表
router.get('/users', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', search = '', level = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件
    const where: any = {};
    
    if (search) {
      where.OR = [
        { username: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (level) {
      where.memberLevel = level;
    }

    // 查询用户列表和总数
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          memberLevel: true,
          points: true,
          signInDays: true,
          inviteCode: true,
          invitedBy: true,
          createdAt: true,
          lastLoginAt: true,
          memberExpiresAt: true,
          _count: {
            select: {
              projects: true,
              aiLogs: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: '获取用户列表失败' });
  }
});

// 更新用户信息
router.put('/users/:id', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { points, memberLevel, memberExpiresAt } = req.body;

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // 构建更新数据
    const updateData: any = {};
    if (points !== undefined) updateData.points = points;
    if (memberLevel !== undefined) updateData.memberLevel = memberLevel;
    if (memberExpiresAt !== undefined) updateData.memberExpiresAt = memberExpiresAt ? new Date(memberExpiresAt) : null;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        memberLevel: true,
        points: true,
        memberExpiresAt: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: '用户信息更新成功'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: '更新用户信息失败' });
  }
});

// 获取项目列表
router.get('/projects', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status = '', userId = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件
    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    // 查询项目列表和总数
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          name: true,
          clientName: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, error: '获取项目列表失败' });
  }
});

// 删除项目
router.delete('/projects/:id', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }

    await prisma.project.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: '项目删除成功'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, error: '删除项目失败' });
  }
});

export default router;
