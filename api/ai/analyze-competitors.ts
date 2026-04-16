/**
 * 竞品分析接口
 * POST /api/ai/analyze-competitors
 */

import { parseBody } from '../../lib/api'

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

interface Competitor {
  id?: string
  name?: string
  brandPositioning?: string
  targetAudience?: string
}

interface RequestBody {
  competitors?: Competitor[]
  clientInfo?: {
    companyName?: string
    brandPosition?: string
    description?: string
    targetMarket?: string
    industry?: string
  }
}

export default async function handler(req: Request) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: '只支持POST请求' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: '未配置API Key',
        message: '请在Vercel环境变量中配置 DEEPSEEK_API_KEY'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await parseBody<RequestBody>(req)
    const { competitors, clientInfo } = body || {}

    if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
      return new Response(JSON.stringify({ error: '缺少竞品列表' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const industry = clientInfo?.industry || '通用'
    const myBrand = clientInfo ? {
      name: clientInfo.companyName || '我方品牌',
      positioning: clientInfo.brandPosition || clientInfo.description || '',
      targetAudience: clientInfo.targetMarket || ''
    } : undefined

    // 为每个竞品生成分析
    const results: any[] = []

    for (const competitor of competitors) {
      const competitorName = competitor.name || '未知品牌'
      
      // 4A公司标准竞品分析专业Prompt
      const prompt = `你是资深4A广告公司的品牌策略总监。请对"${competitorName}"进行专业的竞品深度分析。

## 分析背景
- 目标竞品：${competitorName}
- 所属行业：${industry}
${myBrand ? `
- 我方品牌：${myBrand.name}
- 我方定位：${myBrand.positioning}
- 我方受众：${myBrand.targetAudience}` : ''}

## 4A公司标准竞品分析框架

请从以下8个维度进行专业分析：

### 维度1：品牌基础信息
分析该品牌的基本定位信息

### 维度2：市场表现
分析该品牌的市场地位和数据表现

### 维度3：品牌策略
分析该品牌的核心价值和差异化策略

### 维度4：产品/服务分析
分析该品牌的产品线和服务特点

### 维度5：营销传播
分析该品牌的传播策略和内容风格

### 维度6：视觉形象
分析该品牌的视觉识别系统和风格特点

### 维度7：SWOT分析
进行完整的SWOT分析

### 维度8：多维度评分
对以下6个维度给出1-100的评分：
- 产品力：产品质量、创新能力、品类覆盖
- 品牌力：品牌知名度、美誉度、忠诚度
- 渠道力：线上线下覆盖、渗透率
- 服务力：售后服务、用户体验
- 创新力：研发投入、模式创新
- 价格力：性价比、定价策略

请严格按照以下JSON格式返回，确保所有字段都有值：
{
  "name": "${competitorName}",
  "brandPositioning": "一句话品牌定位描述，20字以内",
  "targetAudience": "目标人群描述，30字以内",
  "priceRange": "价格区间，如'高端200-500元'",
  "marketShare": "市场份额描述",
  "brandAwareness": "品牌知名度描述",
  "userReputation": "用户口碑描述",
  "coreValue": "核心价值主张，30字以内",
  "differentiation": "差异化策略描述",
  "brandTone": "品牌调性，如'年轻活力/成熟稳重/高端奢华'",
  "coreProducts": ["产品1", "产品2", "产品3"],
  "productStrengths": ["优势1", "优势2", "优势3"],
  "productWeaknesses": ["劣势1", "劣势2", "劣势3"],
  "channels": ["渠道1", "渠道2", "渠道3"],
  "marketingStrategy": "营销策略概述",
  "contentStyle": "内容风格描述",
  "viSystem": "VI系统特点描述",
  "visualStyle": "视觉风格描述",
  "brandPersonality": "品牌人格描述",
  "strengths": ["优势1", "优势2", "优势3", "优势4"],
  "weaknesses": ["劣势1", "劣势2", "劣势3", "劣势4"],
  "opportunities": ["机会1", "机会2", "机会3"],
  "threats": ["威胁1", "威胁2", "威胁3"],
  "scores": {
    "productPower": 75,
    "brandPower": 80,
    "channelPower": 70,
    "servicePower": 65,
    "innovationPower": 75,
    "pricePower": 60
  }
}`

      // 调用DeepSeek API
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位专业的数据分析师和营销专家。你善于分析市场趋势，能够给出客观、准确的竞品分析。在分析中请结合行业动态，给出有洞察力的分析结果。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`竞品 "${competitorName}" 分析失败:`, response.status, errorText)
        // 单个竞品失败不影响其他竞品
        results.push({
          id: competitor.id,
          name: competitorName,
          brandPositioning: '分析失败，请稍后重试',
          visualStyle: '',
          marketShare: '',
          targetAudience: '',
          strengths: [],
          weaknesses: [],
        })
        continue
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
        
        let parsed: any = null
        
        // 尝试解析
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
        
        if (parsed && parsed.brandPositioning) {
          results.push({
            id: competitor.id,
            name: competitorName,
            // 基础信息
            brandPositioning: String(parsed.brandPositioning || '').substring(0, 200),
            targetAudience: String(parsed.targetAudience || '').substring(0, 200),
            priceRange: String(parsed.priceRange || '').substring(0, 100),
            // 市场表现
            marketShare: String(parsed.marketShare || '').substring(0, 100),
            brandAwareness: String(parsed.brandAwareness || '').substring(0, 200),
            userReputation: String(parsed.userReputation || '').substring(0, 200),
            // 品牌策略
            coreValue: String(parsed.coreValue || '').substring(0, 300),
            differentiation: String(parsed.differentiation || '').substring(0, 300),
            brandTone: String(parsed.brandTone || '').substring(0, 100),
            // 产品/服务
            coreProducts: Array.isArray(parsed.coreProducts) ? parsed.coreProducts.slice(0, 5) : [],
            productStrengths: Array.isArray(parsed.productStrengths) ? parsed.productStrengths.slice(0, 5) : [],
            productWeaknesses: Array.isArray(parsed.productWeaknesses) ? parsed.productWeaknesses.slice(0, 5) : [],
            // 营销传播
            channels: Array.isArray(parsed.channels) ? parsed.channels.slice(0, 5) : [],
            marketingStrategy: String(parsed.marketingStrategy || '').substring(0, 300),
            contentStyle: String(parsed.contentStyle || '').substring(0, 200),
            // 视觉形象
            viSystem: String(parsed.viSystem || '').substring(0, 200),
            visualStyle: String(parsed.visualStyle || '').substring(0, 200),
            brandPersonality: String(parsed.brandPersonality || '').substring(0, 100),
            // SWOT分析
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 6) : [],
            weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 6) : [],
            opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities.slice(0, 6) : [],
            threats: Array.isArray(parsed.threats) ? parsed.threats.slice(0, 6) : [],
            // 多维度评分
            scores: parsed.scores || {
              productPower: 70,
              brandPower: 70,
              channelPower: 70,
              servicePower: 70,
              innovationPower: 70,
              pricePower: 70,
            },
          })
        } else {
          throw new Error('解析结果缺少必要字段')
        }
      } catch (parseError: any) {
        console.error(`竞品 "${competitorName}" 解析失败:`, parseError, '原始内容:', content)
        results.push({
          id: competitor.id,
          name: competitorName,
          brandPositioning: '',
          targetAudience: '',
          priceRange: '',
          marketShare: '',
          brandAwareness: '',
          userReputation: '',
          coreValue: '',
          differentiation: '',
          brandTone: '',
          coreProducts: [],
          productStrengths: [],
          productWeaknesses: [],
          channels: [],
          marketingStrategy: '',
          contentStyle: '',
          viSystem: '',
          visualStyle: '',
          brandPersonality: '',
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: [],
          scores: undefined,
          parseError: true,
        })
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: results,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error('竞品分析失败:', error)
    return new Response(JSON.stringify({
      error: '分析失败',
      message: error.message || '未知错误'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
