/**
 * 验证短信验证码 API - POST /api/sms/verify
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@/api/lib/prisma';

export const runtime = 'nodejs20.x';
export const maxDuration = 30;

/**
 * 验证手机号格式
 */
const validatePhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

export async function POST(request: NextRequest) {
  try {
    const { phone, code, guestToken } = await request.json();
    const JWT_SECRET = process.env.JWT_SECRET || 'stratomind-secret-key';
    
    // 验证参数
    if (!phone || !validatePhone(phone)) {
      return Response.json({
        success: false,
        error: '请输入正确的手机号',
      }, { status: 400 });
    }
    
    if (!code || code.length !== 6) {
      return Response.json({
        success: false,
        error: '请输入6位验证码',
      }, { status: 400 });
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
        return Response.json({
          success: false,
          error: '验证码错误或已过期',
        }, { status: 400 });
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
            password: '',
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
          await prisma.guestSession.delete({
            where: { id: guestSession.id },
          });
        }
      }
      
      // 生成JWT Token
      const token = jwt.sign(
        { userId: user.id, type: 'user' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      return Response.json({
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
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      return Response.json({
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
    return Response.json({
      success: false,
      error: '验证码验证失败',
    }, { status: 500 });
  }
}
