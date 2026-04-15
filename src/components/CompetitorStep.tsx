import React, { useState } from 'react'
import { 
  Users, Plus, Trash2, Sparkles, BarChart3, X, Download, 
  AlertCircle, CheckCircle, ChevronDown, ChevronUp, Target,
  TrendingUp, Eye, MessageSquare, Palette, Zap, Shield, ChevronRight
} from 'lucide-react'
import { Competitor } from '../types'
import { 
  CompetitorRadarChart, 
  PositioningMatrixChart, 
  SwotChart,
  ComparisonTableChart
} from './CompetitorAnalysisCharts'

interface Props {
  data: Competitor[]
  onChange: (data: Competitor[]) => void
}

// 专业分析维度分组
const DIMENSION_GROUPS = [
  { id: 'basic', label: '品牌基础', icon: Target, color: 'blue' },
  { id: 'market', label: '市场表现', icon: TrendingUp, color: 'green' },
  { id: 'strategy', label: '品牌策略', icon: Zap, color: 'purple' },
  { id: 'product', label: '产品服务', icon: Shield, color: 'orange' },
  { id: 'marketing', label: '营销传播', icon: MessageSquare, color: 'pink' },
  { id: 'visual', label: '视觉形象', icon: Palette, color: 'indigo' },
  { id: 'swot', label: 'SWOT分析', icon: Eye, color: 'red' },
]

// 创建空白竞品数据
const createEmptyCompetitor = (): Competitor => ({
  id: Date.now().toString(),
  name: '',
  // 基础信息
  brandPositioning: '',
  targetAudience: '',
  priceRange: '',
  // 市场表现
  marketShare: '',
  brandAwareness: '',
  userReputation: '',
  // 品牌策略
  coreValue: '',
  differentiation: '',
  brandTone: '',
  // 产品/服务
  coreProducts: [],
  productStrengths: [],
  productWeaknesses: [],
  // 营销传播
  channels: [],
  marketingStrategy: '',
  contentStyle: '',
  // 视觉形象
  viSystem: '',
  visualStyle: '',
  brandPersonality: '',
  // SWOT分析
  strengths: [],
  weaknesses: [],
  opportunities: [],
  threats: [],
  scores: undefined,
})

