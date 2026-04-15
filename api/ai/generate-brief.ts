import type { VercelRequest, VercelResponse } from '@vercel/node'

// 豆包/通义千问 API配置
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const QIANWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

// 获取API配置
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' })
  }

  try {
    const apiConfig = getApiConfig()
    if (!apiConfig) {
      return res.status(500).json({ 
        error: '未配置API Key',
        message: '请在Vercel环境变量中配置 DOUBAO_API_KEY 或 QIANWEN_API_KEY'
      })
    }

    const { clientInfo, requirements, competitors } = req.body

    if (!clientInfo || !requirements) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    // 构建Prompt
    const competitorSummary = (competitors || []).length > 0
      ? (competitors as any[]).map(c => `- ${c.name}: ${c.brandPositioning || '待分析'}`).join('\n')
      : '暂无竞品数据'

    const prompt = `你是专业的品牌创意策划专家。请根据以下信息，生成一份专业的创意简报。

## 客户信息
- 公司名称：${clientInfo.companyName || '待填写'}
- 所属行业：${clientInfo.industry || '待确定'}
- 公司描述：${clientInfo.description || '暂无描述'}
- 目标市场：${clientInfo.targetMarket || '暂无信息'}

## 项目需求
- 项目类型：${requirements.projectType || '品牌策划'}
- 目标受众：${requirements.targetAudience || '目标消费群体'}
- 核心信息：${requirements.keyMessage || '品牌核心价值'}
- 调性风格：${requirements.tone || '专业、可信赖'}
- 传播渠道：${Array.isArray(requirements.channels) ? requirements.channels.join('、') : '全渠道'}

## 竞品概况
${competitorSummary}

请生成以下内容：

### 1. 项目概述（projectOverview）
一段话概括整个项目的背景、目标和预期成果。要求语言专业、有洞察力，突出品牌的差异化价值。

### 2. 创意方向（creativeDirection）
描述创意表现的风格、调性、视觉语言等。要求具有创新性和差异化。

### 3. 关键洞察（keyInsights）
列出3-4个项目需要关注的关键洞察点，每个洞察点用一句话概括。

### 4. 成功指标（successMetrics）
定义3-4个衡量项目成功的指标。要具体、可量化、可追踪。

请以JSON格式返回：
{
  "projectOverview": "...",
  "creativeDirection": "...",
  "keyInsights": ["...", "...", "...", "..."],
  "successMetrics": ["...", "...", "...", "..."]
}`

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
      console.error('AI API错误:', response.status, errorText)
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
            projectOverview: parsed.projectOverview || '',
            creativeDirection: parsed.creativeDirection || '',
            keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
            successMetrics: Array.isArray(parsed.successMetrics) ? parsed.successMetrics : [],
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
    console.error('生成创意简报失败:', error)
    return res.status(500).json({ 
      error: '生成失败',
      message: error.message || '未知错误'
    })
  }
}
