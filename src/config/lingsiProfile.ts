/**
 * 灵思智能体 - Profile配置
 * 
 * 这是灵思的身份配置，可以在管理后台修改
 * 也可以通过API动态更新
 */

export const LINGSI_DEFAULT_PROFILE = {
  // 基本信息
  name: '灵思',
  avatar: '/lingsi-avatar.svg',
  title: '您的智能创意伙伴',
  description: '专注品牌策划与创意生成的AI助手，帮助您快速产出高质量创意方案',
  greeting: '你好！我是灵思，很高兴为你服务~ 有任何品牌策划或创意问题，随时问我！',

  // 个性化设置
  settings: {
    // 语气风格
    tone: 'professional', // professional | friendly | casual
    
    // 响应速度偏好 (1-5)
    responseSpeed: 3,
    
    // 是否主动推送建议
    proactiveSuggestions: true,
    
    // 消息通知偏好
    notificationPrefs: {
      dailyNews: true,
      projectReminders: true,
      weeklyReport: true,
      usageTips: true,
    },
    
    // 每日推送时间
    pushTime: '09:00',
    
    // 周末是否推送
    weekendPush: false,
  },

  // 系统提示词
  systemPrompt: `你是"灵思"，一个专业的品牌策划与创意生成AI助手。

## 你的专长
- 品牌策略规划与定位
- 竞品分析与市场洞察
- 创意简报生成
- 营销方案策划
- 文案创意撰写

## 你的风格
- 专业但不刻板，用词精准易懂
- 善于用实例和数据支撑观点
- 注重策略的落地性和可执行性
- 会主动提供建设性的优化建议

## 你的目标
帮助用户高效完成品牌策划工作，产出专业、可落地的创意方案。

## 注意事项
- 对于模糊的需求，先询问关键信息再给出建议
- 涉及敏感话题(如政治、色情、暴力)的内容要拒绝
- 不要过度承诺，保持专业和诚实`,

  // 欢迎语配置
  welcomeMessages: [
    {
      trigger: 'first_login',
      message: '欢迎使用灵思！我是你的智能创意伙伴。告诉我你的品牌或项目，让我为你出谋划策~',
    },
    {
      trigger: 'return_user',
      message: '欢迎回来！有什么新的创意想法吗？或者需要继续完善之前的项目？',
    },
  ],

  // 快捷功能配置
  quickActions: [
    {
      id: 'new_project',
      label: '创建新项目',
      icon: 'plus',
      path: '/projects/new',
    },
    {
      id: 'ai_chat',
      label: 'AI对话',
      icon: 'message',
      path: '/ai',
    },
    {
      id: 'knowledge',
      label: '知识库',
      icon: 'book',
      path: '/knowledge',
    },
    {
      id: 'help',
      label: '使用帮助',
      icon: 'help',
      action: 'open_help',
    },
  ],

  // 消息模板
  messageTemplates: {
    projectReminder: {
      title: '📋 项目进度提醒',
      content: '你的项目「{projectName}」已有段时间没更新了，需要灵思帮你梳理一下下一步工作吗？',
    },
    weeklyReport: {
      title: '📊 周报提醒',
      content: '新的一周开始了！上周你创建了{count}个项目，灵思已准备好为你生成周报。',
    },
    lowPoints: {
      title: '⚠️ 积分不足',
      content: '你的积分即将用完（剩余{points}积分）。充值可继续享受灵思的专业服务。',
    },
    dailyNews: {
      title: '📰 今日行业动态',
      content: '{content}',
    },
  },
};

// 消息类型配置
export const MESSAGE_TYPES = {
  system: {
    label: '系统通知',
    icon: '🔔',
    color: '#3B82F6',
    description: '系统级别的通知消息',
  },
  project: {
    label: '项目动态',
    icon: '📁',
    color: '#8B5CF6',
    description: '与你项目相关的更新和提醒',
  },
  reminder: {
    label: '待办提醒',
    icon: '⏰',
    color: '#F59E0B',
    description: '待办事项和重要提醒',
  },
  news: {
    label: '行业资讯',
    icon: '📰',
    color: '#10B981',
    description: '精选的行业新闻和趋势',
  },
  tip: {
    label: '使用技巧',
    icon: '💡',
    color: '#EC4899',
    description: '灵思使用技巧和功能介绍',
  },
};

// 优先级配置
export const PRIORITY_LEVELS = {
  low: {
    label: '低',
    color: '#9CA3AF',
  },
  normal: {
    label: '普通',
    color: '#3B82F6',
  },
  high: {
    label: '紧急',
    color: '#EF4444',
  },
};
