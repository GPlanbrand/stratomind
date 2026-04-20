/**
 * 灵思智能体 - 定时任务示例
 * 
 * 这些任务可以通过外部调度器（如 cron-job.org, GitHub Actions 等）触发
 * 也可以通过集成 node-cron 在后端直接运行
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =============================================
// 1. 每日行业新闻推送
// =============================================
export async function sendDailyNewsDigest() {
  console.log('[定时任务] 开始发送每日新闻推送...');
  
  try {
    // 获取所有用户
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      select: { id: true, email: true },
    });

    // 模拟获取行业新闻（实际应调用新闻API）
    const newsItems = [
      {
        title: '2024年品牌营销趋势报告发布',
        summary: '最新报告显示，AI驱动的个性化营销正在成为主流...',
        source: '行业观察',
      },
      {
        title: 'Z世代消费行为洞察',
        summary: '研究发现，Z世代更注重品牌价值观和可持续性...',
        source: '市场研究',
      },
    ];

    // 发送消息给每个用户
    for (const user of users) {
      await prisma.message.create({
        data: {
          userId: user.id,
          title: '📰 今日行业动态',
          content: newsItems.map((n, i) => `${i + 1}. ${n.title}`).join('\n'),
          type: 'news',
          priority: 'normal',
          metadata: JSON.stringify({ newsItems }),
        },
      });
    }

    console.log(`[定时任务] 已向 ${users.length} 位用户发送每日新闻`);
    return { success: true, count: users.length };
  } catch (error) {
    console.error('[定时任务] 发送每日新闻失败:', error);
    throw error;
  }
}

// =============================================
// 2. 项目进度提醒
// =============================================
export async function sendProjectReminders() {
  console.log('[定时任务] 开始发送项目进度提醒...');
  
  try {
    // 获取所有活跃项目
    const projects = await prisma.project.findMany({
      where: { status: 'active' },
      include: { user: true },
    });

    let reminderCount = 0;

    for (const project of projects) {
      // 计算项目创建时间
      const createdAt = new Date(project.createdAt);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      // 根据项目时间发送提醒
      if (daysSinceCreation === 1) {
        // 创建1天后
        await prisma.message.create({
          data: {
            userId: project.userId,
            title: '🎯 项目进行中',
            content: `您的项目「${project.name}」已创建1天，建议继续完善项目内容以获得更好的创意输出。`,
            type: 'reminder',
            link: `/workspace/${project.id}`,
            priority: 'low',
          },
        });
        reminderCount++;
      } else if (daysSinceCreation === 7) {
        // 创建7天后
        await prisma.message.create({
          data: {
            userId: project.userId,
            title: '📋 项目周提醒',
            content: `您的项目「${project.name}」已创建一周了！是否需要灵思帮你分析进度或生成新的创意？`,
            type: 'reminder',
            link: `/workspace/${project.id}`,
            priority: 'normal',
          },
        });
        reminderCount++;
      }
    }

    console.log(`[定时任务] 已发送 ${reminderCount} 条项目提醒`);
    return { success: true, count: reminderCount };
  } catch (error) {
    console.error('[定时任务] 发送项目提醒失败:', error);
    throw error;
  }
}

// =============================================
// 3. 周报生成提醒（每周一早上9点）
// =============================================
export async function sendWeeklyReportReminder() {
  console.log('[定时任务] 开始发送周报生成提醒...');
  
  try {
    // 获取所有用户
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      select: { id: true },
    });

    // 获取上周创建的项目数量
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    let reminderCount = 0;

    for (const user of users) {
      const projectCount = await prisma.project.count({
        where: {
          userId: user.id,
          createdAt: { gte: lastWeek },
        },
      });

      const message = projectCount > 0
        ? `上周你创建了 ${projectCount} 个项目，灵思已准备好为你生成本周的工作周报。点击查看 >>>`
        : `新的一周开始了！灵思建议你回顾上周工作，制定本周计划。点击开始新项目 >>>`;

      await prisma.message.create({
        data: {
          userId: user.id,
          title: '📊 周报提醒',
          content: message,
          type: 'reminder',
          link: '/projects',
          priority: projectCount > 0 ? 'high' : 'normal',
        },
      });
      reminderCount++;
    }

    console.log(`[定时任务] 已发送 ${reminderCount} 条周报提醒`);
    return { success: true, count: reminderCount };
  } catch (error) {
    console.error('[定时任务] 发送周报提醒失败:', error);
    throw error;
  }
}

// =============================================
// 4. 积分即将用完提醒
// =============================================
export async function sendPointsLowReminder() {
  console.log('[定时任务] 开始检查低积分用户...');
  
  try {
    // 获取积分低于100的用户
    const lowPointsUsers = await prisma.user.findMany({
      where: {
        points: { lt: 100 },
        points: { gt: 0 },
        role: 'user',
      },
      select: { id: true, points: true },
    });

    for (const user of lowPointsUsers) {
      // 检查今天是否已发送过提醒
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const existingReminder = await prisma.message.findFirst({
        where: {
          userId: user.id,
          title: { contains: '积分提醒' },
          createdAt: { gte: todayStart },
        },
      });

      if (!existingReminder) {
        await prisma.message.create({
          data: {
            userId: user.id,
            title: '⚠️ 积分不足提醒',
            content: `您的账户积分即将用完（剩余 ${user.points} 积分）。充值可继续享受灵思的智能创意服务。`,
            type: 'reminder',
            link: '/member',
            priority: 'high',
          },
        });
      }
    }

    console.log(`[定时任务] 已处理 ${lowPointsUsers.length} 位低积分用户`);
    return { success: true, count: lowPointsUsers.length };
  } catch (error) {
    console.error('[定时任务] 检查低积分用户失败:', error);
    throw error;
  }
}

// =============================================
// 5. 使用技巧推送（每周随机发送）
// =============================================
export async function sendUsageTips() {
  console.log('[定时任务] 开始发送使用技巧...');
  
  const tips = [
    {
      title: '💡 巧用竞品分析',
      content: '在创建项目时，上传竞品资料可以让灵思更准确地把握市场定位，生成更具差异化的创意方案。',
    },
    {
      title: '📝 详细的需求描述',
      content: '越详细的需求描述，灵思生成的方案越精准。试试描述你的目标人群、预算范围和预期效果吧！',
    },
    {
      title: '🔄 迭代优化',
      content: '对生成的结果不满意？可以点击「重新生成」或补充更多背景信息，灵思会为你迭代优化。',
    },
    {
      title: '📊 数据导出',
      content: '完成的项目方案可以一键导出为PDF或Word文档，方便团队传阅和汇报使用。',
    },
    {
      title: '🎯 精准定位',
      content: '使用「联系灵思」功能，详细描述你的品牌或产品特点，获得更专业的策略建议。',
    },
  ];

  try {
    // 随机选择一条技巧
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    // 获取所有用户
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      select: { id: true },
    });

    for (const user of users) {
      await prisma.message.create({
        data: {
          userId: user.id,
          title: randomTip.title,
          content: randomTip.content,
          type: 'tip',
          priority: 'low',
        },
      });
    }

    console.log(`[定时任务] 已向 ${users.length} 位用户发送使用技巧`);
    return { success: true, count: users.length };
  } catch (error) {
    console.error('[定时任务] 发送使用技巧失败:', error);
    throw error;
  }
}

// =============================================
// 定时任务执行入口（用于直接运行）
// =============================================
async function runScheduledTasks() {
  console.log('========================================');
  console.log('开始执行定时任务');
  console.log(`时间: ${new Date().toISOString()}`);
  console.log('========================================');

  try {
    // 根据任务类型执行
    const taskType = process.argv[2] || 'all';

    switch (taskType) {
      case 'news':
        await sendDailyNewsDigest();
        break;
      case 'project':
        await sendProjectReminders();
        break;
      case 'weekly':
        await sendWeeklyReportReminder();
        break;
      case 'points':
        await sendPointsLowReminder();
        break;
      case 'tips':
        await sendUsageTips();
        break;
      case 'all':
      default:
        await sendDailyNewsDigest();
        await sendProjectReminders();
        await sendPointsLowReminder();
        break;
    }

    console.log('========================================');
    console.log('定时任务执行完成');
    console.log('========================================');
  } catch (error) {
    console.error('定时任务执行失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 导出任务函数供外部调用
export {
  sendDailyNewsDigest,
  sendProjectReminders,
  sendWeeklyReportReminder,
  sendPointsLowReminder,
  sendUsageTips,
  runScheduledTasks,
};
