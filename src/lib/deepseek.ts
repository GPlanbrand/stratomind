/**
 * DeepSeek API 调用封装
 * 用于策略分析、竞品分析（支持联网搜索）
 */

// API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

/**
 * 获取API Key
 */
function getApiKey(): string {
  const apiKey = process.env.DEEPSEEK_API_KEY || ''
  if (!apiKey) {
    throw new Error('未配置 API Key，请检查环境变量 DEEPSEEK_API_KEY')
  }
  return apiKey
}

/**
 * 生成创意策略
 */
export async function generateStrategy(
  clientInfo: {
    companyName: string
    industry: string
    description: string
    targetMarket: string
    brandPosition: string
  },
  requirements: {
    projectType: string
    targetAudience: string
    keyMessage: string
    budget: string
    timeline: string
  },
  brief: {
    projectOverview: string
    creativeDirection: string
    keyInsights: string[]
  }
): Promise<{
  overallStrategy: string
  differentiation: string
  contentStrategy: string
  mediaStrategy: string
}> {
  const apiKey = getApiKey()

  const prompt = `你是资深的品牌策略专家。请基于以下信息，制定完整的创意策略方案。

## 品牌基础信息
- 品牌名称：${clientInfo.companyName}
- 所属行业：${clientInfo.industry}
- 品牌定位：${clientInfo.brandPosition || clientInfo.description || '待明确'}
- 目标市场：${clientInfo.targetMarket || '待分析'}
- 品牌描述：${clientInfo.description || '暂无'}

## 项目需求
- 项目类型：${requirements.projectType || '品牌策划'}
- 目标受众：${requirements.targetAudience || '待定义'}
- 核心信息：${requirements.keyMessage || '待确定'}
- 预算范围：${requirements.budget || '待评估'}
- 时间周期：${requirements.timeline || '待规划'}

## 创意简报摘要
- 项目概述：${brief.projectOverview || '待生成'}
- 创意方向：${brief.creativeDirection || '待确定'}
- 关键洞察：${brief.keyInsights?.join('；') || '待分析'}

请制定以下策略内容：

### 1. 核心策略主张（overallStrategy）
品牌最核心的价值主张和策略方向。要明确品牌的独特定位，建立与消费者的情感连接。字数150-200字。

### 2. 传播主轴（differentiation）
贯穿整个传播活动的主线，以及与竞品的差异化策略。要突出品牌独特价值，建立竞争壁垒。字数100-150字。

### 3. 创意方向（contentStrategy）
创意表现的风格、调性、视觉语言和内容形式规划。要与目标受众产生共鸣，形成记忆点。字数100-150字。

### 4. 执行建议（mediaStrategy）
媒介策略、预算分配建议、执行节奏规划。要具体可行，匹配预算和周期。字数100-150字。

请以JSON格式返回：
{
  "overallStrategy": "...",
  "differentiation": "...",
  "contentStrategy": "...",
  "mediaStrategy": "..."
}`

  try {
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
      throw new Error(`DeepSeek API请求失败: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || ''

    // 解析JSON响应
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          overallStrategy: parsed.overallStrategy || '',
          differentiation: parsed.differentiation || '',
          contentStrategy: parsed.contentStrategy || '',
          mediaStrategy: parsed.mediaStrategy || '',
        }
      }
      throw new Error('无法解析AI返回的内容')
    } catch (parseError) {
      console.error('JSON解析失败:', parseError, '原始内容:', content)
      throw new Error('AI返回内容格式错误')
    }
  } catch (error: any) {
    console.error('生成创意策略失败:', error)
    throw error
  }
}

/**
 * 竞品分析 - 支持联网搜索
 */
export async function analyzeCompetitor(
  competitorName: string,
  industry: string,
  myBrandInfo?: {
    name: string
    positioning: string
    targetAudience: string
  }
): Promise<{
  brandPositioning: string
  visualStyle: string
  marketShare: string
  targetAudience: string
  strengths: string[]
  weaknesses: string[]
}> {
  const apiKey = getApiKey()

  const myBrandContext = myBrandInfo
    ? `\n## 我方品牌信息（供参考）
- 品牌名称：${myBrandInfo.name}
- 品牌定位：${myBrandInfo.positioning}
- 目标受众：${myBrandInfo.targetAudience}`
    : ''

  const prompt = `你是专业的市场分析师。请对"${competitorName}"进行详细的竞品分析。

## 分析背景
- 目标竞品：${competitorName}
- 所属行业：${industry}${myBrandContext}

请搜索最新的市场信息和品牌数据，然后提供以下分析：

### 1. 品牌定位（brandPositioning）
该品牌在市场中的定位策略，包括核心价值主张、差异化特点等。用50字左右概括。

### 2. 视觉风格（visualStyle）
该品牌的视觉识别系统、视觉风格特点。包括色彩、字体、图像风格等。用50字左右概括。

### 3. 市场份额（marketShare）
基于最新数据的市场份额估计（如果没有确切数据，给出大致范围）。

### 4. 目标受众（targetAudience）
该品牌主要面向的消费群体特征。

### 5. 优势（strengths）
该品牌的3-4个主要竞争优势。

### 6. 劣势（weaknesses）
该品牌的3-4个主要竞争劣势或可突破点。

请以JSON格式返回：
{
  "brandPositioning": "...",
  "visualStyle": "...",
  "marketShare": "...",
  "targetAudience": "...",
  "strengths": ["...", "...", "...", "..."],
  "weaknesses": ["...", "...", "...", "..."]
}

重要：请结合最新的市场信息和行业动态进行分析。`

  try {
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
            content: '你是一位专业的数据分析师和营销专家。你善于通过搜索获取最新的市场信息，能够给出客观、准确的竞品分析。在分析中请结合行业趋势和最新动态，给出有洞察力的分析结果。'
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
      throw new Error(`DeepSeek API请求失败: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || ''

    // 解析JSON响应
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          brandPositioning: parsed.brandPositioning || '',
          visualStyle: parsed.visualStyle || '',
          marketShare: parsed.marketShare || '',
          targetAudience: parsed.targetAudience || '',
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        }
      }
      throw new Error('无法解析AI返回的内容')
    } catch (parseError) {
      console.error('JSON解析失败:', parseError, '原始内容:', content)
      throw new Error('AI返回内容格式错误')
    }
  } catch (error: any) {
    console.error('竞品分析失败:', error)
    throw error
  }
}

/**
 * 通用文本生成（DeepSeek）
 */
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  const apiKey = getApiKey()

  try {
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DeepSeek API请求失败: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    return result.choices?.[0]?.message?.content || ''
  } catch (error: any) {
    console.error('生成文本失败:', error)
    throw error
  }
}
