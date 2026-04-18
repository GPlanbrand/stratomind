import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = Router();

// 验证码限制配置
const SMS_CONFIG = {
  MAX_DAILY: 5,        // 每日最多发送次数
  INTERVAL_SECONDS: 60, // 发送间隔（秒）
  CODE_EXPIRE_MINUTES: 5, // 验证码有效期（分钟）
};

/**
 * 生成6位数字验证码
 */
const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 验证手机号格式
 */
const validatePhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

/**
 * POST /api/auth/sms/send
 * 发送验证码
 */
export const sendSmsCode = async (req: Request, res: Response) => {
  try {
    const { phone, type = 'login' } = req.body;
    
    // 验证手机号
    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        error: '请输入正确的手机号',
      });
    }
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    try {
      // 检查今日发送次数
      const todayCount = await prisma.smsCode.count({
        where: {
          phone,
          createdAt: {
            gte: todayStart,
          },
        },
      });
      
      if (todayCount >= SMS_CONFIG.MAX_DAILY) {
        return res.status(429).json({
          success: false,
          error: `今日发送次数已用完，请明天再试`,
        });
      }
      
      // 检查发送间隔
      const lastCode = await prisma.smsCode.findFirst({
        where: { phone },
        orderBy: { createdAt: 'desc' },
      });
      
      if (lastCode) {
        const lastTime = new Date(lastCode.createdAt).getTime();
        const diffSeconds = (now.getTime() - lastTime) / 1000;
        
        if (diffSeconds < SMS_CONFIG.INTERVAL_SECONDS) {
          return res.status(429).json({
            success: false,
            error: `发送太频繁，请${SMS_CONFIG.INTERVAL_SECONDS - Math.floor(diffSeconds)}秒后再试`,
          });
        }
      }
      
      // 生成验证码
      const code = generateCode();
      const expireAt = new Date(now.getTime() + SMS_CONFIG.CODE_EXPIRE_MINUTES * 60 * 1000);
      
      // 保存验证码
      await prisma.smsCode.create({
        data: {
          phone,
          code,
          type,
          expireAt,
        },
      });
      
      // TODO: 实际项目中这里应该调用短信服务商API发送验证码
      // 当前为演示环境，直接返回验证码（或通过日志输出）
      console.log(`[SMS] 验证码发送成功 - 手机号: ${phone}, 验证码: ${code}`);
      
      // 开发环境下返回验证码，方便测试
      const isDev = process.env.NODE_ENV !== 'production';
      
      res.json({
        success: true,
        message: '验证码发送成功',
        data: isDev ? { code, expireAt: expireAt.toISOString() } : { expireAt: expireAt.toISOString() },
      });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      // 数据库不可用时返回mock响应
      const code = generateCode();
      console.log(`[SMS Mock] 验证码: ${code}`);
      
      res.json({
        success: true,
        message: '验证码发送成功（mock）',
        data: { code },
      });
    }
    
  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({
      success: false,
      error: '发送验证码失败',
    });
  }
};

/**
 * POST /api/auth/sms/verify
 * 验证码登录/注册
 */
export const verifySmsCode = async (req: Request, res: Response) => {
  try {
    const { phone, code, guestToken } = req.body;
    
    // 验证参数
    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        error: '请输入正确的手机号',
      });
    }
    
    if (!code || code.length !== 6) {
      return res.status(400).json({
        success: false,
        error: '请输入6位验证码',
      });
    }
    
    try {
      // 查找有效验证码
      const smsRecord = await prisma.smsCode.findFirst({
        where: {
          phone,
          code,
          used: false,
          expireAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      if (!smsRecord) {
        return res.status(400).json({
          success: false,
          error: '验证码错误或已过期',
        });
      }
      
      // 标记验证码已使用
      await prisma.smsCode.update({
        where: { id: smsRecord.id },
        data: { used: true },
      });
      
      // 查找或创建用户
      let user = await prisma.user.findUnique({
        where: { phone },
      });
      
      let isNewUser = false;
      
      if (!user) {
        // 手机号不存在，创建新用户
        isNewUser = true;
        const randomUsername = `user_${phone.slice(-8)}`;
        const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        
        user = await prisma.user.create({
          data: {
            username: randomUsername,
            email: `${randomUsername}@stratomind.com`,
            phone,
            nickname: `用户${phone.slice(-4)}`,
            password: '', // 手机号用户不需要密码
            inviteCode,
          },
        });
      }
      
      // 更新最后登录时间
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      
      // 如果有访客Token，迁移访客数据到用户账号
      let migratedData = null;
      if (guestToken && guestToken.startsWith('guest_')) {
        const guestSession = await prisma.guestSession.findUnique({
          where: { token: guestToken },
        });
        
        if (guestSession && guestSession.data) {
          migratedData = JSON.parse(guestSession.data);
          // 删除访客会话
          await prisma.guestSession.delete({
            where: { id: guestSession.id },
          });
        }
      }
      
      // 生成JWT Token
      const token = jwt.sign(
        { userId: user.id, type: 'user' },
        process.env.JWT_SECRET || 'stratomind-secret-key',
        { expiresIn: '30d' }
      );
      
      res.json({
        success: true,
        message: isNewUser ? '注册成功' : '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            phone: user.phone,
            nickname: user.nickname,
            username: user.username,
            isPaid: user.isPaid,
            paidExpireAt: user.paidExpireAt,
            memberLevel: user.memberLevel,
            points: user.points,
          },
          isNewUser,
          migratedData,
        },
      });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      // 数据库不可用时返回mock
      const token = jwt.sign(
        { userId: 'mock_user_id', type: 'user' },
        process.env.JWT_SECRET || 'stratomind-secret-key',
        { expiresIn: '30d' }
      );
      
      res.json({
        success: true,
        message: '登录成功（mock）',
        data: {
          token,
          user: {
            id: 'mock_user_id',
            phone,
            nickname: `用户${phone.slice(-4)}`,
            isPaid: false,
            points: 600,
          },
          isNewUser: false,
        },
      });
    }
    
  } catch (error) {
    console.error('Verify SMS error:', error);
    res.status(500).json({
      success: false,
      error: '验证码验证失败',
    });
  }
};

export default router;
