// 用户类型定义
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  memberLevel: 'normal' | 'silver' | 'gold' | 'diamond';
  points: number;
  memberExpiresAt?: string;
  createdAt: string;
  lastLoginAt?: string;
  signInDays: number;
  lastSignInDate?: string;
  inviteCode: string;
  invitedBy?: string;
}

// 会员等级配置
export const MEMBER_LEVELS = {
  normal: {
    name: '普通会员',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: '👤',
    benefits: ['基础功能', '每日签到', '邀请好友']
  },
  silver: {
    name: '白银会员',
    color: 'text-gray-600',
    bgColor: 'bg-gray-200',
    borderColor: 'border-gray-400',
    icon: '🥈',
    benefits: ['普通会员权益', '优先客服', '9折优惠']
  },
  gold: {
    name: '黄金会员',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    icon: '🥇',
    benefits: ['白银会员权益', '专属顾问', '8折优惠', '专属皮肤']
  },
  diamond: {
    name: '钻石会员',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
    icon: '💎',
    benefits: ['黄金会员权益', '无限次数', '7折优惠', '专属勋章', '生日礼包']
  }
} as const;

// 会员套餐配置
export const MEMBER_PLANS = {
  experience: {
    name: '体验版',
    price: 19.9,
    period: 'month',
    features: ['每日100积分', '基础分析功能', '3个项目上限', '邮件支持']
  },
  standard: {
    name: '标准版',
    price: 39,
    period: 'month',
    features: ['每日200积分', '高级分析功能', '10个项目上限', '优先邮件支持', '去除广告']
  },
  professional: {
    name: '专业版',
    price: 69,
    period: 'month',
    features: ['每日500积分', '全部分析功能', '无限项目', '24小时客服', 'API访问权限', '团队协作']
  },
  flagship: {
    name: '旗舰版',
    price: 99,
    period: 'month',
    features: ['每日1000积分', '企业级分析', '无限一切', '专属客服', '高级API', '优先部署', '数据备份']
  },
  annual: {
    name: '年费版',
    price: 398,
    period: 'year',
    features: ['每日800积分', '全部专业版功能', '2个月免费', '专属客户成功经理', '年度培训']
  }
} as const;

// 积分规则配置
export const POINTS_RULES = {
  register: 600,
  dailySignIn: 10,
  invite: 50,
  signInStreak: 5,
} as const;

// 功能消耗积分配置
export const FEATURE_COSTS = {
  analysis: 50,
  chart: 30,
  export: 20,
} as const;
