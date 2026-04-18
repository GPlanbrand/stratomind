import sensitiveWords from '../data/sensitive-words.json'

// 合规检测结果类型
export interface ComplianceIssue {
  type: 'high_risk' | 'medium_risk' | 'suggestion'
  category: 'extreme_word' | 'political_sensitive' | 'formal_term' | 'long_sentence' | 'sensitive_date' | 'title_norm' | 'org_norm'
  text: string
  position: number
  line: number
  suggestion?: string
  reason: string
}

export interface ComplianceResult {
  high_risk: ComplianceIssue[]
  medium_risk: ComplianceIssue[]
  suggestions: ComplianceIssue[]
  readability: {
    score: number
    level: string
    analysis: string
  }
  summary: {
    total_issues: number
    high_risk_count: number
    medium_risk_count: number
    suggestion_count: number
    passed: boolean
  }
}

// 易读性评分算法（中文适配版）
function calculateReadability(text: string): { score: number; level: string; analysis: string } {
  // 分段统计
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0)
  const sentences = text.split(/[。！？.!?]+/).filter(s => s.trim().length > 0)

  // 统计句子长度
  const sentenceLengths = sentences.map(s => s.trim().length)
  const avgSentenceLength = sentenceLengths.length > 0
    ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
    : 0

  // 统计长句比例（超过50字的句子）
  const longSentenceCount = sentences.filter(s => s.trim().length > 50).length
  const longSentenceRatio = sentences.length > 0 ? longSentenceCount / sentences.length : 0

  // 统计段落密度
  const avgParagraphLength = paragraphs.length > 0
    ? text.length / paragraphs.length
    : 0

  // 统计生僻词和术语（简化版：检测生僻字和英文缩写）
  const rareChars = text.match(/[\u4e00-\u9fa5]/g) || []
  const englishWords = text.match(/[a-zA-Z]+/g) || []
  const termRatio = (englishWords.length / (text.length / 2)) * 100

  // 计算易读性分数（0-100）
  let score = 100
  score -= Math.min(avgSentenceLength * 0.5, 30) // 句子越长扣分越多
  score -= longSentenceRatio * 40 // 长句比例扣分
  score -= termRatio * 0.5 // 术语比例扣分
  score = Math.max(0, Math.min(100, score))

  // 确定易读性等级
  let level = '优秀'
  let analysis = ''

  if (score >= 90) {
    level = '优秀'
    analysis = '文字表达清晰、简洁，易于理解。'
  } else if (score >= 80) {
    level = '良好'
    analysis = '文字表达较为清晰，建议适当减少长句。'
  } else if (score >= 70) {
    level = '中等'
    analysis = '存在部分长句和术语，建议优化表达方式。'
  } else if (score >= 60) {
    level = '一般'
    analysis = '长句较多，术语使用频繁，建议简化表达。'
  } else {
    level = '较差'
    analysis = '文字表达复杂，难以理解，建议全面优化。'
  }

  return { score: Math.round(score), level, analysis }
}

// 检测极限词
function checkExtremeWords(text: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = []
  const highRiskWords = sensitiveWords.extreme_words.high_risk
  const mediumRiskWords = sensitiveWords.extreme_words.medium_risk

  // 检测高风险极限词
  highRiskWords.forEach(word => {
    const regex = new RegExp(word, 'g')
    let match
    while ((match = regex.exec(text)) !== null) {
      const lineStart = text.lastIndexOf('\n', match.index) + 1
      const lineEnd = text.indexOf('\n', match.index)
      const line = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd)
      const lineNumber = text.substring(0, match.index).split('\n').length

      issues.push({
        type: 'high_risk',
        category: 'extreme_word',
        text: word,
        position: match.index,
        line: lineNumber,
        suggestion: getExtremeWordSuggestion(word),
        reason: '违反《广告法》规定，使用极限词可能面临行政处罚'
      })
    }
  })

  // 检测中风险极限词
  mediumRiskWords.forEach(word => {
    const regex = new RegExp(word, 'g')
    let match
    while ((match = regex.exec(text)) !== null) {
      const lineStart = text.lastIndexOf('\n', match.index) + 1
      const lineEnd = text.indexOf('\n', match.index)
      const line = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd)
      const lineNumber = text.substring(0, match.index).split('\n').length

      issues.push({
        type: 'medium_risk',
        category: 'extreme_word',
        text: word,
        position: match.index,
        line: lineNumber,
        suggestion: getExtremeWordSuggestion(word),
        reason: '可能涉及违反《广告法》，建议使用更客观的表达'
      })
    }
  })

  return issues
}

