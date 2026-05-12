import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

const router = Router();

// 超级管理员配置 - 通过环境变量设置
const SUPERADMIN_CONFIG = {
  username: process.env.SUPERADMIN_USERNAME || 'superadmin',
  password: process.env.SUPERADMIN_PASSWORD || 'superadmin123'
};

// 普通管理员配置
const ADMIN_CONFIG = {
  username: 'admin',
  password: 'admin123'
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

    let role = 'admin';
    let userId = '';

    // 验证超级管理员
    if (username === SUPERADMIN_CONFIG.username && password === SUPERADMIN_CONFIG.password) {
      role = 'superadmin';
      userId = 'superadmin';
    } 
    // 验证普通管理员
    else if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
      role = 'admin';
      userId = 'admin';
    }
    // 验证数据库中的管理员
    else {
      const admin = await prisma.user.findFirst({
        where: { 
          username, 
          role: { in: ['admin', 'superadmin'] }
        }
      });
      
      if (admin) {
        const validPassword = await bcrypt.compare(password, admin.password);
        if (validPassword) {
          role = admin.role;
          userId = admin.id;
        }
      }
    }

    // 如果都不匹配
    if (!userId) {
      return res.status(401).json({ success: false, error: '用户名或密码错误' });
    }

    // 生成token
    const token = jwt.sign(
      { username, role, userId },
      ADMIN_JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        admin: { username, role }
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
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as { username: string; role: string; userId: string };

    if (!['admin', 'superadmin'].includes(decoded.role)) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    (req as any).admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token无效或已过期' });
  }
};

// 验证超级管理员
export const verifySuperAdmin = (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: '未授权访问' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as { username: string; role: string; userId: string };

    if (decoded.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '需要超级管理员权限' });
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
    const [
      totalUsers, totalProjects, todayNewUsers, todayNewProjects, 
      activeProjects, todayAILogs, totalAILogs
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.project.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.project.count({ where: { status: 'active' } }),
      prisma.aILog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.aILog.count()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        todayNewUsers,
        todayNewProjects,
        activeProjects,
        todayAILogs,
        totalAILogs
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, error: '获取统计数据失败' });
  }
});

