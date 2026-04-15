export interface Project {
  id: string
  name: string
  clientName: string
  createdAt: string
  updatedAt: string
  status: 'active' | 'completed' | 'archived'
}

export interface ClientInfo {
  companyName: string
  industry: string
  companySize: string
  description: string
  targetMarket: string
  keyProducts: string[]
  brandPosition: string
}

export interface Requirements {
  projectType: string
  budget: string
  timeline: string
  targetAudience: string
  keyMessage: string
  deliverables: string[]
  tone: string
  channels: string[]
  brandChallenge?: string
}

// 4A公司标准竞品分析数据结构
export interface Competitor {
  // 基础信息
  id: string
  name: string
  brandPositioning: string        // 品牌定位
  targetAudience: string         // 目标人群
  priceRange: string             // 价格区间
  
  // 市场表现
  marketShare: string            // 市场份额
  brandAwareness: string         // 品牌知名度
  userReputation: string         // 用户口碑
  
  // 品牌策略
  coreValue: string              // 核心价值主张
  differentiation: string        // 差异化策略
  brandTone: string              // 品牌调性
  
  // 产品/服务
  coreProducts: string[]         // 核心产品
  productStrengths: string[]     // 产品优势
  productWeaknesses: string[]    // 产品劣势
  
  // 营销传播
  channels: string[]             // 主要传播渠道
  marketingStrategy: string      // 营销策略
  contentStyle: string           // 内容风格
  
  // 视觉形象
  viSystem: string               // VI系统特点
  visualStyle: string            // 视觉风格
  brandPersonality: string       // 品牌人格
  
  // SWOT分析
  strengths: string[]            // 优势
  weaknesses: string[]           // 劣势
  opportunities: string[]        // 机会
  threats: string[]              // 威胁
  
  // 多维度评分 (用于雷达图)
  scores?: {
    productPower: number          // 产品力
    brandPower: number            // 品牌力
    channelPower: number          // 渠道力
    servicePower: number          // 服务力
    innovationPower: number       // 创新力
    pricePower: number            // 价格力
  }
}

export interface Brief {
  projectOverview: string
  creativeDirection: string
  keyInsights: string[]
  successMetrics: string[]
}

export interface Strategy {
  overallStrategy: string
  differentiation: string
  contentStrategy: string
  mediaStrategy: string
}

export interface ProjectSteps {
  clientInfo?: ClientInfo
  requirements?: Requirements
  competitors?: Competitor[]
  brief?: Brief
  strategy?: Strategy
}

export interface CreateProjectRequest {
  name: string
  clientName: string
}
