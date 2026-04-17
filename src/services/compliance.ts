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
