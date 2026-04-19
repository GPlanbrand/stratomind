import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// 所有路由都需要登录
router.use(authMiddleware);

// =============================================
// 获取消息列表
// GET /api/messages
// =============================================
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { 
      page = '1', 
      pageSize = '20', 
      type,
      isRead 
    } = req.query;

    const pageNum = parseInt(page as string);
    const size = Math.min(parseInt(pageSize as string), 100);
    const skip = (pageNum - 1) * size;

    // 构建查询条件
    const where: any = { userId };
    
    if (type) {
      where.type = type;
    }
    
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    // 获取消息列表
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: size,
      }),
      prisma.message.count({ where }),
    ]);

    // 获取未读消息数量
    const unreadCount = await prisma.message.count({
      where: { userId, isRead: false },
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: pageNum,
          pageSize: size,
          total,
          totalPages: Math.ceil(total / size),
        },
        unreadCount,
      },
    });
  } catch (error) {
    console.error('获取消息列表失败:', error);
    res.status(500).json({ success: false, error: '获取消息列表失败' });
  }
};

// =============================================
// 获取未读消息数量
// GET /api/messages/unread-count
// =============================================
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const count = await prisma.message.count({
      where: { userId, isRead: false },
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('获取未读消息数量失败:', error);
    res.status(500).json({ success: false, error: '获取未读消息数量失败' });
  }
};

// =============================================
// 标记单条消息已读
// PUT /api/messages/:id/read
// =============================================
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const message = await prisma.message.findFirst({
      where: { id, userId },
    });

    if (!message) {
      return res.status(404).json({ success: false, error: '消息不存在' });
    }

    await prisma.message.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({ success: true, message: '标记已读成功' });
  } catch (error) {
    console.error('标记已读失败:', error);
    res.status(500).json({ success: false, error: '标记已读失败' });
  }
};

// =============================================
// 标记所有消息已读
// PUT /api/messages/read-all
// =============================================
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    await prisma.message.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({ success: true, message: '全部标记已读成功' });
  } catch (error) {
    console.error('标记全部已读失败:', error);
    res.status(500).json({ success: false, error: '标记全部已读失败' });
  }
};

// =============================================
// 删除消息
// DELETE /api/messages/:id
// =============================================
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const message = await prisma.message.findFirst({
      where: { id, userId },
    });

    if (!message) {
      return res.status(404).json({ success: false, error: '消息不存在' });
    }

    await prisma.message.delete({ where: { id } });

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除消息失败:', error);
    res.status(500).json({ success: false, error: '删除消息失败' });
  }
};

// =============================================
// 发送消息 (内部使用/管理员使用)
// POST /api/messages/send
// =============================================
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { userId, title, content, type, link, priority, metadata } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要参数: userId, title, content' 
      });
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    const message = await prisma.message.create({
      data: {
        userId,
        title,
        content,
        type: type || 'system',
        link,
        priority: priority || 'normal',
        metadata: metadata ? JSON.stringify(metadata) : null,
        senderId: 'system',
      },
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({ success: false, error: '发送消息失败' });
  }
};

// =============================================
// 批量发送消息
// POST /api/messages/broadcast
// =============================================
export const broadcastMessage = async (req: Request, res: Response) => {
  try {
    const { userIds, title, content, type, link, priority, metadata } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供用户ID数组' 
      });
    }

    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要参数: title, content' 
      });
    }

    // 批量创建消息
    const messages = await prisma.message.createMany({
      data: userIds.map((userId: string) => ({
        userId,
        title,
        content,
        type: type || 'system',
        link,
        priority: priority || 'normal',
        metadata: metadata ? JSON.stringify(metadata) : null,
        senderId: 'system',
      })),
    });

    res.status(201).json({ 
      success: true, 
      data: { count: messages.count } 
    });
  } catch (error) {
    console.error('批量发送消息失败:', error);
    res.status(500).json({ success: false, error: '批量发送消息失败' });
  }
};

// =============================================
// 灵思Profile管理
// =============================================

