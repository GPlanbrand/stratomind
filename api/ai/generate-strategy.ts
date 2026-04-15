import type { VercelRequest, VercelResponse } from '@vercel/node'

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' })
  }

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return res.status(500).json({ 
        error: '未配置API Key',
        message: '请在Vercel环境变量中配置 DEEPSEEK_API_KEY'
      })
    }

    const { clientInfo, requirements, brief } = req.body

    if (!clientInfo || !requirements) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    const prompt = `你是资深的品牌策略专家。请基于以下信息，制定完整的创意策略方案。

## 品牌基础信息
- 品牌名称：${clientInfo.companyName || '待填写'}
- 所属行业：${clientInfo.industry || '待确定'}
- 品牌定位：${clientInfo.brandPosition || clientInfo.description || '待明确'}
- 目标市场：${clientInfo.targetMarket || '待分析'}

## 项目需求
- 项目类型：${requirements.projectType || '品牌策划'}
- 目标受众：${requirements.targetAudience || '待定义'}
- 核心信息：${requirements.keyMessage || '待确定'}
- 预算范围：${requirements.budget || '待评估'}
- 时间周期：${requirements.timeline || '待规划'}

## 创意简报摘要
- 项目概述：${brief?.projectOverview || '待生成'}
- 创意方向：${brief?.creativeDirection || '待确定'}
- 关键洞察：${Array.isArray(brief?.keyInsights) ? brief.keyInsights.join('；') : '待分析'}

请制定以下策略内容：

### 1. 核心策略主张（overallStrategy）
品牌最核心的价值主张和策略方向。要明确品牌的独特定位，建立与消费者的情感连接。

### 2. 传播主轴（differentiation）
贯穿整个传播活动的主线，以及与竞品的差异化策略。

### 3. 创意方向（contentStrategy）
创意表现的风格、调性、视觉语言和内容形式规划。

### 4. 执行建议（mediaStrategy）
媒介策略、预算分配建议、执行节奏规划。

请以JSON格式返回：
{
  "overallStrategy": "...",
  "differentiation": "...",
  "contentStrategy": "...",
  "mediaStrategy": "..."
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
            content: '你是一位顶尖的品牌策略专家，擅长品牌定位、竞争分析和传播策略制定。你的分析深入透彻，策略建议具有前瞻性和实操性。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API错误:', response.status, errorText)
      return res.status(500).json({ 
        error: 'AI服务调用失败',
        message: `API返回错误: ${response.status}`
      })
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || ''

    // 解析JSON响应
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return res.status(200).json({
          success: true,
          data: {
            overallStrategy: parsed.overallStrategy || '',
            differentiation: parsed.differentiation || '',
            contentStrategy: parsed.contentStrategy || '',
            mediaStrategy: parsed.mediaStrategy || '',
          }
        })
      }
      throw new Error('无法解析AI返回的内容')
    } catch (parseError) {
      console.error('JSON解析失败:', parseError)
      return res.status(500).json({ 
        error: '解析AI返回内容失败',
        message: 'AI返回内容格式异常'
      })
    }
  } catch (error: any) {
    console.error('生成创意策略失败:', error)
    return res.status(500).json({ 
      error: '生成失败',
      message: error.message || '未知错误'
    })
  }
}
