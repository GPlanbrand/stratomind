/**
 * 豆包/通义千问 API 调用封装
 * 用于文案生成、创意简报生成
 */

// API配置
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const QIANWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

// 获取API Key
function getApiKey(): string {
  const apiKey = process.env.DOUBAO_API_KEY || process.env.QIANWEN_API_KEY || ''
  if (!apiKey) {
    throw new Error('未配置 API Key，请检查环境变量 DOUBAO_API_KEY 或 QIANWEN_API_KEY')
  }
  return apiKey
}

// 选择API端点
function getApiUrl(): string {
  if (process.env.DOUBAO_API_KEY) {
    return DOUBAO_API_URL
  }
  return QIANWEN_API_URL
}

/**
 * 生成创意简报
 */
export async function generateBrief(
  clientInfo: {
    companyName: string
    industry: string
    description: string
    targetMarket: string
  },
  requirements: {
    projectType: string
    targetAudience: string
    keyMessage: string
    tone: string
    channels: string[]
  },
  competitors: Array<{ name: string; brandPositioning: string }>
): Promise<{
  projectOverview: string
  creativeDirection: string
  keyInsights: string[]
  successMetrics: string[]
}> {
  const apiUrl = getApiUrl()
  const apiKey = getApiKey()

  // 竞品信息摘要
  const competitorSummary = competitors.length > 0
    ? competitors.map(c => `- ${c.name}: ${c.brandPositioning}`).join('\n')
    : '暂无竞品数据'

  // Prompt模板
  const prompt = `你是专业的品牌创意策划专家。请根据以下信息，生成一份专业的创意简报。

## 客户信息
- 公司名称：${clientInfo.companyName}
- 所属行业：${clientInfo.industry}
- 公司描述：${clientInfo.description || '暂无描述'}
- 目标市场：${clientInfo.targetMarket || '暂无信息'}

## 项目需求
- 项目类型：${requirements.projectType || '品牌策划'}
- 目标受众：${requirements.targetAudience || '目标消费群体'}
- 核心信息：${requirements.keyMessage || '品牌核心价值'}
- 调性风格：${requirements.tone || '专业、可信赖'}
- 传播渠道：${requirements.channels?.join('、') || '全渠道'}

## 竞品概况
${competitorSummary}

请生成以下内容：

### 1. 项目概述（projectOverview）
一段话概括整个项目的背景、目标和预期成果。要求语言专业、有洞察力，突出品牌的差异化价值。字数150-200字。

### 2. 创意方向（creativeDirection）
描述创意表现的风格、调性、视觉语言等。要求具有创新性和差异化，避免与竞品雷同。字数100-150字。

### 3. 关键洞察（keyInsights）
列出3-4个项目需要关注的关键洞察点，每个洞察点用一句话概括。要基于目标受众和市场竞争分析，具有战略指导意义。

### 4. 成功指标（successMetrics）
定义3-4个衡量项目成功的指标。要具体、可量化、可追踪。

请以JSON格式返回，结构如下：
{
  "projectOverview": "...",
  "creativeDirection": "...",
  "keyInsights": ["...", "...", "...", "..."],
  "successMetrics": ["...", "...", "...", "..."]
}`

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DOUBAO_API_KEY ? 'doubao-pro-32k' : 'qwen-plus',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的品牌策划专家，擅长品牌策略制定、创意简报撰写和市场竞争分析。请用专业、精准的语言输出高质量的策划内容。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API请求失败: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || ''

    // 解析JSON响应
    try {
      // 尝试提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          projectOverview: parsed.projectOverview || '',
          creativeDirection: parsed.creativeDirection || '',
          keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
          successMetrics: Array.isArray(parsed.successMetrics) ? parsed.successMetrics : [],
        }
      }
      throw new Error('无法解析AI返回的内容')
    } catch (parseError) {
      console.error('JSON解析失败:', parseError, '原始内容:', content)
      throw new Error('AI返回内容格式错误')
    }
  } catch (error: any) {
    console.error('生成创意简报失败:', error)
    throw error
  }
}

/**
 * 通用文本生成
 */
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  const apiUrl = getApiUrl()
  const apiKey = getApiKey()

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DOUBAO_API_KEY ? 'doubao-pro-32k' : 'qwen-plus',
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
      throw new Error(`API请求失败: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    return result.choices?.[0]?.message?.content || ''
  } catch (error: any) {
    console.error('生成文本失败:', error)
    throw error
  }
}