// 获取极限词替换建议
function getExtremeWordSuggestion(word: string): string {
  const suggestions: Record<string, string> = {
    '最': '优秀',
    '第一': '前列',
    '唯一': '少数',
    '顶级': '高级',
    '极品': '优质',
    '领先': '先进',
    '首选': '推荐',
    '独家': '特色',
    '完美': '完善',
    '绝对': '相对',
    '终极': '最终',
    '之王': '优秀',
    '之冠': '优秀',
    '史无前例': '罕见',
    '全国首发': '全新推出',
    '全网最低': '优惠',
    '销量第一': '销量领先',
    '排名第一': '排名前列',
    '行业第一': '行业领先',
    '世界领先': '行业先进',
    '国际领先': '行业先进',
    '全球首创': '全新研发',
    '史上最强': '性能优异',
    '100%': '接近100%',
    '零风险': '低风险',
    '零负担': '轻松便捷',
    '零副作用': '安全性高',
    '无任何缺点': '优点突出',
    '永不': '长期',
    '永久': '长期',
    '彻底': '充分',
    '完全': '充分',
    '全部': '大量',
    '所有': '大部分',
    '唯一有效': '有效',
    '唯一选择': '推荐选择',
    '唯一途径': '主要途径',
    '必须': '建议',
    '必需': '需要',
    '必备': '推荐',
    '必备之选': '推荐选择',
    '必买': '推荐购买'
  }

  return suggestions[word] || '请使用更客观、更具体的描述'
}

// 检测政治敏感词
function checkPoliticalSensitive(text: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = []
  const politicalWords = sensitiveWords.political_sensitive

  politicalWords.forEach(word => {
    const regex = new RegExp(word, 'g')
    let match
    while ((match = regex.exec(text)) !== null) {
      const lineNumber = text.substring(0, match.index).split('\n').length

      issues.push({
        type: 'high_risk',
        category: 'political_sensitive',
        text: word,
        position: match.index,
        line: lineNumber,
        suggestion: '请删除或修改相关内容',
        reason: '涉及政治敏感内容，违反相关法律法规'
      })
    }
  })

  return issues
}

// 检测敏感日期
function checkSensitiveDates(text: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = []
  const sensitiveDates = sensitiveWords.sensitive_dates

  sensitiveDates.forEach(date => {
    const regex = new RegExp(date, 'g')
    let match
    while ((match = regex.exec(text)) !== null) {
      const lineNumber = text.substring(0, match.index).split('\n').length

      issues.push({
        type: 'high_risk',
        category: 'sensitive_date',
        text: date,
        position: match.index,
        line: lineNumber,
        suggestion: '请删除或修改相关内容',
        reason: '涉及敏感日期，违反相关法律法规'
      })
    }
  })

  return issues
}

// 检测专业术语通俗化
function checkFormalTerms(text: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = []
  const formalTerms = sensitiveWords.formal_terms_suggestions

  Object.entries(formalTerms).forEach(([term, suggestion]) => {
    const regex = new RegExp(term, 'g')
    let match
    while ((match = regex.exec(text)) !== null) {
      const lineNumber = text.substring(0, match.index).split('\n').length

      issues.push({
        type: 'suggestion',
        category: 'formal_term',
        text: term,
        position: match.index,
        line: lineNumber,
        suggestion: suggestion,
        reason: '术语过于专业，建议使用更通俗易懂的表达'
      })
    }
  })

  return issues
}