// 获取灵思Profile
export const getLingsiProfile = async (req: Request, res: Response) => {
  try {
    let profile = await prisma.lingsiProfile.findFirst({
      where: { isActive: true },
    });

    // 如果没有profile，创建一个默认的
    if (!profile) {
      profile = await prisma.lingsiProfile.create({
        data: {
          name: '灵思',
          avatar: '/lingsi-avatar.png',
          title: '您的智能创意伙伴',
          description: '我是灵思，专注于品牌策划与创意生成的AI助手',
          greeting: '你好！我是灵思，很高兴为你服务~',
          isActive: true,
        },
      });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('获取灵思Profile失败:', error);
    res.status(500).json({ success: false, error: '获取灵思Profile失败' });
  }
};

// 更新灵思Profile (仅管理员)
export const updateLingsiProfile = async (req: AuthRequest, res: Response) => {
  try {
    // 检查管理员权限
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const { name, avatar, title, description, greeting, systemPrompt, settings } = req.body;

    let profile = await prisma.lingsiProfile.findFirst({
      where: { isActive: true },
    });

    if (profile) {
      profile = await prisma.lingsiProfile.update({
        where: { id: profile.id },
        data: {
          name: name || profile.name,
          avatar: avatar !== undefined ? avatar : profile.avatar,
          title: title || profile.title,
          description: description !== undefined ? description : profile.description,
          greeting: greeting !== undefined ? greeting : profile.greeting,
          systemPrompt: systemPrompt !== undefined ? systemPrompt : profile.systemPrompt,
          settings: settings ? JSON.stringify(settings) : profile.settings,
        },
      });
    } else {
      profile = await prisma.lingsiProfile.create({
        data: {
          name: name || '灵思',
          avatar,
          title: title || '您的智能创意伙伴',
          description,
          greeting,
          systemPrompt,
          settings: settings ? JSON.stringify(settings) : null,
          isActive: true,
        },
      });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('更新灵思Profile失败:', error);
    res.status(500).json({ success: false, error: '更新灵思Profile失败' });
  }
};

// =============================================
// 定时任务管理
// =============================================

// 获取定时任务列表
export const getScheduledTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.scheduledTask.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('获取定时任务失败:', error);
    res.status(500).json({ success: false, error: '获取定时任务失败' });
  }
};

// 创建定时任务
export const createScheduledTask = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const { name, type, cron, config } = req.body;

    if (!name || !type || !cron) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要参数: name, type, cron' 
      });
    }

    const task = await prisma.scheduledTask.create({
      data: {
        name,
        type,
        cron,
        config: JSON.stringify(config || {}),
        isActive: true,
      },
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('创建定时任务失败:', error);
    res.status(500).json({ success: false, error: '创建定时任务失败' });
  }
};

// 更新定时任务
export const updateScheduledTask = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const { id } = req.params;
    const { name, cron, config, isActive } = req.body;

    const task = await prisma.scheduledTask.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        cron: cron !== undefined ? cron : undefined,
        config: config !== undefined ? JSON.stringify(config) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('更新定时任务失败:', error);
    res.status(500).json({ success: false, error: '更新定时任务失败' });
  }
};

// 删除定时任务
export const deleteScheduledTask = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const { id } = req.params;

    await prisma.scheduledTask.delete({ where: { id } });

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除定时任务失败:', error);
    res.status(500).json({ success: false, error: '删除定时任务失败' });
  }
};

// 路由配置
router.get('/', getMessages);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteMessage);
router.post('/send', sendMessage);
router.post('/broadcast', broadcastMessage);

// 灵思Profile路由
router.get('/profile/lingsi', getLingsiProfile);
router.put('/profile/lingsi', updateLingsiProfile);

// 定时任务路由
router.get('/scheduled-tasks', getScheduledTasks);
router.post('/scheduled-tasks', createScheduledTask);
router.put('/scheduled-tasks/:id', updateScheduledTask);
router.delete('/scheduled-tasks/:id', deleteScheduledTask);

export default router;