const CompetitorStep: React.FC<Props> = ({ data, onChange }) => {
  const [showCharts, setShowCharts] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    basic: true, swot: true
  })

  // 切换分组展开/收起
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  // AI分析竞品
  const handleAnalyzeCompetitors = async () => {
    const validCompetitors = data.filter(c => c.name && c.name.trim())
    if (validCompetitors.length === 0) {
      alert('请先输入至少一个竞品名称')
      return
    }
    
    setAnalyzing(true)
    setError(null)
    setSuccess(false)
    
    try {
      const clientInfo = (window as any).__workspaceClientInfo || {}
      
      const response = await fetch('/api/ai/analyze-competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitors: validCompetitors.map(c => ({ id: c.id, name: c.name })),
          clientInfo,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '分析失败')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        const updatedCompetitors = data.map(competitor => {
          const aiResult = result.data.find((r: any) => r.id === competitor.id)
          if (aiResult) {
            return {
              ...competitor,
              brandPositioning: competitor.brandPositioning || aiResult.brandPositioning || '',
              targetAudience: competitor.targetAudience || aiResult.targetAudience || '',
              priceRange: competitor.priceRange || aiResult.priceRange || '',
              marketShare: competitor.marketShare || aiResult.marketShare || '',
              brandAwareness: competitor.brandAwareness || aiResult.brandAwareness || '',
              userReputation: competitor.userReputation || aiResult.userReputation || '',
              coreValue: competitor.coreValue || aiResult.coreValue || '',
              differentiation: competitor.differentiation || aiResult.differentiation || '',
              brandTone: competitor.brandTone || aiResult.brandTone || '',
              coreProducts: aiResult.coreProducts?.length ? aiResult.coreProducts : competitor.coreProducts,
              productStrengths: aiResult.productStrengths?.length ? aiResult.productStrengths : competitor.productStrengths,
              productWeaknesses: aiResult.productWeaknesses?.length ? aiResult.productWeaknesses : competitor.productWeaknesses,
              channels: aiResult.channels?.length ? aiResult.channels : competitor.channels,
              marketingStrategy: competitor.marketingStrategy || aiResult.marketingStrategy || '',
              contentStyle: competitor.contentStyle || aiResult.contentStyle || '',
              viSystem: competitor.viSystem || aiResult.viSystem || '',
              visualStyle: competitor.visualStyle || aiResult.visualStyle || '',
              brandPersonality: competitor.brandPersonality || aiResult.brandPersonality || '',
              strengths: aiResult.strengths?.length ? aiResult.strengths : competitor.strengths,
              weaknesses: aiResult.weaknesses?.length ? aiResult.weaknesses : competitor.weaknesses,
              opportunities: aiResult.opportunities?.length ? aiResult.opportunities : competitor.opportunities,
              threats: aiResult.threats?.length ? aiResult.threats : competitor.threats,
              scores: aiResult.scores || competitor.scores,
            }
          }
          return competitor
        })
        
        onChange(updatedCompetitors)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 4000)
      } else {
        throw new Error('返回数据格式错误')
      }
    } catch (err: any) {
      console.error('分析失败:', err)
      setError(err.message || '分析失败，请稍后重试')
    } finally {
      setAnalyzing(false)
    }
  }

  // 生成对比矩阵
  const handleGenerateMatrix = () => {
    if (data.length < 2) {
      alert('请至少添加2个竞品以生成对比分析')
      return
    }
    setShowCharts(true)
  }

  const addCompetitor = () => {
    if (data.length >= 4) {
      alert('最多添加4个竞品')
      return
    }
    onChange([...data, createEmptyCompetitor()])
  }

  const updateCompetitor = (id: string, field: keyof Competitor, value: any) => {
    onChange(data.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const removeCompetitor = (id: string) => {
    onChange(data.filter(c => c.id !== id))
  }

  const exportChartAsImage = (chartId: string, chartName: string) => {
    try {
      const chartElement = document.getElementById(chartId)
      if (!chartElement) return
      const svgElement = chartElement.querySelector('svg')
      if (!svgElement) return
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      if (!ctx) return
      canvas.width = 1200
      canvas.height = 800
      let base64Svg
      try {
        base64Svg = btoa(unescape(encodeURIComponent(svgData)))
      } catch {
        base64Svg = btoa(encodeURIComponent(svgData).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
      }
      img.onload = () => {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 50, 50, 1100, 700)
        const link = document.createElement('a')
        link.download = `${chartName}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
      img.src = 'data:image/svg+xml;base64,' + base64Svg
    } catch (error) {
      console.error('导出图表失败:', error)
    }
  }

  // 标签输入组件
  const renderTagInput = (label: string, value: string[], onChange: (value: string[]) => void, placeholder: string) => (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-lg min-h-[44px] bg-white">
        {value.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm">
            {tag}
            <button onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="hover:text-blue-900">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 min-w-[100px] outline-none text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              e.preventDefault()
              const newTag = e.currentTarget.value.trim()
              if (!value.includes(newTag)) onChange([...value, newTag])
              e.currentTarget.value = ''
            }
          }}
        />
      </div>
    </div>
  )

  // 渲染分组内容
  const renderGroupContent = (competitor: Competitor, groupId: string) => {
    switch (groupId) {
      case 'basic':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌定位</label>
              <input type="text" value={competitor.brandPositioning}
                onChange={(e) => updateCompetitor(competitor.id, 'brandPositioning', e.target.value)}
                placeholder="一句话品牌定位" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">目标人群</label>
              <input type="text" value={competitor.targetAudience}
                onChange={(e) => updateCompetitor(competitor.id, 'targetAudience', e.target.value)}
                placeholder="如：25-35岁都市女性" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">价格区间</label>
              <input type="text" value={competitor.priceRange}
                onChange={(e) => updateCompetitor(competitor.id, 'priceRange', e.target.value)}
                placeholder="如：200-500元" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        )
      case 'market':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">市场份额</label>
              <input type="text" value={competitor.marketShare}
                onChange={(e) => updateCompetitor(competitor.id, 'marketShare', e.target.value)}
                placeholder="如：约15%" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌知名度</label>
              <input type="text" value={competitor.brandAwareness}
                onChange={(e) => updateCompetitor(competitor.id, 'brandAwareness', e.target.value)}
                placeholder="如：全国前三" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">用户口碑</label>
              <input type="text" value={competitor.userReputation}
                onChange={(e) => updateCompetitor(competitor.id, 'userReputation', e.target.value)}
                placeholder="如：好评率90%" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        )
      case 'strategy':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">核心价值主张</label>
              <textarea value={competitor.coreValue}
                onChange={(e) => updateCompetitor(competitor.id, 'coreValue', e.target.value)}
                placeholder="品牌的核心价值和承诺" rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">差异化策略</label>
                <input type="text" value={competitor.differentiation}
                  onChange={(e) => updateCompetitor(competitor.id, 'differentiation', e.target.value)}
                  placeholder="与竞品的差异化" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌调性</label>
                <input type="text" value={competitor.brandTone}
                  onChange={(e) => updateCompetitor(competitor.id, 'brandTone', e.target.value)}
                  placeholder="如：年轻活力/成熟稳重" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        )
      case 'product':
        return (
          <div className="space-y-4">
            {renderTagInput('核心产品', competitor.coreProducts, (v) => updateCompetitor(competitor.id, 'coreProducts', v), '输入后按回车添加')}
            <div className="grid grid-cols-2 gap-4">
              {renderTagInput('产品优势', competitor.productStrengths, (v) => updateCompetitor(competitor.id, 'productStrengths', v), '输入后按回车添加')}
              {renderTagInput('产品劣势', competitor.productWeaknesses, (v) => updateCompetitor(competitor.id, 'productWeaknesses', v), '输入后按回车添加')}
            </div>
          </div>
        )
      case 'marketing':
        return (
          <div className="space-y-4">
            {renderTagInput('传播渠道', competitor.channels, (v) => updateCompetitor(competitor.id, 'channels', v), '如：抖音、小红书')}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">营销策略</label>
                <textarea value={competitor.marketingStrategy}
                  onChange={(e) => updateCompetitor(competitor.id, 'marketingStrategy', e.target.value)}
                  placeholder="主要营销策略概述" rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">内容风格</label>
                <input type="text" value={competitor.contentStyle}
                  onChange={(e) => updateCompetitor(competitor.id, 'contentStyle', e.target.value)}
                  placeholder="如：种草安利/硬广/情感营销" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        )
      case 'visual':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">VI系统</label>
              <input type="text" value={competitor.viSystem}
                onChange={(e) => updateCompetitor(competitor.id, 'viSystem', e.target.value)}
                placeholder="视觉识别系统特点" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">视觉风格</label>
              <input type="text" value={competitor.visualStyle}
                onChange={(e) => updateCompetitor(competitor.id, 'visualStyle', e.target.value)}
                placeholder="如：简约/科技感/轻奢" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌人格</label>
              <input type="text" value={competitor.brandPersonality}
                onChange={(e) => updateCompetitor(competitor.id, 'brandPersonality', e.target.value)}
                placeholder="如：专业可靠/年轻有趣" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        )
      case 'swot':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> 优势 Strengths</h4>
              {renderTagInput('', competitor.strengths, (v) => updateCompetitor(competitor.id, 'strengths', v), '添加优势')}
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> 劣势 Weaknesses</h4>
              {renderTagInput('', competitor.weaknesses, (v) => updateCompetitor(competitor.id, 'weaknesses', v), '添加劣势')}
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> 机会 Opportunities</h4>
              {renderTagInput('', competitor.opportunities, (v) => updateCompetitor(competitor.id, 'opportunities', v), '添加机会')}
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> 威胁 Threats</h4>
              {renderTagInput('', competitor.threats, (v) => updateCompetitor(competitor.id, 'threats', v), '添加威胁')}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const getGroupColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      pink: 'bg-pink-100 text-pink-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      red: 'bg-red-100 text-red-600',
    }
    return colors[color] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 页面头部 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">竞品深度分析</h2>
            <p className="text-gray-500 text-sm">专业 · 8维度专业分析框架</p>
          </div>
        </div>
      </div>

      {/* 状态提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <span className="font-medium">竞品分析完成！</span>
            <span className="text-green-600 ml-2">AI已填充专业分析数据</span>
          </div>
        </div>
      )}

      {/* 引导页 */}
      {data.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">开始竞品分析</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            基于专业框架，从8个维度深度分析竞品，发现市场机会
          </p>
          <button onClick={addCompetitor}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            添加第一个竞品
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((competitor, index) => (
            <div key={competitor.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* 卡片头部 - 移动端适配 */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <input type="text" value={competitor.name}
                    onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                    placeholder="输入竞品名称"
                    className="text-base sm:text-lg font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0 w-full max-w-[200px] sm:max-w-sm" />
                </div>
                <button onClick={() => removeCompetitor(competitor.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0 self-end sm:self-auto">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* 分析维度折叠面板 */}
              <div className="divide-y divide-gray-100">
                {DIMENSION_GROUPS.map((group) => {
                  const Icon = group.icon
                  const isExpanded = expandedGroups[group.id]
                  return (
                    <div key={group.id}>
                      <button onClick={() => toggleGroup(group.id)}
                        className="w-full px-4 sm:px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${getGroupColorClass(group.color)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-gray-900 text-sm sm:text-base">{group.label}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </button>
                      {isExpanded && (
                        <div className="px-4 sm:px-6 py-4 bg-gray-50/50">
                          {renderGroupContent(competitor, group.id)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* 操作按钮区域 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {data.length < 4 && (
                  <button onClick={addCompetitor}
                    className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl font-medium hover:bg-blue-50 hover:border-blue-400 transition-all">
                    <Plus className="w-5 h-5" />
                    添加竞品 ({data.length}/4)
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleAnalyzeCompetitors} disabled={analyzing}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                  {analyzing ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />AI分析中...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" />AI深度分析</>
                  )}
                </button>
                <button onClick={handleGenerateMatrix} disabled={data.length < 2}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50">
                  <BarChart3 className="w-5 h-5" />
                  生成对比图表
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">AI分析维度：</span>
              {['基础信息', '市场表现', '品牌策略', '产品服务', '营销传播', '视觉形象', 'SWOT'].map((dim) => (
                <span key={dim} className="text-xs px-2 py-1 bg-white rounded-full text-gray-600 border border-gray-200">{dim}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 图表模态框 - 移动端适配 */}
      {showCharts && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-gray-100 rounded-2xl w-full max-w-7xl my-4 sm:my-8 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-8 py-3 sm:py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">竞品对比分析报告</h2>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">基于专业分析框架</p>
              </div>
              <button onClick={() => setShowCharts(false)} className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
              {/* 对比总览表格 */}
              <div className="relative">
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                  <button onClick={() => exportChartAsImage('chart-comparison', '竞品对比总览')}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-50 shadow-sm border border-gray-200">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline">导出PNG</span>
                  </button>
                </div>
                <ComparisonTableChart competitors={data} />
              </div>

              {/* 雷达图对比 */}
              <div className="relative">
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                  <button onClick={() => exportChartAsImage('chart-radar', '品牌竞争力雷达图')}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-50 shadow-sm border border-gray-200">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline">导出PNG</span>
                  </button>
                </div>
                <CompetitorRadarChart competitors={data} />
              </div>

              {/* SWOT分析 */}
              <div className="relative">
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                  <button onClick={() => exportChartAsImage('chart-swot', 'SWOT分析')}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-50 shadow-sm border border-gray-200">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline">导出PNG</span>
                  </button>
                </div>
                <SwotChart competitors={data} />
              </div>

              {/* 定位矩阵 */}
              <div className="relative">
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                  <button onClick={() => exportChartAsImage('chart-matrix', '竞争定位矩阵')}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-50 shadow-sm border border-gray-200">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline">导出PNG</span>
                  </button>
                </div>
                <PositioningMatrixChart competitors={data} />
              </div>

              {/* 使用说明 - 移动端适配 */}
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
                <h4 className="font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 text-white text-xs sm:text-sm flex items-center justify-center">📊</span>
                  竞品分析报告使用指南
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-1 sm:mb-2">对比总览表</h5>
                    <p>快速了解各竞品在核心维度的差异化表现，识别市场机会点</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-1 sm:mb-2">竞争力雷达图</h5>
                    <p>六维度综合实力对比，发现我方品牌与竞品的优劣势分布</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-1 sm:mb-2">SWOT分析</h5>
                    <p>深入理解竞品的战略态势，为我方定位提供参考依据</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-1 sm:mb-2">定位矩阵</h5>
                    <p>可视化展示各品牌在价格-品质坐标系中的位置</p>
                  </div>
                </div>
                <p className="mt-3 sm:mt-4 text-blue-600 font-medium flex items-center gap-2 text-xs sm:text-sm">
                  💡 点击每张图表右上角的「导出PNG」按钮可保存分析图表
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompetitorStep
