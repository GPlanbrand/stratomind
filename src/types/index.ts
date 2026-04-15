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

// 4A精简版创意简报数据结构
export interface Brief {
  // 一、项目概要
  projectName: string              // 项目名称
  clientName: string              // 客户名称
  projectType: string             // 项目类型：品牌定位/营销传播/产品推广/活动策划
  projectCycle: string             // 项目周期
  budgetRange: string              // 预算范围
  
  // 二、品牌现状
  brandStage: string              // 品牌阶段：初创/成长/成熟/转型
  currentPerformance: string      // 当前市场表现
  coreChallenge: string           // 核心挑战
  brandAssets: string[]           // 品牌资产盘点
  
  // 三、目标人群
  targetDemographic: string       // 人口属性：年龄/性别/收入/地域
  consumerBehavior: string        // 消费行为：场景/频次/客单价
  corePainPoints: string[]        // 核心痛点
  mediaHabits: string[]           // 媒介习惯
  
  // 四、竞争格局
  topCompetitors: string[]         // 直接竞品TOP3
  competitorDiff: string           // 竞品差异化分析
  opportunityPoints: string       // 竞争机会点
  
  // 五、传播目标
  brandGoal: string               // 品牌目标：认知度/美誉度
  marketingGoal: string           // 营销目标：销量/客流/转化
  communicationGoal: string       // 传播目标：曝光/互动/话题
  kpi: string                     // KPI量化指标
  
  // 六、核心策略
  strategyPositioning: string     // 策略定位
  coreProposition: string         // 核心主张（一句话slogan）
  supportPoints: string[]         // 支撑点（3个）
  
  // 七、传播规划
  themeSlogan: string             // 传播主题/Slogan
  channels: string[]              // 传播渠道
  contentDirection: string        // 内容方向
  executionRhythm: string        // 执行节奏
  
  // 八、预算分配
  channelBudgetRatio: string      // 渠道预算占比
  phaseBudgetAllocation: string   // 阶段预算分配
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
