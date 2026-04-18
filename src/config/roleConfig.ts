/**
 * 角色配置 - 定义三种角色模式的首页视图、功能列表和Slogan
 */

export type RoleType = 'ad_agency' | 'enterprise' | 'government';

// 角色配置接口
export interface RoleConfig {
  id: RoleType;
  name: string;
  icon: string;
  slogan: string;
  description: string;
  color: string;           // 主色调
  bgGradient: string;       // 背景渐变
  features: RoleFeature[];
  quickActions: QuickAction[];
}

export interface RoleFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
}

export interface QuickAction {
  label: string;
  icon: string;
  path: string;
  color: string;
}

// 三种角色配置
export const ROLE_CONFIGS: Record<RoleType, RoleConfig> = {
  ad_agency: {
    id: 'ad_agency',
    name: '广告公司模式',
    icon: '🏢',
    slogan: '把客户模糊的想法，变成清晰的工单',
    description: '专为广告公司打造的客户需求处理系统',
    color: 'purple',
    bgGradient: 'from-purple-500 to-indigo-600',
    features: [
      {
        id: 'client-translator',
        name: '甲方翻译器',
        description: '将客户模糊的需求转化为清晰的Brief',
        icon: '💬',
        path: '/projects/requirement-parser'
      },
      {
        id: 'copy-writer',
        name: '话术包装器',
        description: '专业话术包装，提升提案说服力',
        icon: '✨',
        path: '/projects?type=copy'
      },
      {
        id: 'creative-brief',
        name: '创意简报',
        description: '一键生成标准创意简报文档',
        icon: '📋',
        path: '/projects?type=brief'
      },
      {
        id: 'competitor-analysis',
        name: '竞品分析',
        description: '深度分析竞品策略与市场定位',
        icon: '🔍',
        path: '/projects?type=competitor'
      },
      {
        id: 'strategy',
        name: '策略生成',
        description: 'AI智能生成品牌策略方案',
        icon: '🎯',
        path: '/projects?type=strategy'
      }
    ],
    quickActions: [
      { label: '接收需求', icon: '📥', path: '/projects?type=intake', color: 'from-purple-500 to-pink-500' },
      { label: '写提案', icon: '📝', path: '/projects?type=proposal', color: 'from-blue-500 to-cyan-500' },
      { label: '竞品分析', icon: '🔍', path: '/projects?type=competitor', color: 'from-green-500 to-emerald-500' },
      { label: '生成报价', icon: '💰', path: '/projects?type=quote', color: 'from-orange-500 to-red-500' }
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: '企业品宣模式',
    icon: '🏭',
    slogan: '老板要的数据，随时拉表',
    description: '企业品牌宣传的一站式管理平台',
    color: 'blue',
    bgGradient: 'from-blue-500 to-cyan-600',
    features: [
      {
        id: 'social-calendar',
        name: '新媒体日历',
        description: '可视化内容排期，管理发布日程',
        icon: '📅',
        path: '/projects/calendar'
      },
      {
        id: 'wechat-manager',
        name: '公众号管理',
        description: '多账号管理，内容一键分发',
        icon: '📱',
        path: '/projects?type=wechat'
      },
      {
        id: 'event-planner',
        name: '活动策划',
        description: '完整活动方案策划与执行跟踪',
        icon: '🎪',
        path: '/projects?type=event'
      },
      {
        id: 'report-generator',
        name: '数据报表',
        description: '一键生成品宣效果数据报表',
        icon: '📊',
        path: '/projects/analysis-charts'
      },
      {
        id: 'asset-manager',
        name: '方案资产',
        description: '集中管理品牌素材与方案库',
        icon: '📁',
        path: '/projects/files'
      }
    ],
    quickActions: [
      { label: '写一篇推文', icon: '✍️', path: '/projects?type=content', color: 'from-blue-500 to-indigo-500' },
      { label: '做活动方案', icon: '🎯', path: '/projects?type=event', color: 'from-purple-500 to-pink-500' },
      { label: '查数据报表', icon: '📈', path: '/projects/analysis-charts', color: 'from-green-500 to-emerald-500' },
      { label: '管理内容库', icon: '📚', path: '/projects/files', color: 'from-orange-500 to-yellow-500' }
    ]
  },
};

// 获取所有角色列表
export const getAllRoles = (): RoleConfig[] => {
  return Object.values(ROLE_CONFIGS);
};

// 根据角色类型获取配置
export const getRoleConfig = (role: RoleType): RoleConfig => {
  return ROLE_CONFIGS[role] || ROLE_CONFIGS.ad_agency;
};

// 默认角色
export const DEFAULT_ROLE: RoleType = 'ad_agency';

// 角色切换后的重定向路径
export const getRoleRedirectPath = (role: RoleType): string => {
  return '/projects';
};