// 获取每日统计数据
router.get('/stats/daily', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const range = req.query.range === '30' ? 30 : 7;
    const now = new Date();
    
    // 生成日期范围
    const dates: string[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    const startDate = new Date(dates[0]);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dates[dates.length - 1]);
    endDate.setHours(23, 59, 59, 999);
    
    // 并行查询用户、项目、AI日志数据
    const [dailyUsers, dailyProjects, dailyAI, levelCounts, recentUsers, recentProjects] = await Promise.all([
      // 每日新增用户
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: { createdAt: true },
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      // 每日创建项目
      prisma.project.groupBy({
        by: ['createdAt'],
        _count: { createdAt: true },
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      // 每日AI调用
      prisma.aILog.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      // 会员等级分布
      prisma.user.groupBy({
        by: ['memberLevel'],
        _count: { memberLevel: true }
      }),
      // 最近注册用户
      prisma.user.findMany({
        select: { id: true, username: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      // 最近创建项目
      prisma.project.findMany({
        select: { id: true, name: true, status: true, createdAt: true, user: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);
    
    // 转换为日期映射
    const userMap = new Map<string, number>();
    const projectMap = new Map<string, number>();
    const aiMap = new Map<string, number>();
    
    dailyUsers.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      userMap.set(date, (userMap.get(date) || 0) + item._count.createdAt);
    });
    
    dailyProjects.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      projectMap.set(date, (projectMap.get(date) || 0) + item._count.createdAt);
    });
    
    dailyAI.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      aiMap.set(date, (aiMap.get(date) || 0) + item._count.id);
    });
    
    // 构建每日数据
    const daily = dates.map(date => ({
      date,
      users: userMap.get(date) || 0,
      projects: projectMap.get(date) || 0,
      aiCalls: aiMap.get(date) || 0
    }));
    
    // 会员等级映射
    const levelMap: Record<string, { name: string; value: number }> = {
      normal: { name: '普通会员', value: 0 },
      silver: { name: '白银会员', value: 0 },
      gold: { name: '黄金会员', value: 0 },
      diamond: { name: '钻石会员', value: 0 }
    };
    
    levelCounts.forEach(item => {
      if (levelMap[item.memberLevel]) {
        levelMap[item.memberLevel].value = item._count.memberLevel;
      }
    });
    
    res.json({
      success: true,
      data: {
        daily,
        levels: Object.values(levelMap),
        recentUsers: recentUsers.map(u => ({ id: u.id, username: u.username, createdAt: u.createdAt })),
        recentProjects: recentProjects.map(p => ({ id: p.id, name: p.name, status: p.status, username: p.user.username, createdAt: p.createdAt }))
      }
    });
  } catch (error) {
    console.error('Get daily stats error:', error);
    res.status(500).json({ success: false, error: '获取每日统计数据失败' });
  }
});

// 获取仪表盘完整数据
router.get('/stats/dashboard', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 获取本周和上月同期的数据
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastMonthStart = new Date(monthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    // 并行查询多个统计数据
    const [
      totalUsers, totalProjects, 
      todayNewUsers, todayNewProjects,
      weekNewUsers, weekNewProjects,
      monthNewUsers, monthNewProjects,
      activeProjects, 
      todayAILogs, weekAILogs, monthAILogs, totalAILogs,
      todayRecharges, weekRecharges, monthRecharges, totalRecharges,
      vipUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      // 今日新增
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.project.count({ where: { createdAt: { gte: todayStart } } }),
      // 本周新增
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.project.count({ where: { createdAt: { gte: weekStart } } }),
      // 本月新增
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.project.count({ where: { createdAt: { gte: monthStart } } }),
      // 活跃项目
      prisma.project.count({ where: { status: 'active', updatedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } } }),
      // AI调用
      prisma.aILog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.aILog.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.aILog.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.aILog.count(),
      // 充值
      prisma.rechargeRecord.count({ where: { createdAt: { gte: todayStart }, status: 'completed' } }),
      prisma.rechargeRecord.count({ where: { createdAt: { gte: weekStart }, status: 'completed' } }),
      prisma.rechargeRecord.count({ where: { createdAt: { gte: monthStart }, status: 'completed' } }),
      prisma.rechargeRecord.aggregate({ where: { status: 'completed' }, _sum: { amount: true } }),
      // VIP用户
      prisma.user.count({ where: { memberLevel: { in: ['gold', 'diamond'] } } })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        todayNewUsers,
        todayNewProjects,
        weekNewUsers,
        weekNewProjects,
        monthNewUsers,
        monthNewProjects,
        activeProjects,
        todayAILogs,
        weekAILogs,
        monthAILogs,
        totalAILogs,
        todayRecharges,
        weekRecharges,
        monthRecharges,
        totalRecharges: totalRecharges._sum.amount || 0,
        vipUsers
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, error: '获取仪表盘数据失败' });
  }
});

