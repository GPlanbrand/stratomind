import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未登录，请先登录' });
    }

    const token = authHeader.split(' ')[1];
    
    // 使用与sms.ts一致的JWT secret
    const jwtSecret = process.env.JWT_SECRET || 'stratomind-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; type?: string };
    
    // 验证用户存在
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return res.status(401).json({ error: '用户不存在' });
      }

      req.userId = decoded.userId;
      req.user = user;
      next();
    } catch {
      // 数据库不可用时，验证通过（mock模式）
      // 允许带有mock_user_id前缀的token通过
      if (decoded.userId && decoded.userId.startsWith('mock_')) {
        req.userId = decoded.userId;
        req.user = { id: decoded.userId, mock: true };
        return next();
      }
      return res.status(401).json({ error: '用户不存在' });
    }
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '登录已过期，请重新登录' });
    }
    return res.status(401).json({ error: '认证失败' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };
      req.userId = decoded.userId;
    }
    next();
  } catch {
    // 忽略错误，继续执行
    next();
  }
};