// 检测长难句
function checkLongSentences(text: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = []
  const sentences = text.split(/[。！？.!?]+/)

  sentences.forEach((sentence, index) => {
    if (sentence.trim().length > 50) {
      const position = text.indexOf(sentence)
      const lineNumber = text.substring(0, position).split('\n').length

      issues.push({
        type: 'medium_risk',
        category: 'long_sentence',
        text: sentence.trim(),
        position: position,
        line: lineNumber,
        suggestion: `建议将此长句（${sentence.trim().length}字）拆分为2-3个短句`,
        reason: '长句难以阅读和理解，影响传播效果'
      })
    }
  })

  return issues
}

// 检测称谓规范
function checkTitleNorms(text: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = []
  const norms = sensitiveWords.title_norms

  norms.不规范.forEach(title => {
    const regex = new RegExp(title, 'g')
    let match
    while ((match = regex.exec(text)) !== null) {
      const lineNumber = text.substring(0, match.index).split('\n').length

      issues.push({
        type: 'medium_risk',
        category: 'title_norm',
        text: title,
        position: match.index,
        line: lineNumber,
        suggestion: `建议使用"${norms.建议[0]}"等规范称谓`,
        reason: '称谓不规范，不符合政务新媒体写作规范'
      })
    }
  })

  return issues
}

// 检测组织机构规范
function checkOrganizationNorms(text: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = []
  const norms = sensitiveWords.organization_norms

  norms.不规范.forEach(org => {
    const regex = new RegExp(org, 'g')
    let match
    while ((match = regex.exec(text)) !== null) {
      const lineNumber = text.substring(0, match.index).split('\n').length

      issues.push({
        type: 'medium_risk',
        category: 'org_norm',
        text: org,
        position: match.index,
        line: lineNumber,
        suggestion: `建议使用"${norms.建议[0]}"等规范表述`,
        reason: '组织机构表述不规范，不符合政务新媒体写作规范'
      })
    }
  })

  return issues
}

// 主检测函数
export function checkCompliance(text: string): ComplianceResult {
  const allIssues = [
    ...checkExtremeWords(text),
    ...checkPoliticalSensitive(text),
    ...checkSensitiveDates(text),
    ...checkFormalTerms(text),
    ...checkLongSentences(text),
    ...checkTitleNorms(text),
    ...checkOrganizationNorms(text)
  ]

  // 分类问题
  const high_risk = allIssues.filter(issue => issue.type === 'high_risk')
  const medium_risk = allIssues.filter(issue => issue.type === 'medium_risk')
  const suggestions = allIssues.filter(issue => issue.type === 'suggestion')

  // 计算易读性
  const readability = calculateReadability(text)

  // 汇总信息
  const summary = {
    total_issues: allIssues.length,
    high_risk_count: high_risk.length,
    medium_risk_count: medium_risk.length,
    suggestion_count: suggestions.length,
    passed: high_risk.length === 0
  }

  return {
    high_risk,
    medium_risk,
    suggestions,
    readability,
    summary
  }
}

// AI润色建议（调用DeepSeek）
export async function getAIPolishSuggestion(
  text: string,
  issue: ComplianceIssue
): Promise<string> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的政务新媒体文案编辑，擅长优化文案表达，使其更规范、更通俗、更易传播。'
          },
          {
            role: 'user',
            content: `请帮我优化以下文案中的"${issue.text}"，原因：${issue.reason}。\n\n原文：${text}\n\n请给出2-3个优化建议，要求符合政务新媒体规范，通俗易懂。`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    const data = await response.json()
    return data.choices[0]?.message?.content || issue.suggestion || '请参考上述建议'
  } catch (error) {
    console.error('AI润色失败:', error)
    return issue.suggestion || '请参考上述建议'
  }
}