// 获取趋势数据
router.get('/stats/trend', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const range = req.query.range as string || 'week';
    let days = 7;
    if (range === 'month') days = 30;
    else if (range === 'today') days = 1;
    
    const now = new Date();
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    const startDate = new Date(dates[0]);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dates[dates.length - 1]);
    endDate.setHours(23, 59, 59, 999);
    
    // 并行查询
    const [dailyUsers, dailyProjects, dailyAI, levelCounts] = await Promise.all([
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: { createdAt: true },
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.project.groupBy({
        by: ['createdAt'],
        _count: { createdAt: true },
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.aILog.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.user.groupBy({
        by: ['memberLevel'],
        _count: { memberLevel: true }
      })
    ]);
    
    // 转换为日期映射
    const userMap = new Map<string, number>();
    const projectMap = new Map<string, number>();
    const aiMap = new Map<string, number>();
    
    dailyUsers.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      userMap.set(date, (userMap.get(date) || 0) + item._count.createdAt);
    });
    
    dailyProjects.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      projectMap.set(date, (projectMap.get(date) || 0) + item._count.createdAt);
    });
    
    dailyAI.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      aiMap.set(date, (aiMap.get(date) || 0) + item._count.id);
    });
    
    // 构建趋势数据
    const trend = dates.map(date => ({
      date,
      users: userMap.get(date) || 0,
      projects: projectMap.get(date) || 0,
      aiCalls: aiMap.get(date) || 0,
      recharges: 0
    }));
    
    // 会员等级映射
    const levelMap: Record<string, { name: string; value: number }> = {
      normal: { name: '普通会员', value: 0 },
      silver: { name: '白银会员', value: 0 },
      gold: { name: '黄金会员', value: 0 },
      diamond: { name: '钻石会员', value: 0 }
    };
    
    levelCounts.forEach(item => {
      if (levelMap[item.memberLevel]) {
        levelMap[item.memberLevel].value = item._count.memberLevel;
      }
    });
    
    res.json({
      success: true,
      data: {
        trend,
        levels: Object.values(levelMap)
      }
    });
  } catch (error) {
    console.error('Get trend data error:', error);
    res.status(500).json({ success: false, error: '获取趋势数据失败' });
  }
});

// 获取最新动态
router.get('/activities', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const now = new Date();
    
    // 获取最近的活动
    const [recentUsers, recentProjects, recentAI, recentRecharges] = await Promise.all([
      // 最近注册用户
      prisma.user.findMany({
        select: { id: true, username: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      // 最近创建项目
      prisma.project.findMany({
        select: { id: true, name: true, createdAt: true, user: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      // 最近AI使用
      prisma.aILog.findMany({
        select: { id: true, type: true, input: true, createdAt: true, user: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      // 最近充值
      prisma.rechargeRecord.findMany({
        where: { status: 'completed' },
        select: { id: true, amount: true, createdAt: true, user: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    ]);
    
    // 合并并排序所有活动
    interface Activity {
      id: string;
      type: 'user' | 'project' | 'ai' | 'recharge' | 'member';
      title: string;
      description: string;
      time: string;
      timestamp: Date;
    }
    
    const activities: Activity[] = [];
    
    recentUsers.forEach(u => {
      activities.push({
        id: `user-${u.id}`,
        type: 'user',
        title: `用户 ${u.username} 注册了账号`,
        description: u.email || '',
        time: formatTimeAgo(u.createdAt),
        timestamp: u.createdAt
      });
    });
    
    recentProjects.forEach(p => {
      activities.push({
        id: `project-${p.id}`,
        type: 'project',
        title: `项目"${p.name}"已创建`,
        description: `创建者：${p.user.username}`,
        time: formatTimeAgo(p.createdAt),
        timestamp: p.createdAt
      });
    });
    
    recentAI.forEach(ai => {
      activities.push({
        id: `ai-${ai.id}`,
        type: 'ai',
        title: `AI使用了${ai.type}`,
        description: `${ai.input.substring(0, 50)}${ai.input.length > 50 ? '...' : ''} - 用户：${ai.user.username}`,
        time: formatTimeAgo(ai.createdAt),
        timestamp: ai.createdAt
      });
    });
    
    recentRecharges.forEach(r => {
      activities.push({
        id: `recharge-${r.id}`,
        type: 'recharge',
        title: `用户充值 ${r.amount} 积分`,
        description: `用户：${r.user.username}`,
        time: formatTimeAgo(r.createdAt),
        timestamp: r.createdAt
      });
    });
    
    // 按时间排序并限制数量
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    res.json({
      success: true,
      data: activities.slice(0, limit).map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        time: a.time
      }))
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ success: false, error: '获取动态失败' });
  }
});

// 格式化时间差
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}

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
          province: true,
          city: true,
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
    const { points, memberLevel, memberExpiresAt, province, city } = req.body;

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
    if (province !== undefined) updateData.province = province || null;
    if (city !== undefined) updateData.city = city || null;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        memberLevel: true,
        points: true,
        province: true,
        city: true,
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

// ==================== 会员管理 ====================

// 获取会员等级统计
router.get('/members/stats', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await prisma.user.groupBy({
      by: ['memberLevel'],
      _count: { memberLevel: true }
    });
    
    const total = await prisma.user.count();
    
    const levelMap: Record<string, { name: string; count: number; percentage: number }> = {
      normal: { name: '普通会员', count: 0, percentage: 0 },
      silver: { name: '白银会员', count: 0, percentage: 0 },
      gold: { name: '黄金会员', count: 0, percentage: 0 },
      diamond: { name: '钻石会员', count: 0, percentage: 0 }
    };
    
    stats.forEach(item => {
      if (levelMap[item.memberLevel]) {
        levelMap[item.memberLevel].count = item._count.memberLevel;
        levelMap[item.memberLevel].percentage = total > 0 ? parseFloat((item._count.memberLevel / total * 100).toFixed(1)) : 0;
      }
    });
    
    res.json({
      success: true,
      data: {
        levels: Object.entries(levelMap).map(([key, val]) => ({ level: key, ...val })),
        total
      }
    });
  } catch (error) {
    console.error('Get member stats error:', error);
    res.status(500).json({ success: false, error: '获取会员统计失败' });
  }
});

// ==================== 积分管理 ====================

// 获取积分流水
router.get('/points/logs', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', userId = '', type = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    
    const [logs, total] = await Promise.all([
      prisma.pointsLog.findMany({
        where,
        include: { user: { select: { username: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.pointsLog.count({ where })
    ]);
    
    res.json({
      success: true,
      data: { logs, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } }
    });
  } catch (error) {
    console.error('Get points logs error:', error);
    res.status(500).json({ success: false, error: '获取积分流水失败' });
  }
});

// 手动调整用户积分
router.post('/points/adjust', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, amount, reason } = req.body;
    const admin = (req as any).admin;
    
    if (!userId || amount === undefined || !reason) {
      return res.status(400).json({ success: false, error: '参数不完整' });
    }
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    
    const newBalance = user.points + amount;
    if (newBalance < 0) {
      return res.status(400).json({ success: false, error: '积分不足' });
    }
    
    // 更新用户积分
    await prisma.user.update({
      where: { id: userId },
      data: { points: newBalance }
    });
    
    // 记录积分流水
    await prisma.pointsLog.create({
      data: {
        userId,
        type: 'adjust',
        amount,
        balance: newBalance,
        reason,
        adminId: admin.username
      }
    });
    
    // 记录操作日志
    await prisma.adminLog.create({
      data: {
        adminId: user.id,
        adminName: admin.username,
        action: 'adjust_points',
        targetType: 'points',
        targetId: userId,
        detail: `调整用户 ${user.username} 积分 ${amount > 0 ? '+' : ''}${amount}，原因：${reason}`
      }
    });
    
    res.json({ success: true, message: '积分调整成功', data: { newBalance } });
  } catch (error) {
    console.error('Adjust points error:', error);
    res.status(500).json({ success: false, error: '积分调整失败' });
  }
});

// ==================== 充值管理 ====================

// 获取充值记录
router.get('/recharges', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', userId = '', status = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    
    const [records, total] = await Promise.all([
      prisma.rechargeRecord.findMany({
        where,
        include: { user: { select: { username: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.rechargeRecord.count({ where })
    ]);
    
    res.json({
      success: true,
      data: { records, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } }
    });
  } catch (error) {
    console.error('Get recharges error:', error);
    res.status(500).json({ success: false, error: '获取充值记录失败' });
  }
});

// 创建充值记录（手动录入）
router.post('/recharges', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, amount, points, remark } = req.body;
    const admin = (req as any).admin;
    
    if (!userId || !amount || !points) {
      return res.status(400).json({ success: false, error: '参数不完整' });
    }
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    
    // 创建充值记录
    const record = await prisma.rechargeRecord.create({
      data: {
        userId,
        amount,
        points,
        paymentMethod: 'offline',
        status: 'completed',
        remark,
        operatorId: admin.username,
        completedAt: new Date()
      }
    });
    
    // 更新用户积分和累计充值
    const newBalance = user.points + points;
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: newBalance,
        totalRecharge: user.totalRecharge + amount
      }
    });
    
    // 记录积分流水
    await prisma.pointsLog.create({
      data: {
        userId,
        type: 'recharge',
        amount: points,
        balance: newBalance,
        reason: `线下充值：${amount}元`,
        orderNo: record.id
      }
    });
    
    // 记录操作日志
    await prisma.adminLog.create({
      data: {
        adminId: user.id,
        adminName: admin.username,
        action: 'create_recharge',
        targetType: 'recharge',
        targetId: record.id,
        detail: `为用户 ${user.username} 充值 ${points} 积分，金额：${amount}元`
      }
    });
    
    res.json({ success: true, message: '充值成功', data: record });
  } catch (error) {
    console.error('Create recharge error:', error);
    res.status(500).json({ success: false, error: '创建充值记录失败' });
  }
});

// ==================== AI使用记录 ====================

// 获取AI使用记录
router.get('/ai-logs', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', userId = '', type = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    
    const [logs, total] = await Promise.all([
      prisma.aILog.findMany({
        where,
        include: { user: { select: { username: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.aILog.count({ where })
    ]);
    
    // 统计总消耗
    const totalCost = await prisma.aILog.aggregate({
      where,
      _sum: { pointsCost: true }
    });
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
        totalCost: totalCost._sum.pointsCost || 0
      }
    });
  } catch (error) {
    console.error('Get AI logs error:', error);
    res.status(500).json({ success: false, error: '获取AI使用记录失败' });
  }
});

// ==================== 文件管理 ====================

// 获取文件列表
router.get('/files', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', userId = '', type = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    
    const [files, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: { user: { select: { username: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.asset.count({ where })
    ]);
    
    // 统计总大小
    const totalSize = await prisma.asset.aggregate({
      where,
      _sum: { size: true }
    });
    
    res.json({
      success: true,
      data: {
        files,
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
        totalSize: totalSize._sum.size || 0
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ success: false, error: '获取文件列表失败' });
  }
});

// 删除文件
router.delete('/files/:id', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const admin = (req as any).admin;
    
    const file = await prisma.asset.findUnique({ where: { id } });
    if (!file) {
      return res.status(404).json({ success: false, error: '文件不存在' });
    }
    
    await prisma.asset.delete({ where: { id } });
    
    // 记录操作日志
    await prisma.adminLog.create({
      data: {
        adminId: file.userId,
        adminName: admin.username,
        action: 'delete_file',
        targetType: 'file',
        targetId: id,
        detail: `删除文件：${file.name}`
      }
    });
    
    res.json({ success: true, message: '文件已删除' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ success: false, error: '删除文件失败' });
  }
});

// ==================== 知识库管理 ====================

