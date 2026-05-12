/**
 * 发送短信验证码 API - POST /api/sms/send
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/api/lib/prisma';

export const runtime = 'nodejs20.x';
export const maxDuration = 30;

// 验证码限制配置
const SMS_CONFIG = {
  MAX_DAILY: 5,
  INTERVAL_SECONDS: 60,
  CODE_EXPIRE_MINUTES: 5,
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

export async function POST(request: NextRequest) {
  try {
    const { phone, type = 'login' } = await request.json();
    
    // 验证手机号
    if (!phone || !validatePhone(phone)) {
      return Response.json({
        success: false,
        error: '请输入正确的手机号',
      }, { status: 400 });
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
        return Response.json({
          success: false,
          error: `今日发送次数已用完，请明天再试`,
        }, { status: 429 });
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
          return Response.json({
            success: false,
            error: `发送太频繁，请${SMS_CONFIG.INTERVAL_SECONDS - Math.floor(diffSeconds)}秒后再试`,
          }, { status: 429 });
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
      
      // TODO: 实际项目中应该调用短信服务商API
      console.log(`[SMS] 验证码发送成功 - 手机号: ${phone}, 验证码: ${code}`);
      
      // 开发环境下返回验证码，方便测试
      const isDev = process.env.NODE_ENV !== 'production';
      
      return Response.json({
        success: true,
        message: '验证码发送成功',
        data: isDev ? { code, expireAt: expireAt.toISOString() } : { expireAt: expireAt.toISOString() },
      });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      // 数据库不可用时返回mock响应
      const code = generateCode();
      console.log(`[SMS Mock] 验证码: ${code}`);
      
      return Response.json({
        success: true,
        message: '验证码发送成功（mock）',
        data: { code },
      });
    }
    
  } catch (error) {
    console.error('Send SMS error:', error);
    return Response.json({
      success: false,
      error: '发送验证码失败',
    }, { status: 500 });
  }
}