// ========== 公文格式刷功能 ==========

// 公文类型
export type DocumentType = 
  | 'notice'        // 通知
  | 'memo'          // 备忘录
  | 'report'         // 报告
  | 'decision'       // 决定
  | 'announcement'   // 公告
  | 'meeting'        // 会议纪要

// 格式刷配置
interface FormatBrushConfig {
  documentType: DocumentType
  title?: string
  department?: string
  date?: string
}

// 公文格式刷 - 将大白话转换为标准公文格式
export function formatToOfficialDocument(
  plainText: string,
  config: FormatBrushConfig
): string {
  const { documentType, title, department = 'XX部门', date } = config
  const currentDate = date || new Date().toLocaleDateString('zh-CN')
  
  // 提取关键信息
  const safetyMatch = plainText.match(/安全/gi)
  const importantMatch = plainText.match(/重要/gi)
  
  // 根据文档类型生成对应格式
  switch (documentType) {
    case 'notice':
      return generateNotice(plainText, {
        title: title || extractTitle(plainText) || '关于召开会议的通知',
        department,
        date: currentDate,
        meetingInfo: extractMeetingInfo(plainText),
        safetyRelated: safetyMatch !== null
      })
    
    case 'meeting':
      return generateMeetingMinutes(plainText, {
        title: title || extractTitle(plainText) || '会议纪要',
        department,
        date: currentDate,
        meetingTopic: extractMeetingTopic(plainText)
      })
    
    case 'report':
      return generateReport(plainText, {
        title: title || extractTitle(plainText) || '工作报告',
        department,
        date: currentDate
      })
    
    case 'memo':
      return generateMemo(plainText, {
        title: title || extractTitle(plainText) || '备忘录',
        department,
        date: currentDate
      })
    
    case 'decision':
      return generateDecision(plainText, {
        title: title || extractTitle(plainText) || '关于XXX的决定',
        department,
        date: currentDate,
        importantRelated: importantMatch !== null
      })
    
    case 'announcement':
      return generateAnnouncement(plainText, {
        title: title || extractTitle(plainText) || '公告',
        department,
        date: currentDate
      })
    
    default:
      return generateNotice(plainText, {
        title: title || '通知',
        department,
        date: currentDate,
        meetingInfo: extractMeetingInfo(plainText),
        safetyRelated: safetyMatch !== null
      })
  }
}

// 提取标题
function extractTitle(text: string): string | null {
  const titleMatch = text.match(/关于(.+?)的通知|关于(.+?)的决定|关于(.+?)的报告/)
  if (titleMatch) {
    return `关于${titleMatch[1] || titleMatch[2] || titleMatch[3]}的通知`
  }
  const topicMatch = text.match(/(?:讨论|研究|召开)(.+?)(?:的|会|会议)/i)
  if (topicMatch) {
    return `关于召开${topicMatch[1]}会议的通知`
  }
  return null
}

// 提取会议信息
function extractMeetingInfo(text: string): { time?: string; location?: string; participants?: string } {
  const info: { time?: string; location?: string; participants?: string } = {}
  const timeMatch = text.match(/(?:下周[一二三四五六日天]|周[一二三四五六日]|今天|明天|后天)(?:上午|下午|晚上)?/i)
  if (timeMatch) info.time = timeMatch[0]
  const locationMatch = text.match(/(?:在|到)(.+?)(?:开会|讨论|举行|召开)/i)
  if (locationMatch) info.location = locationMatch[1]
  const participantMatch = text.match(/(?:参加|参与|出席)(?:人员|者)?(.+?)(?:的|会|会议|讨论|$)/i)
  if (participantMatch) info.participants = participantMatch[1]
  return info
}

// 提取会议主题
function extractMeetingTopic(text: string): string {
  const topicMatch = text.match(/(?:讨论|研究|商讨)(.+?)(?:的|问题|事项|工作)/i)
  if (topicMatch) return topicMatch[1]
  if (/安全(?!生产)/i.test(text)) return '安全工作'
  return '相关工作'
}

