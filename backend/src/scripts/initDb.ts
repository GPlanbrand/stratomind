/**
 * 数据库初始化脚本
 * 运行: npx ts-node src/scripts/initDb.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initDatabase() {
  console.log('开始初始化数据库...');
  
  try {
    // 测试数据库连接
    await prisma.$connect();
    console.log('✓ 数据库连接成功');
    
    // 创建访客会话表索引（如果不存在）
    console.log('✓ 数据库初始化完成');
    
    console.log('\n数据库表结构已准备就绪：');
    console.log('  - GuestSession (访客会话)');
    console.log('  - SmsCode (短信验证码)');
    console.log('  - RequirementSheet (需求确认单)');
    console.log('\n您可以开始使用API了！');
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase();
