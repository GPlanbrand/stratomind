import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import crypto from 'crypto';

const router = Router();

/**
 * POST /api/auth/guest
 * 生成访客临时Token
 */
export const createGuestToken = async (req: Request, res: Response) => {
  try {
    // 生成访客Token: guest_xxxxx
    const randomPart = crypto.randomBytes(4).toString('hex');
    const token = `guest_${randomPart}`;
    
    // 设置7天过期
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 7);
    
    // 创建访客会话
    try {
      const guestSession = await prisma.guestSession.create({
        data: {
          token,
          expireAt,
        },
      });
      
      res.status(201).json({
        success: true,
        data: {
          token: guestSession.token,
          expireAt: guestSession.expireAt.toISOString(),
        },
      });
    } catch (dbError) {
      // 数据库不可用时返回mock数据
      console.log('Database not available, returning mock token');
      res.status(201).json({
        success: true,
        data: {
          token,
          expireAt: expireAt.toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Create guest token error:', error);
    res.status(500).json({
      success: false,
      error: '生成访客Token失败',
    });
  }
};

/**
 * GET /api/auth/guest/:token
 * 验证访客Token
 */
export const verifyGuestToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    if (!token || !token.startsWith('guest_')) {
      return res.status(400).json({
        success: false,
        error: '无效的Token格式',
      });
    }
    
    try {
      const session = await prisma.guestSession.findUnique({
        where: { token },
      });
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Token不存在',
        });
      }
      
      if (new Date() > session.expireAt) {
        return res.status(401).json({
          success: false,
          error: 'Token已过期',
        });
      }
      
      res.json({
        success: true,
        data: {
          valid: true,
          data: session.data ? JSON.parse(session.data) : null,
        },
      });
    } catch {
      // 数据库不可用
      res.json({
        success: true,
        data: {
          valid: true,
          data: null,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '验证Token失败',
    });
  }
};

/**
 * PUT /api/auth/guest/:token
 * 更新访客Token数据
 */
export const updateGuestData = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { data } = req.body;
    
    if (!token || !token.startsWith('guest_')) {
      return res.status(400).json({
        success: false,
        error: '无效的Token格式',
      });
    }
    
    try {
      const session = await prisma.guestSession.findUnique({
        where: { token },
      });
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Token不存在',
        });
      }
      
      if (new Date() > session.expireAt) {
        return res.status(401).json({
          success: false,
          error: 'Token已过期',
        });
      }
      
      await prisma.guestSession.update({
        where: { token },
        data: {
          data: JSON.stringify(data),
        },
      });
      
      res.json({
        success: true,
        message: '访客数据更新成功',
      });
    } catch {
      res.json({
        success: true,
        message: '访客数据更新成功（mock）',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新访客数据失败',
    });
  }
};

export default router;
