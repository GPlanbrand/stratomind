import type { VercelRequest, VercelResponse } from '@vercel/node'

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

// 项目类型对应的策略重点
const projectTypeFocus: Record<string, { emphasis: string; tone: string }> = {
  '品牌建设': { emphasis: '品牌资产积累、品牌认知建立', tone: '专业、可信赖、有高度' },
  '产品推广': { emphasis: '产品卖点转化、购买决策引导', tone: '生动、有说服力、场景化' },
  '活动策划': { emphasis: '活动参与感、话题传播性', tone: '有活力、互动性强、年轻化' },
  '整合营销': { emphasis: '多渠道协同、传播效率最大化', tone: '系统化、全方位、整合性' },
  'default': { emphasis: '品牌价值传递、市场竞争突围', tone: '差异化、有记忆点、易传播' }
}

// 行业特点关键词映射
const industryKeywords: Record<string, string[]> = {
  '科技': ['创新', '智能', '未来', '技术领先'],
  '美妆': ['美丽', '自信', '精致', '生活方式'],
  '食品': ['美味', '健康', '品质', '生活方式'],
  '服装': ['时尚', '个性', '品味', '态度'],
  '教育': ['成长', '未来', '专业', '信赖'],
  '金融': ['稳健', '专业', '安全', '增值'],
  '医疗': ['专业', '健康', '信赖', '关怀'],
  '地产': ['品质', '生活', '价值', '归属'],
  '汽车': ['性能', '品质', '驾驭', '生活方式'],
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    const { clientInfo, requirements, brief, competitors } = req.body

    if (!clientInfo && !requirements) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    // 提取关键数据
    const companyName = clientInfo?.companyName || clientInfo?.brandName || '品牌'
    const industry = clientInfo?.industry || requirements?.industry || ''
    const projectType = requirements?.projectType || '品牌策划'
    const targetAudience = requirements?.targetPersona || brief?.targetDemographic || requirements?.targetAudience || '目标消费者'
    const budget = requirements?.budgetRange || requirements?.budget || '待评估'
    const channels = requirements?.primaryChannels || requirements?.channels || []
    
    // 获取项目类型对应的策略重点
    const typeConfig = projectTypeFocus[projectType] || projectTypeFocus['default']
    
    // 获取行业关键词
    const industryKeys = Object.entries(industryKeywords)
      .find(([key]) => industry.includes(key))?.[1] || []
    
    // 分析竞品信息，提取差异化关键词
    const competitorAnalysis = analyzeCompetitors(competitors, industryKeys)
    
    // 构建增强版Prompt
    const prompt = buildEnhancedPrompt({
      companyName,
      industry,
      projectType,
      typeConfig,
      industryKeys,
      targetAudience,
      budget,
      channels,
      competitorAnalysis,
      clientInfo,
      requirements,
      brief,
    })

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
            content: `你是顶尖的品牌策略专家，擅长：
1. 品牌定位与价值主张提炼
2. 竞争分析与差异化策略制定
3. 创意方向规划与内容策略
4. 媒介组合与传播节奏设计
5. 预算分配与执行建议

你的策略建议具有：
- 前瞻性：洞察行业趋势
- 差异化：明确与竞品的区别
- 实操性：可直接落地执行
- 创新性：突破常规思维

请始终以JSON格式返回，确保字段完整。`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.75,
        max_tokens: 3000,
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
            strategyKeywords: parsed.strategyKeywords || [],
            spreadRhythm: parsed.spreadRhythm || { preHeat: '', outbreak: '', continuation: '' },
            budgetAllocation: parsed.budgetAllocation || { byChannel: '', byPhase: '' },
          }
        })
      }
      throw new Error('无法解析AI返回的内容')
    } catch (parseError) {
      console.error('JSON解析失败:', parseError, '原始内容:', content)
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

// 分析竞品信息，提取差异化关键词
function analyzeCompetitors(competitors: any[] = [], industryKeys: string[] = []) {
  if (!competitors || competitors.length === 0) {
    return {
      summary: '暂无竞品数据，需要自主探索差异化方向',
      competitiveGaps: industryKeys,
      differentiators: []
    }
  }

  const competitorNames = competitors.map((c: any) => c.name || '竞品').join('、')
  
  // 提取竞品的品牌定位和差异化策略
  const competitorPositions = competitors.map((c: any) => ({
    name: c.name,
    positioning: c.brandPositioning || c.coreValue || '',
    differentiation: c.differentiation || c.differentiation || '',
    strengths: c.strengths || [],
  }))

  // 找出竞品常用关键词（用于避免重复）
  const allPositioningWords = competitorPositions
    .flatMap((c: any) => (c.positioning + ' ' + c.differentiation).split(/[,，、；;]/))
    .filter(Boolean)

  // 找出差异化机会点
  const commonWords = new Set(allPositioningWords)
  const uniqueOpportunities = industryKeys.filter(k => !allPositioningWords.includes(k))

  return {
    summary: `主要竞品包括：${competitorNames}`,
    competitorPositions,
    commonPositioningWords: Array.from(new Set(allPositioningWords)),
    uniqueOpportunities,
  }
}

// 构建增强版Prompt
function buildEnhancedPrompt(params: {
  companyName: string
  industry: string
  projectType: string
  typeConfig: { emphasis: string; tone: string }
  industryKeys: string[]
  targetAudience: string
  budget: string
  channels: string[]
  competitorAnalysis: ReturnType<typeof analyzeCompetitors>
  clientInfo: any
  requirements: any
  brief: any
}) {
  const {
    companyName,
    industry,
    projectType,
    typeConfig,
    industryKeys,
    targetAudience,
    budget,
    channels,
    competitorAnalysis,
  } = params

  const channelsStr = Array.isArray(channels) && channels.length > 0 
    ? channels.join('、') 
    : '待定'

  return `## 品牌基础信息
- 品牌名称：${companyName}
- 所属行业：${industry}
- 行业关键词：${industryKeys.join('、')}
- 项目类型：${projectType}
- 本次策略重点：${typeConfig.emphasis}

## 目标人群
${targetAudience}

## 竞品分析
${competitorAnalysis.summary}
${competitorAnalysis.commonPositioningWords.length > 0 
  ? `\n- 竞品常用定位词（需差异化）：${competitorAnalysis.commonPositioningWords.slice(0, 8).join('、')}`
  : ''}
${competitorAnalysis.uniqueOpportunities.length > 0 
  ? `\n- 差异化机会点：${competitorAnalysis.uniqueOpportunities.join('、')}`
  : ''}

## 传播渠道
主要渠道：${channelsStr}

## 预算范围
${budget}

## 传播调性要求
${typeConfig.tone}

---

请制定完整的创意策略方案，包括以下内容：

### 1. 核心策略主张（overallStrategy）
品牌最核心的价值主张，要：
- 体现${typeConfig.emphasis}
- 与竞品形成差异化
- 能够引发目标人群共鸣
- 语言简洁有力，便于传播

### 2. 传播主轴（differentiation）
贯穿整个传播活动的主线，要：
- 明确与竞品的差异化定位
- 形成独特的品牌记忆点
- 可以用一句话概括传播核心

### 3. 创意方向（contentStrategy）
创意表现的规划，要：
- 定义创意风格和调性
- 提出具体的内容形式建议
- 符合目标人群的审美偏好
- 考虑多渠道内容适配

### 4. 执行建议（mediaStrategy）
执行层面的具体建议，包括：
- 媒介组合策略
- 内容生产建议
- 执行注意事项

### 5. 策略关键词（strategyKeywords） - 必填
从以下维度提取5-8个关键词：
- 品牌调性关键词（2-3个）
- 产品卖点关键词（2-3个）
- 差异化关键词（2个）
- 传播风格关键词（1-2个）

### 6. 传播节奏（spreadRhythm） - 必填
分三个阶段的策略建议：
- 预热期：如何引起关注，制造期待
- 爆发期：如何集中资源，形成声量
- 延续期：如何保持热度，长尾传播

### 7. 预算分配（budgetAllocation） - 必填
按以下维度给出建议：
- byChannel：按渠道分配建议（如KOL 40%、信息流 30%、线下活动 30%）
- byPhase：按阶段分配建议（如预热 20%、爆发 60%、延续 20%）

请以JSON格式返回：
{
  "overallStrategy": "核心策略主张内容，200字左右",
  "differentiation": "传播主轴内容，150字左右",
  "contentStrategy": "创意方向内容，200字左右",
  "mediaStrategy": "执行建议内容，150字左右",
  "strategyKeywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"],
  "spreadRhythm": {
    "preHeat": "预热期策略建议",
    "outbreak": "爆发期策略建议",
    "continuation": "延续期策略建议"
  },
  "budgetAllocation": {
    "byChannel": "按渠道的预算分配建议",
    "byPhase": "按阶段的预算分配建议"
  }
}`
}
