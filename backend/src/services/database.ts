import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 数据库初始化
export const initDatabase = async (req: any, res: Response) => {
  try {
    // 测试数据库连接
    await prisma.$connect();
    
    // 获取数据库中的表
    const tableCount = await prisma.$queryRaw`
      SELECT count(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    res.json({
      success: true,
      message: '数据库连接成功！',
      database: {
        host: 'Neon Postgres (ap-southeast-1)',
        tables: tables,
        status: 'connected'
      }
    });
  } catch (error: any) {
    console.error('Database init error:', error);
    res.status(500).json({
      success: false,
      error: '数据库连接失败',
      message: error.message,
      hint: '请检查 DATABASE_URL 环境变量是否正确'
    });
  } finally {
    await prisma.$disconnect();
  }
};
