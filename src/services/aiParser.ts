/**
 * 简化版AI需求解析服务
 * 为县域广告公司量身定制 - 快速、简单、接地气
 */

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

// 豆包/通义千问 API配置
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const QIANWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

// 获取API配置
function getApiConfig() {
  const apiKey = import.meta.env?.DOUBAO_API_KEY || import.meta.env?.QIANWEN_API_KEY || import.meta.env?.DEEPSEEK_API_KEY || ''
  let apiUrl = QIANWEN_API_URL
  let model = 'qwen-plus'

  if (import.meta.env?.DOUBAO_API_KEY) {
    apiUrl = DOUBAO_API_URL
    model = 'doubao-pro-32k'
  } else if (import.meta.env?.DEEPSEEK_API_KEY) {
    apiUrl = DEEPSEEK_API_URL
    model = 'deepseek-chat'
  }

  return { apiUrl, apiKey, model }
}

/**
 * 调用AI解析需求
 */
async function callAI(text: string): Promise<string> {
  const { apiUrl, apiKey, model } = getApiConfig()

  if (!apiKey) {
    throw new Error('未配置AI Key')
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { 
          role: 'system', 
          content: `你是广告公司老板的助手，专门帮整理客户需求。
从客户说的话里提取：
1. 品牌/店名
2. 行业
3. 需要什么服务（品牌设计/包装/广告/活动/物料/新媒体）
4. 预算大概多少
5. 主要客户群是谁

说话要接地气，不要专业术语。`
        },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    throw new Error('AI请求失败')
  }

  const result = await response.json()
  return result.choices?.[0]?.message?.content || ''
}

// ============ 类型定义 ============

export type RequirementType = 
  | '品牌设计' 
  | '产品包装' 
  | '广告投放' 
  | '活动策划' 
  | '宣传物料' 
  | '新媒体运营' 
  | '其他'

export type BudgetRange = 
  | '1万以下' 
  | '1-5万' 
  | '5-10万' 
  | '10-30万' 
  | '30万以上' 
  | '待定'

export interface TargetAudience {
  age?: string
  gender?: string
  occupation?: string
  income?: string
  interests?: string[]
  description?: string
}

export interface Competitor {
  name: string
  website?: string
  keyFeatures?: string[]
}

export interface ParsedRequirement {
  brandName?: string
  companyName?: string
  industry?: string
  companyScale?: string
  requirementTypes: RequirementType[]
  budget?: BudgetRange
  deadline?: string
  priority?: 'high' | 'medium' | 'low'
  targetAudience?: TargetAudience
  competitors?: Competitor[]
  description?: string
  keyPoints?: string[]
  mustHave?: string[]
  niceToHave?: string[]
  referenceBrands?: string[]
  referenceStyles?: string[]
  preferredChannels?: string[]
  rawText?: string
  confidence?: number
}

export interface ParseRequirementParams {
  text: string
  includeRawText?: boolean
}

export interface ParseRequirementResponse {
  success: boolean
  data?: ParsedRequirement
  error?: string
  processingTime?: number
}

// ============ 核心功能 ============

/**
 * 解析用户需求 - 简化版
 */
export async function parseRequirement(params: ParseRequirementParams): Promise<ParseRequirementResponse> {
  const startTime = Date.now()
  
  try {
    const { text, includeRawText = true } = params
    
    if (!text || text.trim().length === 0) {
      return { success: false, error: '没收到您说的话' }
    }

    // 调用AI
    const result = await callAI(text)
    
    // 解析结果
    const data = parseAIResult(result, text)
    
    return {
      success: true,
      data: {
        ...data,
        requirementTypes: data.requirementTypes || [],
        rawText: includeRawText ? text : undefined
      },
      processingTime: Date.now() - startTime
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.message || '解析出错了',
      processingTime: Date.now() - startTime
    }
  }
}

/**
 * 解析AI返回的结果
 */
function parseAIResult(text: string, rawText: string): ParsedRequirement {
  // 简单的关键词匹配
  const result: ParsedRequirement = {
    requirementTypes: [],
    rawText
  }

  // 品牌名称
  const brandMatch = text.match(/品牌[：:]\s*([^\n]+)/) || text.match(/店名[：:]\s*([^\n]+)/)
  if (brandMatch) result.brandName = brandMatch[1].trim()

  // 行业
  const industries = ['餐饮', '服装', '超市', '母婴', '建材', '美容', '美发', '手机', '教育', '培训', '房产', '汽车', '药店', '娱乐', '超市', '便利店']
  for (const ind of industries) {
    if (rawText.includes(ind) || text.includes(ind)) {
      result.industry = ind
      break
    }
  }

  // 需求类型
  const typeMap: Record<string, RequirementType> = {
    'logo': '品牌设计', '品牌': '品牌设计', 'vi': '品牌设计',
    '包装': '产品包装', '盒': '产品包装',
    '广告': '广告投放', '抖音': '广告投放', '朋友圈': '广告投放',
    '活动': '活动策划', '开业': '活动策划', '促销': '活动策划',
    '单页': '宣传物料', '名片': '宣传物料', '物料': '宣传物料',
    '新媒体': '新媒体运营', '小红书': '新媒体运营', '运营': '新媒体运营',
  }
  
  for (const [keyword, type] of Object.entries(typeMap)) {
    if (rawText.includes(keyword) && !result.requirementTypes.includes(type)) {
      result.requirementTypes.push(type)
    }
  }

  // 默认给一个品牌设计
  if (result.requirementTypes.length === 0) {
    result.requirementTypes.push('品牌设计')
  }

  // 预算
  const budgetMap: Record<string, BudgetRange> = {
    '几千': '1万以下', '5千': '1万以下', '一万': '1万以下', '1万': '1万以下',
    '两三万': '1-5万', '三万': '1-5万', '五万': '1-5万', '几万': '1-5万',
    '十万': '10-30万', '20万': '10-30万', '30万': '10-30万',
  }
  
  for (const [keyword, budget] of Object.entries(budgetMap)) {
    if (rawText.includes(keyword)) {
      result.budget = budget
      break
    }
  }

  // 目标人群
  const crowdMap: Record<string, string> = {
    '年轻人': '县城年轻人，18-35岁',
    '宝妈': '年轻妈妈群体',
    '中年人': '35-55岁人群',
    '学生': '学生群体',
    '老年人': '中老年群体',
  }
  
  for (const [keyword, crowd] of Object.entries(crowdMap)) {
    if (rawText.includes(keyword)) {
      result.targetAudience = { description: crowd }
      break
    }
  }

  return result
}

/**
 * 验证需求
 */
export function validateRequirement(requirement: ParsedRequirement): {
  valid: boolean
  missing: string[]
} {
  const missing: string[] = []
  
  if (!requirement.brandName) missing.push('品牌名称')
  if (requirement.requirementTypes.length === 0) missing.push('需求类型')
  
  return { valid: missing.length === 0, missing }
}
