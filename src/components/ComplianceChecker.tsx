import React, { useState, useCallback, useEffect } from 'react'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Copy,
  Check,
  FileText,
  TrendingUp,
  TrendingDown,
  Minimize2,
  BookOpen,
  Target,
  Sparkles
} from 'lucide-react'
import { checkCompliance, ComplianceResult, ComplianceIssue, getAIPolishSuggestion } from '../services/compliance'

interface ComplianceCheckerProps {
  text: string
  onTextChange?: (text: string) => void
  isEnabled?: boolean
  onEnabledChange?: (enabled: boolean) => void
  autoCheck?: boolean
}

const ComplianceChecker: React.FC<ComplianceCheckerProps> = ({
  text,
  onTextChange,
  isEnabled = false,
  onEnabledChange,
  autoCheck = true
}) => {
  const [result, setResult] = useState<ComplianceResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    high_risk: true,
    medium_risk: true,
    suggestions: true,
    readability: true
  })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({})

  // 自动检测
  useEffect(() => {
    if (autoCheck && isEnabled && text) {
      handleCheck()
    }
  }, [text, isEnabled])

  // 执行检测
  const handleCheck = useCallback(async () => {
    if (!text.trim()) {
      setResult(null)
      return
    }

    setLoading(true)
    try {
      const checkResult = checkCompliance(text)
      setResult(checkResult)
    } catch (error) {
      console.error('检测失败:', error)
    } finally {
      setLoading(false)
    }
  }, [text])

  // 获取AI润色建议
  const handleGetAISuggestion = useCallback(async (issue: ComplianceIssue) => {
    const key = `${issue.category}-${issue.position}`
    if (aiSuggestions[key]) return

    setLoading(true)
    try {
      const suggestion = await getAIPolishSuggestion(text, issue)
      setAiSuggestions(prev => ({ ...prev, [key]: suggestion }))
    } catch (error) {
      console.error('AI建议获取失败:', error)
    } finally {
      setLoading(false)
    }
  }, [text, aiSuggestions])

  // 复制到剪贴板
  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  // 展开/折叠
  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }, [])

  // 分类渲染
  const renderHighRiskSection = () => {
    if (!result?.high_risk.length) return null

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection('high_risk')}
          className="w-full flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-700">
              高风险（需修改）
            </span>
            <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded-full text-sm">
              {result.high_risk.length}项
            </span>
          </div>
          {expandedSections.high_risk ? (
            <ChevronUp className="w-5 h-5 text-red-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-red-600" />
          )}
        </button>

        {expandedSections.high_risk && (
          <div className="mt-2 space-y-2">
            {result.high_risk.map((issue, index) => (
              <IssueCard
                key={`high-${index}`}
                issue={issue}
                text={text}
                onCopy={handleCopy}
                onGetAISuggestion={handleGetAISuggestion}
                aiSuggestion={aiSuggestions[`${issue.category}-${issue.position}`]}
                variant="red"
                copiedId={copiedId}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderMediumRiskSection = () => {
    if (!result?.medium_risk.length) return null

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection('medium_risk')}
          className="w-full flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-yellow-700">
              中风险（建议修改）
            </span>
            <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full text-sm">
              {result.medium_risk.length}项
            </span>
          </div>
          {expandedSections.medium_risk ? (
            <ChevronUp className="w-5 h-5 text-yellow-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-yellow-600" />
          )}
        </button>

        {expandedSections.medium_risk && (
          <div className="mt-2 space-y-2">
            {result.medium_risk.map((issue, index) => (
              <IssueCard
                key={`medium-${index}`}
                issue={issue}
                text={text}
                onCopy={handleCopy}
                onGetAISuggestion={handleGetAISuggestion}
                aiSuggestion={aiSuggestions[`${issue.category}-${issue.position}`]}
                variant="yellow"
                copiedId={copiedId}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderSuggestionsSection = () => {
    if (!result?.suggestions.length) return null

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection('suggestions')}
          className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-700">
              传播优化建议
            </span>
            <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-sm">
              {result.suggestions.length}项
            </span>
          </div>
          {expandedSections.suggestions ? (
            <ChevronUp className="w-5 h-5 text-blue-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-blue-600" />
          )}
        </button>

        {expandedSections.suggestions && (
          <div className="mt-2 space-y-2">
            {result.suggestions.map((issue, index) => (
              <IssueCard
                key={`suggestion-${index}`}
                issue={issue}
                text={text}
                onCopy={handleCopy}
                onGetAISuggestion={handleGetAISuggestion}
                aiSuggestion={aiSuggestions[`${issue.category}-${issue.position}`]}
                variant="blue"
                copiedId={copiedId}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderReadabilitySection = () => {
    if (!result?.readability) return null

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection('readability')}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-700">
              易读性评分
            </span>
          </div>
          {expandedSections.readability ? (
            <ChevronUp className="w-5 h-5 text-purple-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-600" />
          )}
        </button>

        {expandedSections.readability && (
          <div className="mt-3 p-4 bg-white border border-purple-100 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={getScoreColor(result.readability.score)}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${result.readability.score * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: getScoreColor(result.readability.score) }}>
                    {result.readability.score}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-semibold" style={{ color: getScoreColor(result.readability.score) }}>
                    {result.readability.level}
                  </span>
                  {result.readability.score >= 80 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{result.readability.analysis}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">字数：{text.length}</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">建议：{text.length > 2000 ? '精简内容' : '保持当前长度'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderSummary = () => {
    if (!result) return null

    return (
      <div className={`p-4 rounded-lg border ${result.summary.passed ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
        <div className="flex items-center gap-3">
          {result.summary.passed ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          )}
          <div className="flex-1">
            <div className="font-semibold text-lg">
              {result.summary.passed ? '检测通过 ✓' : '存在风险项 ✗'}
            </div>
            <div className="text-sm text-gray-600">
              共发现 {result.summary.total_issues} 个问题，其中高风险 {result.summary.high_risk_count} 项，中风险 {result.summary.medium_risk_count} 项，优化建议 {result.summary.suggestion_count} 项
            </div>
          </div>
          <button
            onClick={handleCheck}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            重新检测
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* 头部 */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">政务新媒体专项检测</h3>
              <p className="text-sm text-blue-100">三审三校 · 合规与传播力双因子评估</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => onEnabledChange?.(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-400"></div>
            <span className="ml-3 text-sm font-medium">
              {isEnabled ? '已开启' : '已关闭'}
            </span>
          </label>
        </div>
      </div>

      {/* 内容区域 */}
      {isEnabled && (
        <div className="p-4">
          {/* 检测结果 */}
          {result && (
            <div className="mb-4">
              {renderSummary()}
            </div>
          )}

          {/* 检测详情 */}
          {result && (
            <div className="space-y-2">
              {renderHighRiskSection()}
              {renderMediumRiskSection()}
              {renderSuggestionsSection()}
              {renderReadabilitySection()}
            </div>
          )}

          {/* 空状态 */}
          {!result && !loading && (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-400 opacity-50" />
              <p>点击「重新检测」或开始输入内容进行自动检测</p>
            </div>
          )}

          {/* 加载状态 */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>正在检测...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 未开启状态 */}
      {!isEnabled && (
        <div className="p-8 text-center text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>开启检测开关，开始进行合规与传播力评估</p>
        </div>
      )}
    </div>
  )
}

// 问题卡片组件
interface IssueCardProps {
  issue: ComplianceIssue
  text: string
  onCopy: (text: string, id: string) => void
  onGetAISuggestion: (issue: ComplianceIssue) => void
  aiSuggestion?: string
  variant: 'red' | 'yellow' | 'blue'
  copiedId: string | null
}

const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  text,
  onCopy,
  onGetAISuggestion,
  aiSuggestion,
  variant,
  copiedId
}) => {
  const [showContext, setShowContext] = useState(false)

  // 获取上下文
  const getContext = () => {
    const lines = text.split('\n')
    const lineIndex = issue.line - 1
    const start = Math.max(0, lineIndex - 1)
    const end = Math.min(lines.length, lineIndex + 2)
    return lines.slice(start, end).join('\n')
  }

  const colorClasses = {
    red: {
      border: 'border-red-200',
      bg: 'bg-red-50',
      badge: 'bg-red-100 text-red-700',
      icon: 'text-red-500'
    },
    yellow: {
      border: 'border-yellow-200',
      bg: 'bg-yellow-50',
      badge: 'bg-yellow-100 text-yellow-700',
      icon: 'text-yellow-500'
    },
    blue: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-700',
      icon: 'text-blue-500'
    }
  }

  const colors = colorClasses[variant]

  const getCategoryLabel = () => {
    const labels: Record<string, string> = {
      extreme_word: '极限词',
      political_sensitive: '敏感词',
      formal_term: '术语优化',
      long_sentence: '长难句',
      sensitive_date: '敏感日期',
      title_norm: '称谓规范',
      org_norm: '机构表述'
    }
    return labels[issue.category] || issue.category
  }

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-3`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.badge}`}>
            {getCategoryLabel()}
          </span>
          <span className="text-sm text-gray-500">第{issue.line}段</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowContext(!showContext)}
            className="p-1 hover:bg-white/50 rounded"
            title="查看上下文"
          >
            <Minimize2 className="w-4 h-4 text-gray-400" />
          </button>
          {issue.suggestion && (
            <button
              onClick={() => onCopy(issue.suggestion!, `suggestion-${issue.position}`)}
              className="p-1 hover:bg-white/50 rounded"
              title="复制建议"
            >
              {copiedId === `suggestion-${issue.position}` ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mb-2">
        <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
          "{issue.text}"
        </span>
      </div>

      {issue.suggestion && (
        <div className="flex items-start gap-2 mb-2">
          <span className="text-green-600 text-sm font-medium">→</span>
          <span className="text-sm text-gray-700">
            建议改为：<span className="font-medium text-green-700">{issue.suggestion}</span>
          </span>
        </div>
      )}

      <p className="text-xs text-gray-500 mb-2">{issue.reason}</p>

      {/* AI润色建议 */}
      <div className="mt-2">
        <button
          onClick={() => onGetAISuggestion(issue)}
          disabled={!!aiSuggestion}
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          {aiSuggestion ? 'AI润色建议' : '获取AI润色建议'}
        </button>
        {aiSuggestion && (
          <div className="mt-1 p-2 bg-white rounded border border-gray-200 text-sm">
            {aiSuggestion}
          </div>
        )}
      </div>

      {/* 上下文 */}
      {showContext && (
        <div className="mt-2 p-2 bg-white rounded border border-gray-200 font-mono text-xs whitespace-pre-wrap">
          {getContext()}
        </div>
      )}
    </div>
  )
}

// 获取评分颜色
function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e' // green
  if (score >= 80) return '#84cc16' // lime
  if (score >= 70) return '#eab308' // yellow
  if (score >= 60) return '#f97316' // orange
  return '#ef4444' // red
}

export default ComplianceChecker
