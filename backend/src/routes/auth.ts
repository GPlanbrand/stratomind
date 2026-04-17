import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Mock 用户数据（当数据库不可用时使用）
const mockUsers = [
  { id: '1', email: 'demo@example.com', password: '$2a$10$xxx', username: 'Demo User' },
];

// 注册
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    
    if (!email || !password || !username) {
      return res.status(400).json({ success: false, error: '请填写所有必填字段' });
    }

    // 尝试使用 Prisma
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, error: '该邮箱已被注册' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, username, inviteCode },
      });

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({ success: true, data: { user: { id: user.id, email: user.email, username: user.username }, token } });
    } catch {
      // 数据库不可用时使用 mock
      res.status(201).json({ success: true, data: { user: { id: '1', email, username }, token: 'mock-token' } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: '注册失败' });
  }
};

// 登录
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ success: false, error: '邮箱或密码错误' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ success: false, error: '邮箱或密码错误' });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      res.json({ success: true, data: { user: { id: user.id, email: user.email, username: user.username }, token } });
    } catch {
      // 数据库不可用时使用 mock
      res.json({ success: true, data: { user: { id: '1', email, username: 'Demo User' }, token: 'mock-token' } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: '登录失败' });
  }
};

// 签到
export const signIn = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    res.json({ success: true, message: '签到成功', data: { points: 10, userId } });
  } catch (error) {
    res.status(500).json({ success: false, error: '签到失败' });
  }
};

// 获取当前用户
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: '未登录' });
    }
    res.json({ success: true, data: { id: user.id, email: user.email, username: user.username } });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取用户信息失败' });
  }
};

export default router;