// 获取知识库列表
router.get('/knowledge', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', userId = '', category = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (category) where.category = category;
    
    const [items, total] = await Promise.all([
      prisma.knowledgeItem.findMany({
        where,
        include: { user: { select: { username: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.knowledgeItem.count({ where })
    ]);
    
    res.json({
      success: true,
      data: { items, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } }
    });
  } catch (error) {
    console.error('Get knowledge error:', error);
    res.status(500).json({ success: false, error: '获取知识库失败' });
  }
});

// 删除知识库条目
router.delete('/knowledge/:id', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const admin = (req as any).admin;
    
    const item = await prisma.knowledgeItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ success: false, error: '知识库条目不存在' });
    }
    
    await prisma.knowledgeItem.delete({ where: { id } });
    
    await prisma.adminLog.create({
      data: {
        adminId: item.userId,
        adminName: admin.username,
        action: 'delete_knowledge',
        targetType: 'knowledge',
        targetId: id,
        detail: `删除知识库：${item.title}`
      }
    });
    
    res.json({ success: true, message: '已删除' });
  } catch (error) {
    console.error('Delete knowledge error:', error);
    res.status(500).json({ success: false, error: '删除失败' });
  }
});

// ==================== 操作日志 ====================

// 获取操作日志
router.get('/logs', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', action = '', targetType = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = {};
    if (action) where.action = action;
    if (targetType) where.targetType = targetType;
    
    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.adminLog.count({ where })
    ]);
    
    res.json({
      success: true,
      data: { logs, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } }
    });
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({ success: false, error: '获取操作日志失败' });
  }
});

// ==================== 用户操作日志 ====================

// 获取用户操作日志
router.get('/user-action-logs', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', userId = '', actionType = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (actionType) where.actionType = actionType;
    
    const [logs, total] = await Promise.all([
      prisma.userActionLog.findMany({
        where,
        include: { user: { select: { username: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.userActionLog.count({ where })
    ]);
    
    res.json({
      success: true,
      data: { logs, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } }
    });
  } catch (error) {
    console.error('Get user action logs error:', error);
    res.status(500).json({ success: false, error: '获取用户操作日志失败' });
  }
});

// ==================== 管理员管理（仅超级管理员） ====================

// 获取管理员列表
router.get('/admins', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'superadmin'] } },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: admins });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ success: false, error: '获取管理员列表失败' });
  }
});

// 创建管理员
router.post('/admins', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { username, password, email, role = 'admin' } = req.body;
    const admin = (req as any).admin;
    
    if (!username || !password || !email) {
      return res.status(400).json({ success: false, error: '请填写完整信息' });
    }
    
    // 检查用户名是否已存在
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });
    
    if (existing) {
      return res.status(400).json({ success: false, error: '用户名或邮箱已存在' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 生成邀请码
    const inviteCode = `ADMIN_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // 创建管理员
    const newAdmin = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        memberLevel: 'diamond', // 管理员默认钻石会员
        points: 999999,
        inviteCode // 必填字段
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    // 记录操作日志
    await prisma.adminLog.create({
      data: {
        adminId: 'system',
        adminName: admin.username,
        action: 'create_admin',
        targetType: 'admin',
        targetId: newAdmin.id,
        detail: `创建管理员：${username}，角色：${role}`
      }
    });
    
    res.json({ success: true, message: '管理员创建成功', data: newAdmin });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ success: false, error: '创建管理员失败' });
  }
});

// 删除管理员
router.delete('/admins/:id', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const admin = (req as any).admin;
    
    // 不能删除自己
    if (id === admin.userId) {
      return res.status(400).json({ success: false, error: '不能删除自己' });
    }
    
    const targetAdmin = await prisma.user.findUnique({ where: { id } });
    
    if (!targetAdmin) {
      return res.status(404).json({ success: false, error: '管理员不存在' });
    }
    
    if (targetAdmin.role === 'superadmin') {
      return res.status(400).json({ success: false, error: '不能删除超级管理员' });
    }
    
    await prisma.user.delete({ where: { id } });
    
    // 记录操作日志
    await prisma.adminLog.create({
      data: {
        adminId: 'system',
        adminName: admin.username,
        action: 'delete_admin',
        targetType: 'admin',
        targetId: id,
        detail: `删除管理员：${targetAdmin.username}`
      }
    });
    
    res.json({ success: true, message: '管理员已删除' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ success: false, error: '删除管理员失败' });
  }
});
