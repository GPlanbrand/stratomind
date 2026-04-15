export interface Project {
  id: string
  name: string
  clientName: string
  createdAt: string
  updatedAt: string
  status: 'active' | 'completed' | 'archived'
}

// 4A标准客户背景信息
export interface ClientInfo {
  // 客户基础信息
  clientName: string                    // 客户名称（必填）
  industry: string                      // 所属行业
  companySize: string                   // 公司规模
  establishedYear: string               // 成立时间
  companyNature: string                 // 企业性质（国企/民企/外企/合资）
  
  // 品牌资产
  brandStructure: string                // 主品牌/子品牌结构
  brandHistory: string                  // 品牌历史与沿革
  coreValue: string                     // 品牌核心价值
  brandPersonality: string              // 品牌个性
  brandSlogan: string                   // 品牌口号/Slogan
  
  // 业务概况
  mainBusiness: string                  // 主营业务描述
  productLines: string[]                // 核心产品/服务线
  targetMarkets: string                 // 目标市场区域
  marketPosition: string                // 市场份额/行业地位
  competitiveAdvantage: string          // 竞争优势
  
  // 渠道与终端
  salesChannels: string[]                // 销售渠道（线上/线下/分销）
  outletCount: string                   // 终端网点数量
  keyMarkets: string                    // 重点区域市场
  
  // 过往营销
  marketingHistory: string              // 历史营销活动概述
  previousAgencies: string              // 过往代理商
  marketingBudget: string               // 营销投入水平
  
  // 附件资料
  attachments: ClientAttachment[]       // 上传的客户资料
}

// 客户资料附件
export interface ClientAttachment {
  id: string
  name: string
  type: 'pdf' | 'word' | 'ppt' | 'image' | 'zip'
  size: number
  url?: string
  uploadedAt: string
}

// 4A标准项目需求
export interface Requirements {
  // 项目基础
  projectName: string                   // 项目名称（必填）
  projectType: string                   // 项目类型（品牌建设/产品推广/活动策划/整合营销/其他）
  serviceType: string                   // 服务类型（年度全案/单项Campaign/专项服务）
  projectCycle: string                  // 项目周期
  budgetRange: string                   // 预算范围
  
  // 商业目标
  businessGoal: string                  // 商业目标（销售/市占/用户增长等）
  brandGoal: string                     // 品牌目标（知名度/美誉度/忠诚度等）
  communicationGoal: string              // 传播目标（曝光/互动/转化等）
  coreKPI: string                       // 核心KPI指标
  
  // 目标人群
  targetPersona: string                 // 核心人群画像
  mediaHabits: string                   // 人群触媒习惯
  decisionJourney: string               // 消费决策路径
  
  // 传播策略
  coreMessage: string                   // 核心传播信息
  communicationTone: string             // 传播调性
  primaryChannels: string[]             // 主要传播渠道
  secondaryChannels: string[]          // 次要传播渠道
  
  // 创意要求
  creativeDirection: string             // 创意方向偏好
  referenceCases: string                // 参考案例
  taboos: string                        // 禁忌事项
  
  // 时间节奏
  keyMilestones: string                // 关键时间节点
  milestoneEvents: string               // 里程碑事件
  
  // 交付物
  deliverables: string[]                // 期望交付物
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
