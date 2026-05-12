/**
 * 简化版AI解析API - 专为县域广告公司
 */

import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// ============ 类型定义 ============

type RequirementType = 
  | '品牌设计' 
  | '产品包装' 
  | '广告投放' 
  | '活动策划' 
  | '宣传物料' 
  | '新媒体运营' 
  | '其他'

type BudgetRange = 
  | '1万以下' 
  | '1-5万' 
  | '5-10万' 
  | '10-30万' 
  | '30万以上' 
  | '待定'

interface ParsedRequirement {
  brandName?: string
  companyName?: string
  industry?: string
  companyScale?: string
  requirementTypes: RequirementType[]
  budget?: BudgetRange
  deadline?: string
  priority?: 'high' | 'medium' | 'low'
  targetAudience?: { description?: string }
  competitors?: any[]
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

// ============ AI配置 ============

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const QIANWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

function getAIConfig() {
  const apiKey = process.env.DOUBAO_API_KEY || process.env.QIANWEN_API_KEY || process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('未配置AI Key');
  }

  let apiUrl = QIANWEN_API_URL;
  let model = 'qwen-plus';

  if (process.env.DOUBAO_API_KEY) {
    apiUrl = DOUBAO_API_URL;
    model = 'doubao-pro-32k';
  } else if (process.env.DEEPSEEK_API_KEY) {
    apiUrl = DEEPSEEK_API_URL;
    model = 'deepseek-chat';
  }

  return { apiUrl, apiKey, model };
}

// ============ 核心功能 ============

/**
 * 调用AI解析
 */
async function callAI(text: string): Promise<string> {
  const { apiUrl, apiKey, model } = getAIConfig();

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
  });

  if (!response.ok) {
    throw new Error('AI请求失败');
  }

  const result = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return result.choices?.[0]?.message?.content || '';
}

/**
 * 解析AI结果
 */
function parseAIResult(text: string, rawText: string): ParsedRequirement {
  const result: ParsedRequirement = { requirementTypes: [], rawText };

  // 品牌名称
  const brandMatch = text.match(/品牌[：:]\s*([^\n]+)/) || text.match(/店名[：:]\s*([^\n]+)/);
  if (brandMatch) result.brandName = brandMatch[1].trim();

  // 行业
  const industries = ['餐饮', '服装', '超市', '母婴', '建材', '美容', '美发', '手机', '教育', '培训', '房产', '汽车', '药店', '娱乐'];
  for (const ind of industries) {
    if (rawText.includes(ind) || text.includes(ind)) {
      result.industry = ind;
      break;
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
  };
  
  for (const [keyword, type] of Object.entries(typeMap)) {
    if (rawText.includes(keyword) && !result.requirementTypes.includes(type)) {
      result.requirementTypes.push(type);
    }
  }

  if (result.requirementTypes.length === 0) {
    result.requirementTypes.push('品牌设计');
  }

  // 预算
  const budgetMap: Record<string, BudgetRange> = {
    '几千': '1万以下', '5千': '1万以下', '一万': '1万以下', '1万': '1万以下',
    '两三万': '1-5万', '三万': '1-5万', '五万': '1-5万', '几万': '1-5万',
    '十万': '10-30万', '20万': '10-30万', '30万': '10-30万',
  };
  
  for (const [keyword, budget] of Object.entries(budgetMap)) {
    if (rawText.includes(keyword)) {
      result.budget = budget;
      break;
    }
  }

  // 目标人群
  const crowdMap: Record<string, string> = {
    '年轻人': '县城年轻人，18-35岁',
    '宝妈': '年轻妈妈群体',
    '中年人': '35-55岁人群',
    '学生': '学生群体',
    '老年人': '中老年群体',
  };
  
  for (const [keyword, crowd] of Object.entries(crowdMap)) {
    if (rawText.includes(keyword)) {
      result.targetAudience = { description: crowd };
      break;
    }
  }

  return result;
}

// ============ API路由 ============

/**
 * POST /api/ai/simple/parse-requirement
 * 解析用户需求
 */
router.post('/parse-requirement', async (req: AuthRequest, res: Response) => {
  try {
    const { text, includeRawText = true } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '请说点什么'
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({
        success: false,
        error: '说太多了，简化一下'
      });
    }

    const startTime = Date.now();
    const aiResult = await callAI(text.trim());
    const data = parseAIResult(aiResult, text.trim());
    
    const response: any = {
      success: true,
      data: {
        ...data,
        requirementTypes: data.requirementTypes || []
      },
      processingTime: Date.now() - startTime
    };

    if (!includeRawText) {
      delete response.data.rawText;
    }

    res.json(response);

  } catch (error: any) {
    console.error('需求解析失败:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || '解析出错了，重试一下'
    });
  }
});

export default router;
