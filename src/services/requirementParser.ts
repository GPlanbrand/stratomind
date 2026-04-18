/**
 * 甲乙方传译闭环 - 需求解析服务
 * 核心功能：AI解析甲方语音/图片需求，生成三列表格（甲方原文 | 推测意图 | 执行动作）
 */

import { ParsedRequirement, RequirementItem } from '../types/requirementParser'

// ============ API配置 ============

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const QIANWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

function getApiKey(): string {
  return import.meta.env?.DOUBAO_API_KEY || import.meta.env?.DEEPSEEK_API_KEY || import.meta.env?.QIANWEN_API_KEY || ''
}

function getApiUrl(): string {
  if (import.meta.env?.DOUBAO_API_KEY) return DOUBAO_API_URL
  if (import.meta.env?.DEEPSEEK_API_KEY) return DEEPSEEK_API_URL
  return QIANWEN_API_URL
}

function getModelName(): string {
  if (import.meta.env?.DOUBAO_API_KEY) return 'doubao-pro-32k'
  if (import.meta.env?.DEEPSEEK_API_KEY) return 'deepseek-chat'
  return 'qwen-plus'
}

// ============ 通用AI调用 ============

async function callAI(prompt: string, systemPrompt: string, imageUrl?: string): Promise<string> {
  const apiUrl = getApiUrl()
  const apiKey = getApiKey()

  if (!apiKey) {
    throw new Error('未配置 API Key，请检查环境变量')
  }

  const messages: any[] = [
    { role: 'system', content: systemPrompt }
  ]

  if (imageUrl) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageUrl } }
      ]
    })
  } else {
    messages.push({ role: 'user', content: prompt })
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getModelName(),
      messages,
      temperature: 0.3,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status}`)
  }

  const result = await response.json()
  return result.choices?.[0]?.message?.content || ''
}

// ============ 核心解析函数 ============

/**
 * 解析图片需求（手绘草图、聊天截图等）
 */
export async function parseImageRequirement(imageUrl: string): Promise<ParsedRequirement> {
  const prompt = `你是专业的广告公司需求分析师。你的任务是从甲方发送的图片中准确识别设计修改需求，生成三列表格。

## 分析要求

请仔细分析这张图片，识别其中包含的所有需求信息：

### 1. 甲方原文/原图关键点
识别图片中直接展示的修改要求，例如：
- 视觉元素："Logo放大"、"背景改红色"、"加金色边框"
- 内容文字："加上紧急通知字样"、"改成黑体字"
- 布局调整："标题居中"、"文字左对齐"
- 风格要求："更有科技感"、"更简约"
- 时间要求："明天下午之前"、"加急"

### 2. 推测意图
基于图片内容和上下文，推测甲方的深层意图：
- 为什么强调这个修改？（如：强调紧迫感可能意味着甲方要赶时效）
- 修改背后可能的业务目标
- 用户体验或审美的潜在考量

### 3. 执行动作
给出设计师/文案可执行的明确动作：
- 具体要做什么
- 参考标准是什么

## 输出格式

请严格按以下JSON格式返回，不要添加任何额外的markdown标记：

{
  "sourceType": "image",
  "originalContent": "图片描述或提取的文字",
  "keyPoints": [
    {
      "id": "p1",
      "originalPoint": "甲方原文或原图中标注的关键点",
      "inferredIntent": "推测的深层意图",
      "action": "设计师需要执行的具体动作",
      "priority": "high|medium|low",
      "category": "visual|content|layout|style|deadline|other"
    }
  ],
  "summary": "一句话总结识别到的核心需求",
  "timestamp": "${new Date().toISOString()}"
}`

  const result = await callAI(
    prompt,
    '你是一位经验丰富的广告公司需求分析师，擅长从甲方的模糊表述中提取准确需求，并推测隐性意图，生成可执行的动作清单。'
  )

  return parseJsonResponse(result, 'image')
}

/**
 * 解析音频文件（需要先转文字）
 * 由于浏览器无法直接解析音频，我们期望用户先转文字
 */
export async function parseAudioRequirement(transcribedText: string): Promise<ParsedRequirement> {
  const prompt = `你是专业的广告公司需求分析师。你的任务是从甲方发送的语音转文字内容中，准确识别设计修改需求，生成三列表格。

## 甲方原话（语音转文字）
"""
${transcribedText}
"""

## 分析要求

### 1. 甲方原文/原图关键点
识别直接表达的修改要求：
- 视觉元素："Logo放大"、"背景改红色"
- 内容文字："加上XX字样"、"改成XX"
- 布局调整："标题居中"、"左对齐"
- 风格要求："更有科技感"、"更简约"
- 时间要求："明天下午之前"、"加急"

### 2. 推测意图
基于文字内容和语气，推测甲方的深层意图：
- 语气词背后的情绪（着急、不满意、期待）
- 反复强调的点暗示的重要性
- 修改可能达成的业务目标

### 3. 执行动作
给出设计师/文案可执行的明确动作：
- 具体要做什么
- 参考标准是什么

## 输出格式

请严格按以下JSON格式返回，不要添加任何额外的markdown标记：

{
  "sourceType": "audio",
  "originalContent": "${transcribedText.substring(0, 500)}",
  "keyPoints": [
    {
      "id": "p1",
      "originalPoint": "甲方原话中的关键表述",
      "inferredIntent": "推测的深层意图",
      "action": "设计师需要执行的具体动作",
      "priority": "high|medium|low",
      "category": "visual|content|layout|style|deadline|other"
    }
  ],
  "summary": "一句话总结识别到的核心需求",
  "timestamp": "${new Date().toISOString()}"
}`

  const result = await callAI(
    prompt,
    '你是一位经验丰富的广告公司需求分析师，擅长从甲方的模糊表述中提取准确需求，并推测隐性意图，生成可执行的动作清单。'
  )

  return parseJsonResponse(result, 'audio')
}

/**
 * 解析纯文本需求
 */
export async function parseTextRequirement(text: string): Promise<ParsedRequirement> {
  return parseAudioRequirement(text)
}

// ============ 辅助函数 ============

function parseJsonResponse(content: string, sourceType: string): ParsedRequirement {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        sourceType: parsed.sourceType || sourceType,
        originalContent: parsed.originalContent || '',
        keyPoints: parsed.keyPoints || [],
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
 * 生成唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

/**
 * 导出的Excel格式数据
 */
export function exportToExcelData(requirement: ParsedRequirement): string[][] {
  const headers = ['甲方原文/原图关键点', '推测意图', '执行动作', '优先级', '类别']
  const rows = requirement.keyPoints.map(item => [
    item.originalPoint,
    item.inferredIntent,
    item.action,
    item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低',
    getCategoryLabel(item.category)
  ])
  return [headers, ...rows]
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    visual: '视觉',
    content: '内容',
    layout: '布局',
    style: '风格',
    deadline: '截止',
    other: '其他'
  }
  return labels[category] || category
}
