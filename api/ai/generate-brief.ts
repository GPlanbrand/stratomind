/**
 * 创意简报生成接口
 * POST /api/ai/generate-brief
 */

import { parseBody } from '../../lib/api'

// 豆包/通义千问 API配置
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const QIANWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

function getApiConfig() {
  const doubaoKey = process.env.DOUBAO_API_KEY
  const qianwenKey = process.env.QIANWEN_API_KEY
  
  if (doubaoKey) {
    return { url: DOUBAO_API_URL, key: doubaoKey, model: 'doubao-pro-32k' }
  }
  if (qianwenKey) {
    return { url: QIANWEN_API_URL, key: qianwenKey, model: 'qwen-plus' }
  }
  return null
}

interface RequestBody {
  clientInfo?: {
    companyName?: string
    industry?: string
    brandPosition?: string
    description?: string
    targetMarket?: string
    companySize?: string
  }
  requirements?: {
    projectType?: string
    targetAudience?: string
    keyMessage?: string
    tone?: string
    channels?: string[]
    budget?: string
    timeline?: string
  }
  competitors?: any[]
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: '只支持POST请求' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const apiConfig = getApiConfig()
    if (!apiConfig) {
      return new Response(JSON.stringify({
        error: '未配置API Key',
        message: '请在Vercel环境变量中配置 DOUBAO_API_KEY 或 QIANWEN_API_KEY'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await parseBody<RequestBody>(req)
    const { clientInfo, requirements, competitors } = body || {}

    if (!clientInfo || !requirements) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 构建竞品摘要
    const competitorSummary = (competitors || []).length > 0
      ? (competitors as any[]).map((c: any, i: number) => 
          `竞品${i + 1}【${c.name}】:\n  定位: ${c.brandPositioning || '待分析'}\n  目标人群: ${c.targetAudience || '未知'}\n  价格区间: ${c.priceRange || '未知'}\n  视觉风格: ${c.visualStyle || '未知'}\n  核心优势: ${(c.strengths || []).slice(0, 2).join('、') || '未知'}`
        ).join('\n\n')
      : '暂无竞品数据'

    // 构建渠道建议（二三四线城市实用版）
    const channelSuggestions = `【一线城市常用】抖音、小红书、微博、B站、微信朋友圈
【二线城市常用】抖音本地生活、微信朋友圈、本地公众号、电梯广告
【三四线城市常用】微信朋友圈、抖音、本地公众号、社区广告、传单`

    const prompt = `你是4A广告公司的资深品牌策略总监。请根据以下信息，生成一份专业的创意简报。

## 输出要求
1. 基于4A公司标准创意简报框架
2. 针对二三四线城市市场特点进行本地化优化
3. 实用导向，可直接指导执行落地
4. 预算建议考虑成本可控性

## 客户信息
- 公司名称：${clientInfo.companyName || '待填写'}
- 所属行业：${clientInfo.industry || '待确定'}
- 品牌定位：${clientInfo.brandPosition || clientInfo.description || '暂无'}
- 目标市场：${clientInfo.targetMarket || '待确定'}
- 公司规模：${clientInfo.companySize || '待确定'}

## 项目需求
- 项目类型：${requirements.projectType || '品牌策划'}
- 目标受众：${requirements.targetAudience || '目标消费群体'}
- 核心信息：${requirements.keyMessage || '品牌核心价值'}
- 调性风格：${requirements.tone || '专业、可信赖'}
- 传播渠道：${Array.isArray(requirements.channels) ? requirements.channels.join('、') : '待定'}
- 预算范围：${requirements.budget || '待定'}
- 项目周期：${requirements.timeline || '待定'}

## 竞品概况
${competitorSummary}

## 传播渠道参考（二三四线城市实用版）
${channelSuggestions}

请生成以下4A精简版创意简报，严格按JSON格式返回：

{
  "projectName": "项目名称（基于客户公司名+项目类型生成）",
  "clientName": "${clientInfo.companyName || '待填写'}",
  "projectType": "${requirements.projectType || '品牌策划'}",
  "projectCycle": "${requirements.timeline || '1个月'}",
  "budgetRange": "${requirements.budget || '待定'}",
  
  "brandStage": "品牌阶段：初创/成长/成熟/转型（根据公司描述判断）",
  "currentPerformance": "当前市场表现描述",
  "coreChallenge": "核心挑战，1-2句话",
  "brandAssets": ["品牌资产1", "品牌资产2", "品牌资产3"],
  
  "targetDemographic": "人口属性：年龄/性别/收入/地域",
  "consumerBehavior": "消费行为：场景/频次/客单价",
  "corePainPoints": ["痛点1", "痛点2", "痛点3"],
  "mediaHabits": ["媒介习惯1", "媒介习惯2"],
  
  "topCompetitors": ["竞品1名称", "竞品2名称"],
  "competitorDiff": "竞品差异化分析，1-2句话",
  "opportunityPoints": "竞争机会点，1-2句话",
  
  "brandGoal": "品牌目标：认知度提升/美誉度建设等",
  "marketingGoal": "营销目标：销量提升/获客拉新等",
  "communicationGoal": "传播目标：曝光/互动/话题等",
  "kpi": "可量化的KPI指标，如：曝光100万+/互动1万+",
  
  "strategyPositioning": "核心策略定位，1-2句话",
  "coreProposition": "一句话Slogan/核心主张，要求有冲击力",
  "supportPoints": ["支撑点1", "支撑点2", "支撑点3"],
  
  "themeSlogan": "本次传播主题/Slogan",
  "channels": ["建议渠道1", "建议渠道2", "建议渠道3"],
  "contentDirection": "内容创作方向，1-2句话",
  "executionRhythm": "执行节奏：集中爆发/持续渗透/长线运营",
  
  "channelBudgetRatio": "渠道预算占比建议，如：抖音40%/小红书30%/朋友圈30%",
  "phaseBudgetAllocation": "阶段预算分配，如：预热期30%/爆发期50%/长尾期20%"
}

请直接返回JSON，不要包含任何其他文字说明。`

    // 调用AI API
    const response = await fetch(apiConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.key}`,
      },
      body: JSON.stringify({
        model: apiConfig.model,
        messages: [
          {
            role: 'system',
            content: `你是4A广告公司的资深品牌策略总监。你擅长：
1. 品牌策略制定与创意简报撰写
2. 市场竞争分析与消费者洞察
3. 本地化营销策略（特别是二三四线城市市场）
4. 成本可控的媒介投放建议

请用专业但接地气的语言输出高质量的策划内容。`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI API错误:', response.status, errorText)
      return new Response(JSON.stringify({
        error: 'AI服务调用失败',
        message: `API返回错误: ${response.status}`
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || ''

    // 解析JSON响应
    try {
      let cleanContent = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()
      
      let parsed = null
      
      try {
        parsed = JSON.parse(cleanContent)
      } catch {
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0])
          } catch {
            const fixedContent = jsonMatch[0]
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '')
            parsed = JSON.parse(fixedContent)
          }
        }
      }
      
      if (parsed) {
        return new Response(JSON.stringify({
          success: true,
          data: {
            projectName: parsed.projectName || '',
            clientName: parsed.clientName || '',
            projectType: parsed.projectType || '',
            projectCycle: parsed.projectCycle || '',
            budgetRange: parsed.budgetRange || '',
            brandStage: parsed.brandStage || '',
            currentPerformance: parsed.currentPerformance || '',
            coreChallenge: parsed.coreChallenge || '',
            brandAssets: Array.isArray(parsed.brandAssets) ? parsed.brandAssets.slice(0, 5) : [],
            targetDemographic: parsed.targetDemographic || '',
            consumerBehavior: parsed.consumerBehavior || '',
            corePainPoints: Array.isArray(parsed.corePainPoints) ? parsed.corePainPoints.slice(0, 5) : [],
            mediaHabits: Array.isArray(parsed.mediaHabits) ? parsed.mediaHabits.slice(0, 5) : [],
            topCompetitors: Array.isArray(parsed.topCompetitors) ? parsed.topCompetitors.slice(0, 3) : [],
            competitorDiff: parsed.competitorDiff || '',
            opportunityPoints: parsed.opportunityPoints || '',
            brandGoal: parsed.brandGoal || '',
            marketingGoal: parsed.marketingGoal || '',
            communicationGoal: parsed.communicationGoal || '',
            kpi: parsed.kpi || '',
            strategyPositioning: parsed.strategyPositioning || '',
            coreProposition: parsed.coreProposition || '',
            supportPoints: Array.isArray(parsed.supportPoints) ? parsed.supportPoints.slice(0, 3) : [],
            themeSlogan: parsed.themeSlogan || '',
            channels: Array.isArray(parsed.channels) ? parsed.channels.slice(0, 5) : [],
            contentDirection: parsed.contentDirection || '',
            executionRhythm: parsed.executionRhythm || '',
            channelBudgetRatio: parsed.channelBudgetRatio || '',
            phaseBudgetAllocation: parsed.phaseBudgetAllocation || '',
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      throw new Error('无法解析AI返回的内容')
    } catch (parseError) {
      console.error('JSON解析失败:', parseError, '原始内容:', content)
      return new Response(JSON.stringify({
        error: '解析AI返回内容失败',
        message: 'AI返回内容格式异常'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error: any) {
    console.error('生成创意简报失败:', error)
    return new Response(JSON.stringify({
      error: '生成失败',
      message: error.message || '未知错误'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
