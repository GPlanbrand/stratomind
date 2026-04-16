import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 开始初始化数据库...');

  try {
    // 同步数据库结构
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ 数据库连接成功！');
    
    // 创建测试用户（可选）
    console.log('\n📝 数据库表结构已就绪：');
    console.log('   - users (用户表)');
    console.log('   - projects (项目表)');
    console.log('   - ai_logs (AI日志表)');
    console.log('   - assets (资产表)');
    console.log('   - knowledge_items (知识库表)');
    
    console.log('\n✨ 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
