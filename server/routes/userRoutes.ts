/**
 * 用户角色相关 API 路由
 * 
 * 提供以下接口：
 * - GET  /api/user/role      - 获取当前用户角色
 * - PUT  /api/user/role     - 切换用户角色
 * - GET  /api/role/config   - 获取角色配置
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// 角色类型
type RoleType = 'ad_agency' | 'enterprise' | 'government';

// 角色配置接口
interface RoleFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
}

interface QuickAction {
  label: string;
  icon: string;
  path: string;
  color: string;
}

interface RoleConfig {
  id: RoleType;
  name: string;
  icon: string;
  slogan: string;
  description: string;
  color: string;
  bgGradient: string;
  features: RoleFeature[];
  quickActions: QuickAction[];
}

// 角色配置数据
const roleConfigs: Record<RoleType, RoleConfig> = {
  ad_agency: {
    id: 'ad_agency',
    name: '广告公司模式',
    icon: '🏢',
    slogan: '把客户模糊的想法，变成清晰的工单',
    description: '专为广告公司打造的客户需求处理系统',
    color: 'purple',
    bgGradient: 'from-purple-500 to-indigo-600',
    features: [
      { id: 'client-translator', name: '甲方翻译器', description: '将客户模糊的需求转化为清晰的Brief', icon: '💬', path: '/projects/requirement-parser' },
      { id: 'copy-writer', name: '话术包装器', description: '专业话术包装，提升提案说服力', icon: '✨', path: '/projects?type=copy' },
      { id: 'creative-brief', name: '创意简报', description: '一键生成标准创意简报文档', icon: '📋', path: '/projects?type=brief' },
      { id: 'competitor-analysis', name: '竞品分析', description: '深度分析竞品策略与市场定位', icon: '🔍', path: '/projects?type=competitor' },
      { id: 'strategy', name: '策略生成', description: 'AI智能生成品牌策略方案', icon: '🎯', path: '/projects?type=strategy' }
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
      { id: 'social-calendar', name: '新媒体日历', description: '可视化内容排期，管理发布日程', icon: '📅', path: '/projects/calendar' },
      { id: 'wechat-manager', name: '公众号管理', description: '多账号管理，内容一键分发', icon: '📱', path: '/projects?type=wechat' },
      { id: 'event-planner', name: '活动策划', description: '完整活动方案策划与执行跟踪', icon: '🎪', path: '/projects?type=event' },
      { id: 'report-generator', name: '数据报表', description: '一键生成品宣效果数据报表', icon: '📊', path: '/projects/analysis-charts' },
      { id: 'asset-manager', name: '方案资产', description: '集中管理品牌素材与方案库', icon: '📁', path: '/projects/files' }
    ],
    quickActions: [
      { label: '写一篇推文', icon: '✍️', path: '/projects?type=content', color: 'from-blue-500 to-indigo-500' },
      { label: '做活动方案', icon: '🎯', path: '/projects?type=event', color: 'from-purple-500 to-pink-500' },
      { label: '查数据报表', icon: '📈', path: '/projects/analysis-charts', color: 'from-green-500 to-emerald-500' },
      { label: '管理内容库', icon: '📚', path: '/projects/files', color: 'from-orange-500 to-yellow-500' }
    ]
  },
  government: {
    id: 'government',
    name: '政府品宣模式',
    icon: '🏛️',
    slogan: '三审三校的智能副驾驶',
    description: '政务信息发布的合规保障系统',
    color: 'red',
    bgGradient: 'from-red-600 to-orange-600',
    features: [
      { id: 'doc-format', name: '公文格式刷', description: '一键规范政府公文格式标准', icon: '📄', path: '/projects?type=document' },
      { id: 'compliance-check', name: '合规检测', description: '自动检测内容合规性与风险点', icon: '✅', path: '/projects?type=compliance' },
      { id: 'submission-manager', name: '报送管理', description: '多部门报送流程与进度跟踪', icon: '📤', path: '/projects?type=submission' },
      { id: 'info-platform', name: '信息报送台', description: '政务信息统一采集与发布平台', icon: '🗞️', path: '/projects?type=info' },
      { id: 'approval-workflow', name: '审批流转', description: '三审三校流程自动化管理', icon: '🔄', path: '/projects?type=approval' }
    ],
    quickActions: [
      { label: '写一篇信息', icon: '✍️', path: '/projects?type=gov-info', color: 'from-red-500 to-orange-500' },
      { label: '格式规范化', icon: '📋', path: '/projects?type=document', color: 'from-blue-500 to-indigo-500' },
      { label: '合规检测', icon: '🔍', path: '/projects?type=compliance', color: 'from-green-500 to-emerald-500' },
      { label: '报送审批', icon: '📤', path: '/projects?type=submission', color: 'from-purple-500 to-pink-500' }
    ]
  }
};

// 获取请求体
async function parseBody<T>(req: VercelRequest): Promise<T | null> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : null);
      } catch {
        resolve(null);
      }
    });
  });
}

// 获取请求中的用户ID（模拟）
function getUserId(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  // 简化处理，实际应解析JWT
  return authHeader.replace('Bearer ', '');
}

// API 路由处理
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 路由匹配
  if (url === '/api/user/role') {
    if (method === 'GET') {
      // 获取用户角色
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: '未授权' });
      }
      
      // 实际应从数据库读取，这里返回模拟数据
      const role = 'ad_agency'; // 默认角色
      return res.status(200).json({ role });
    }
    
    if (method === 'PUT') {
      // 切换用户角色
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: '未授权' });
      }
      
      const body = await parseBody<{ role: RoleType }>(req);
      if (!body?.role || !roleConfigs[body.role]) {
        return res.status(400).json({ error: '无效的角色' });
      }
      
      // 实际应更新数据库
      return res.status(200).json({ success: true, role: body.role });
    }
  }
  
  if (url === '/api/role/config') {
    if (method === 'GET') {
      // 获取所有角色配置
      const role = req.query.role as RoleType | undefined;
      
      if (role) {
        // 返回指定角色配置
        if (!roleConfigs[role]) {
          return res.status(400).json({ error: '无效的角色' });
        }
        return res.status(200).json(roleConfigs[role]);
      }
      
      // 返回所有角色配置
      return res.status(200).json(Object.values(roleConfigs));
    }
  }
  
  // 404
  return res.status(404).json({ error: '未找到' });
}
