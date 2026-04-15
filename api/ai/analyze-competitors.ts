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

    const { competitors, clientInfo } = req.body

    if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
      return res.status(400).json({ error: '缺少竞品列表' })
    }

    const industry = clientInfo?.industry || '通用'
    const myBrand = clientInfo ? {
      name: clientInfo.companyName || '我方品牌',
      positioning: clientInfo.brandPosition || clientInfo.description || '',
      targetAudience: clientInfo.targetMarket || ''
    } : undefined

    // 为每个竞品生成分析
    const results = []

    for (const competitor of competitors) {
      const competitorName = competitor.name || '未知品牌'
      
      const prompt = `你是专业的市场分析师。请对"${competitorName}"进行详细的竞品分析。

## 分析背景
- 目标竞品：${competitorName}
- 所属行业：${industry}
${myBrand ? `
## 我方品牌信息（供参考）
- 品牌名称：${myBrand.name}
- 品牌定位：${myBrand.positioning}
- 目标受众：${myBrand.targetAudience}` : ''}

请基于最新的市场信息和行业数据，提供以下分析：

### 1. 品牌定位（brandPositioning）
该品牌在市场中的定位策略，包括核心价值主张、差异化特点。

### 2. 视觉风格（visualStyle）
该品牌的视觉识别系统、视觉风格特点。

### 3. 市场份额（marketShare）
基于最新数据的市场份额估计。

### 4. 目标受众（targetAudience）
该品牌主要面向的消费群体特征。

### 5. 优势（strengths）
该品牌的主要竞争优势。

### 6. 劣势（weaknesses）
该品牌的主要竞争劣势或可突破点。

请以JSON格式返回：
{
  "name": "${competitorName}",
  "brandPositioning": "...",
  "visualStyle": "...",
  "marketShare": "...",
  "targetAudience": "...",
  "strengths": ["...", "...", "...", "..."],
  "weaknesses": ["...", "...", "...", "..."]
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
          ...competitor,
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
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          results.push({
            id: competitor.id,
            name: competitorName,
            brandPositioning: parsed.brandPositioning || '',
            visualStyle: parsed.visualStyle || '',
            marketShare: parsed.marketShare || '',
            targetAudience: parsed.targetAudience || '',
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
            weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
          })
        } else {
          throw new Error('无法解析AI返回的内容')
        }
      } catch (parseError) {
        console.error(`竞品 "${competitorName}" 解析失败:`, parseError)
        results.push({
          ...competitor,
          brandPositioning: '分析结果解析失败',
          visualStyle: '',
          marketShare: '',
          targetAudience: '',
          strengths: [],
          weaknesses: [],
        })
      }
    }

    return res.status(200).json({
      success: true,
      data: results,
    })
  } catch (error: any) {
    console.error('竞品分析失败:', error)
    return res.status(500).json({ 
      error: '分析失败',
      message: error.message || '未知错误'
    })
  }
}
