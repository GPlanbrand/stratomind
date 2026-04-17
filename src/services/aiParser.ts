/**
 * AI 需求解析服务
 * 用于解析甲方上传的图片/语音，提取显性指令和隐性意图
 */

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

// 豆包/通义千问 API配置
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const QIANWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

// 获取API Key
function getApiKey(): string {
  const apiKey = import.meta.env?.DOUBAO_API_KEY || import.meta.env?.QIANWEN_API_KEY || import.meta.env?.DEEPSEEK_API_KEY || ''
  return apiKey
}

// 选择API端点
function getApiUrl(): string {
  if (import.meta.env?.DOUBAO_API_KEY) {
    return DOUBAO_API_URL
  }
  if (import.meta.env?.DEEPSEEK_API_KEY) {
    return DEEPSEEK_API_URL
  }
  return QIANWEN_API_URL
}

// 获取模型名称
function getModelName(): string {
  if (import.meta.env?.DOUBAO_API_KEY) {
    return 'doubao-pro-32k'
  }
  if (import.meta.env?.DEEPSEEK_API_KEY) {
    return 'deepseek-chat'
  }
  return 'qwen-plus'
}

/**
 * 通用文本生成函数
 */
async function generateText(
  prompt: string,
  systemPrompt: string = '你是一位专业的品牌策划专家。'
): Promise<string> {
  const apiUrl = getApiUrl()
  const apiKey = getApiKey()

  if (!apiKey) {
    throw new Error('未配置 API Key，请检查环境变量 DOUBAO_API_KEY 或 QIANWEN_API_KEY')
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: getModelName(),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API请求失败: ${response.status}`)
    }

    const result = await response.json()
    return result.choices?.[0]?.message?.content || ''
  } catch (error: any) {
    console.error('AI生成失败:', error)
    throw error
  }
}

// ============ 类型定义 ============

/** 显性指令 */
export interface ExplicitInstruction {
  id: string
  content: string
  priority: 'high' | 'medium' | 'low'
  category: 'visual' | 'content' | 'layout' | 'style' | 'deadline' | 'other'
}

/** 隐性意图 */
export interface ImplicitIntent {
  id: string
  content: string
  reasoning: string
  confidence: number // 0-1
}

/** 需求解析结果 */
export interface ParsedRequirement {
  explicitInstructions: ExplicitInstruction[]
  implicitIntents: ImplicitIntent[]
  originalText?: string
  summary: string
  timestamp: string
}

/** 多版本比稿方案 */
export interface VersionOption {
  version: 'A' | 'B' | 'C'
  title: string
  description: string
  keyFeatures: string[]
  styleDirection: string
}

/** 比稿解析结果 */
export interface VersionComparisonResult {
  originalRequest: string
  versions: VersionOption[]
  recommendation: string
  timestamp: string
}

// ============ 核心解析函数 ============

/**
 * 解析图片中的需求（通过AI图像理解）
 */
export async function parseImageRequirement(
  imageUrl: string,
  projectContext?: string
): Promise<ParsedRequirement> {
  const apiUrl = getApiUrl()
  const apiKey = getApiKey()

  if (!apiKey) {
    throw new Error('未配置 API Key，请检查环境变量')
  }

  const contextSection = projectContext
    ? `## 项目背景\n${projectContext}\n`
    : ''

  const prompt = `你是专业的广告公司需求分析师。你的任务是从甲方发送的图片中准确识别设计修改需求。

${contextSection}
## 图片URL
${imageUrl}

## 分析要求

请仔细分析这张图片，识别其中包含的所有需求信息：

### 1. 显性指令（看得见的明确需求）
识别图片中直接展示的修改要求，例如：
- 视觉元素："Logo放大"、"背景改红色"、"加金色边框"
- 内容文字："加上紧急通知字样"、"改成黑体字"
- 布局调整："标题居中"、"文字左对齐"
- 风格要求："更有科技感"、"更简约"
- 时间要求："明天下午之前"、"加急"

### 2. 隐性意图（推测的深层需求）
基于图片内容和上下文，推测甲方的深层意图：
- 为什么强调这个修改？（如：强调紧迫感可能意味着甲方要赶时效）
- 修改背后可能的业务目标
- 用户体验或审美的潜在考量

### 3. 优先级标注
- high：高优先级，影响核心功能或紧迫
- medium：中等优先级，常规修改
- low：低优先级，可延后处理

## 输出格式

请严格按以下JSON格式返回，不要添加任何额外的markdown标记：

{
  "explicitInstructions": [
    {
      "id": "e1",
      "content": "具体指令内容",
      "priority": "high|medium|low",
      "category": "visual|content|layout|style|deadline|other"
    }
  ],
  "implicitIntents": [
    {
      "id": "i1",
      "content": "推测的隐性意图",
      "reasoning": "推测理由",
      "confidence": 0.85
    }
  ],
  "summary": "一句话总结识别到的核心需求",
  "timestamp": "${new Date().toISOString()}"
}`

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: getModelName(),
        messages: [
          {
            role: 'system',
            content: '你是一位经验丰富的广告公司需求分析师，擅长从甲方的模糊表述中提取准确需求，并推测隐性意图。你的分析要专业、准确、有洞察力。'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API请求失败: ${response.status}`)
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || ''

    return parseJsonResponse(content)
  } catch (error: any) {
    console.error('图片需求解析失败:', error)
    throw error
  }
}

/**
 * 解析语音转文字后的需求
 */
export async function parseVoiceRequirement(
  transcribedText: string,
  projectContext?: string
): Promise<ParsedRequirement> {
  const contextSection = projectContext
    ? `\n## 项目背景\n${projectContext}\n`
    : ''

  const prompt = `你是专业的广告公司需求分析师。你的任务是从甲方发送的语音转文字内容中，准确识别设计修改需求。

${contextSection}
## 甲方原话（语音转文字）
"""
${transcribedText}
"""

## 分析要求

请仔细分析这段文字，识别其中包含的所有需求信息：

### 1. 显性指令（明确的修改要求）
识别直接表达的修改要求：
- 视觉元素："Logo放大"、"背景改红色"
- 内容文字："加上XX字样"、"改成XX"
- 布局调整："标题居中"、"左对齐"
- 风格要求："更有科技感"、"更简约"
- 时间要求："明天下午之前"、"加急"

### 2. 隐性意图（推测的深层需求）
基于文字内容和语气，推测甲方的深层意图：
- 语气词背后的情绪（着急、不满意、期待）
- 反复强调的点暗示的重要性
- 修改可能达成的业务目标

### 3. 优先级标注
根据内容判断优先级：
- high：明确紧迫、有时间限制、多次强调
- medium：常规修改请求
- low：可选优化、建议性质

### 4. 类别标注
- visual：视觉元素相关
- content：内容文字相关
- layout：布局结构相关
- style：风格调性相关
- deadline：时间截止相关
- other：其他

## 输出格式

请严格按以下JSON格式返回，不要添加任何额外的markdown标记：

{
  "explicitInstructions": [
    {
      "id": "e1",
      "content": "具体指令内容",
      "priority": "high|medium|low",
      "category": "visual|content|layout|style|deadline|other"
    }
  ],
  "implicitIntents": [
    {
      "id": "i1",
      "content": "推测的隐性意图",
      "reasoning": "推测理由",
      "confidence": 0.85
    }
  ],
  "summary": "一句话总结识别到的核心需求",
  "timestamp": "${new Date().toISOString()}"
}`

  try {
    const result = await generateText(prompt, '你是一位经验丰富的广告公司需求分析师，擅长从甲方的模糊表述中提取准确需求，并推测隐性意图。')
    return parseJsonResponse(result)
  } catch (error: any) {
    console.error('语音需求解析失败:', error)
    throw error
  }
}

/**
 * 生成多版本比稿方案
 */
export async function generateVersionComparison(
  request: string,
  projectContext?: string
): Promise<VersionComparisonResult> {
  const contextSection = projectContext
    ? `\n## 项目背景\n${projectContext}\n`
    : ''

  const prompt = `你是专业的广告公司创意总监。你的任务是根据甲方的需求，生成3个差异化的设计方案供比稿选择。

${contextSection}
## 甲方需求
"""
${request}
"""

## 输出要求

请生成A、B、C三个版本的设计方案，每个版本要有明显差异：

### A版本 - 保守稳健型
- 符合经典设计规范
- 风险低，易于通过
- 适合正式商务场景

### B版本 - 创新突破型
- 突破常规设计思维
- 有记忆点和话题性
- 适合年轻化品牌

### C版本 - 融合平衡型
- 在创新和稳健之间找平衡
- 既安全又有新意
- 适合品牌升级场景

## 输出格式

请严格按以下JSON格式返回，不要添加任何额外的markdown标记：

{
  "originalRequest": "${request.replace(/"/g, '\\"')}",
  "versions": [
    {
      "version": "A",
      "title": "方案A标题",
      "description": "方案A详细描述，100字左右",
      "keyFeatures": ["特点1", "特点2", "特点3"],
      "styleDirection": "风格方向描述"
    },
    {
      "version": "B",
      "title": "方案B标题",
      "description": "方案B详细描述，100字左右",
      "keyFeatures": ["特点1", "特点2", "特点3"],
      "styleDirection": "风格方向描述"
    },
    {
      "version": "C",
      "title": "方案C标题",
      "description": "方案C详细描述，100字左右",
      "keyFeatures": ["特点1", "特点2", "特点3"],
      "styleDirection": "风格方向描述"
    }
  ],
  "recommendation": "推荐哪个方案及理由",
  "timestamp": "${new Date().toISOString()}"
}`

  try {
    const result = await generateText(prompt, '你是一位资深广告创意总监，擅长为客户定制差异化设计方案。')
    return parseJsonResponse(result)
  } catch (error: any) {
    console.error('版本比稿生成失败:', error)
    throw error
  }
}

// ============ 辅助函数 ============

/**
 * 解析JSON响应
 */
function parseJsonResponse(content: string): ParsedRequirement | VersionComparisonResult {
  try {
    // 尝试提取JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      
      // 检查是否是比稿结果
      if (parsed.versions && Array.isArray(parsed.versions)) {
        return parsed as VersionComparisonResult
      }
      
      // 需求解析结果
      return {
        explicitInstructions: parsed.explicitInstructions || [],
        implicitIntents: parsed.implicitIntents || [],
        originalText: parsed.originalText,
        summary: parsed.summary || '',
        timestamp: parsed.timestamp || new Date().toISOString(),
      }
    }
    throw new Error('无法解析AI返回的内容')
  } catch (error) {
    console.error('JSON解析失败，原始内容:', content)
    throw new Error('AI返回内容格式错误')
  }
}

/**
 * 生成ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}