// 生成通知格式
function generateNotice(text: string, options: any): string {
  const { title, department, date, meetingInfo, safetyRelated } = options
  
  if (safetyRelated) {
    return `${title}

${department}
${date}

各科室、下属单位：

为进一步加强安全生产工作，经研究决定，定于${meetingInfo?.time || '近期'}召开安全生产专题会议，现将有关事项通知如下：

一、会议时间
${meetingInfo?.time || '另行通知'}

二、会议地点
${meetingInfo?.location || '另行通知'}

三、参会人员
${meetingInfo?.participants || '各科室负责人、安全生产管理人员'}

四、会议内容
（一）传达上级安全生产工作会议精神；
（二）通报近期安全生产工作情况；
（三）研究部署下一阶段安全生产重点工作。

五、有关要求
（一）请参会人员提前10分钟入场就座；
（二）因故无法参会的，请提前向会务组请假并安排人员代开；
（三）请携带相关材料，做好发言准备。

${department}
${date}`
  }
  
  return `${title}

${department}
${date}

各部门、全体员工：

${meetingInfo?.time ? `经研究，定于${meetingInfo.time}` : '经研究，定于近期'}召开会议，现将有关事项通知如下：

一、会议时间
${meetingInfo?.time || '另行通知'}

二、会议地点
${meetingInfo?.location || '另行通知'}

三、参会人员
${meetingInfo?.participants || '相关人员'}

四、会议内容
（一）${extractMeetingTopic(text) || '研究相关工作'}；
（二）其他事项。

五、有关要求
（一）请提前安排好工作，准时参会；
（二）如有特殊情况无法参会，请提前向会议组织部门报告。

${department}
${date}`
}

// 生成会议纪要格式
function generateMeetingMinutes(text: string, options: any): string {
  const { title, department, date, meetingTopic } = options
  return `${title}

会议时间：${date}
会议地点：待定
主 持 人：待定
记 录 人：待定
参会人员：待定

一、会议议题
${meetingTopic || '相关工作研究'}

二、会议内容
（一）
（二）
（三）

三、会议决定
（一）
（二）

四、下一步工作安排
（一）
（二）

五、备注
${department}
${date}`
}

// 生成报告格式
function generateReport(text: string, options: any): string {
  const { title, department, date } = options
  return `${title}

${department}
${date}

领导：

${text}

${department}
${date}`
}

// 生成备忘录格式
function generateMemo(text: string, options: any): string {
  const { title, department, date } = options
  return `备 忘 录

致：相关人员
自：${department}
日期：${date}
主题：${title}

${text}`
}

// 生成决定格式
function generateDecision(text: string, options: any): string {
  const { title, department, date, importantRelated } = options
  return `${title}

${department}
${date}

${importantRelated ? '为进一步加强XX工作，确保XX目标的实现，经研究决定：' : '经研究，决定如下：'}

一、
二、
三、

${department}
${date}`
}

// 生成公告格式
function generateAnnouncement(text: string, options: any): string {
  const { title, department, date } = options
  return `${title}

${department}
${date}

${text}

${department}
${date}`
}

// 快速格式转换 - 智能识别内容类型
export function quickFormat(plainText: string): string {
  if (/安全(?!生产)/i.test(plainText) || /生产安全/i.test(plainText)) {
    return formatToOfficialDocument(plainText, { documentType: 'notice', title: '安全生产专题会议通知' })
  }
  if (/开会|讨论|会议|周[一二三四五六日天]/i.test(plainText)) {
    return formatToOfficialDocument(plainText, { documentType: 'notice' })
  }
  if (/报告|汇报/i.test(plainText)) {
    return formatToOfficialDocument(plainText, { documentType: 'report' })
  }
  return formatToOfficialDocument(plainText, { documentType: 'notice' })
}
