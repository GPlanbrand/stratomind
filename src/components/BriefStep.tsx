import React, { useState } from 'react'
import { 
  FileText, Plus, Trash2, Wand2, Download, AlertCircle, CheckCircle, 
  ChevronDown, ChevronUp, Users, Target, TrendingUp, Zap, Megaphone, 
  Trophy, PieChart, ChevronRight
} from 'lucide-react'
import { Brief } from '../types'

interface Props {
  data: Partial<Brief>
  onChange: (data: Partial<Brief>) => void
}

// 精简版简报分组
const BRIEF_SECTIONS = [
  { id: 'overview', label: '项目概要', icon: FileText, color: 'blue' },
  { id: 'brand', label: '品牌现状', icon: Target, color: 'purple' },
  { id: 'audience', label: '目标人群', icon: Users, color: 'green' },
  { id: 'competition', label: '竞争格局', icon: TrendingUp, color: 'orange' },
  { id: 'goals', label: '传播目标', icon: Trophy, color: 'pink' },
  { id: 'strategy', label: '核心策略', icon: Zap, color: 'indigo' },
  { id: 'planning', label: '传播规划', icon: Megaphone, color: 'cyan' },
  { id: 'budget', label: '预算分配', icon: PieChart, color: 'amber' },
]

// 创建空白简报数据
const createEmptyBrief = (): Partial<Brief> => ({
  projectName: '',
  clientName: '',
  projectType: '',
  projectCycle: '',
  budgetRange: '',
  brandStage: '',
  currentPerformance: '',
  coreChallenge: '',
  brandAssets: [],
  targetDemographic: '',
  consumerBehavior: '',
  corePainPoints: [],
  mediaHabits: [],
  topCompetitors: [],
  competitorDiff: '',
  opportunityPoints: '',
  brandGoal: '',
  marketingGoal: '',
  communicationGoal: '',
  kpi: '',
  strategyPositioning: '',
  coreProposition: '',
  supportPoints: [],
  themeSlogan: '',
  channels: [],
  contentDirection: '',
  executionRhythm: '',
  channelBudgetRatio: '',
  phaseBudgetAllocation: '',
})

const BriefStep: React.FC<Props> = ({ data, onChange }) => {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    strategy: true,
  })

  // 切换分组展开/收起
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  // AI生成简报
  const handleGenerateBrief = async () => {
    setGenerating(true)
    setError(null)
    setSuccess(false)
    
    try {
      const clientInfo = (window as any).__workspaceClientInfo || {}
      const requirements = (window as any).__workspaceRequirements || {}
      const competitors = (window as any).__workspaceCompetitors || []
      
      const response = await fetch('/api/ai/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientInfo, requirements, competitors }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '生成失败')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        onChange({ ...createEmptyBrief(), ...result.data })
        setSuccess(true)
        setTimeout(() => setSuccess(false), 4000)
      } else {
        throw new Error('返回数据格式错误')
      }
    } catch (err: any) {
      console.error('生成失败:', err)
      setError(err.message || '生成失败，请稍后重试')
    } finally {
      setGenerating(false)
    }
  }

  // 导出简报
  const handleExportBrief = () => {
    const content = `# 创意简报（精简版）

---

## 一、项目概要

- **项目名称**：${data.projectName || '（未填写）'}
- **客户名称**：${data.clientName || '（未填写）'}
- **项目类型**：${data.projectType || '（未填写）'}
- **项目周期**：${data.projectCycle || '（未填写）'}
- **预算范围**：${data.budgetRange || '（未填写）'}

---

## 二、品牌现状

- **品牌阶段**：${data.brandStage || '（未填写）'}
- **当前市场表现**：${data.currentPerformance || '（未填写）'}
- **核心挑战**：${data.coreChallenge || '（未填写）'}
- **品牌资产**：${(data.brandAssets || []).join('、') || '（未填写）'}

---

## 三、目标人群

- **人口属性**：${data.targetDemographic || '（未填写）'}
- **消费行为**：${data.consumerBehavior || '（未填写）'}
- **核心痛点**：${(data.corePainPoints || []).join('、') || '（未填写）'}
- **媒介习惯**：${(data.mediaHabits || []).join('、') || '（未填写）'}

---

## 四、竞争格局

- **直接竞品**：${(data.topCompetitors || []).join('、') || '（未填写）'}
- **竞品差异化**：${data.competitorDiff || '（未填写）'}
- **竞争机会点**：${data.opportunityPoints || '（未填写）'}

---

## 五、传播目标

- **品牌目标**：${data.brandGoal || '（未填写）'}
- **营销目标**：${data.marketingGoal || '（未填写）'}
- **传播目标**：${data.communicationGoal || '（未填写）'}
- **KPI量化**：${data.kpi || '（未填写）'}

---

## 六、核心策略

- **策略定位**：${data.strategyPositioning || '（未填写）'}
- **核心主张**：${data.coreProposition || '（未填写）'}
- **支撑点**：${(data.supportPoints || []).map((p, i) => `${i + 1}. ${p}`).join('\n        ') || '（未填写）'}

---

## 七、传播规划

- **传播主题**：${data.themeSlogan || '（未填写）'}
- **传播渠道**：${(data.channels || []).join('、') || '（未填写）'}
- **内容方向**：${data.contentDirection || '（未填写）'}
- **执行节奏**：${data.executionRhythm || '（未填写）'}

---

## 八、预算分配

- **渠道预算占比**：${data.channelBudgetRatio || '（未填写）'}
- **阶段预算分配**：${data.phaseBudgetAllocation || '（未填写）'}

---

*生成时间：${new Date().toLocaleString('zh-CN')}*
*基于专业创意简报框架（精简实用版）*
`.trim()

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `创意简报_${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 标签输入组件
  const renderTagInput = (
    label: string,
    value: string[],
    onChange: (value: string[]) => void,
    placeholder: string,
    compact: boolean = true
  ) => (
    <div className={compact ? '' : 'mb-4'}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-lg min-h-[40px] bg-white">
        {value.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm">
            {tag}
            <button onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="hover:text-blue-900">
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 min-w-[80px] outline-none text-sm"
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
  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'overview':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">项目名称</label>
              <input type="text" value={data.projectName || ''}
                onChange={(e) => onChange({ ...data, projectName: e.target.value })}
                placeholder="输入项目名称" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">客户名称</label>
              <input type="text" value={data.clientName || ''}
                onChange={(e) => onChange({ ...data, clientName: e.target.value })}
                placeholder="输入客户名称" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">项目类型</label>
              <select value={data.projectType || ''}
                onChange={(e) => onChange({ ...data, projectType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">选择项目类型</option>
                <option value="品牌定位">品牌定位</option>
                <option value="营销传播">营销传播</option>
                <option value="产品推广">产品推广</option>
                <option value="活动策划">活动策划</option>
                <option value="数字营销">数字营销</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">项目周期</label>
              <input type="text" value={data.projectCycle || ''}
                onChange={(e) => onChange({ ...data, projectCycle: e.target.value })}
                placeholder="如：1个月/季度" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">预算范围</label>
              <select value={data.budgetRange || ''}
                onChange={(e) => onChange({ ...data, budgetRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">选择预算档位</option>
                <option value="5万以下">5万以下（轻量级）</option>
                <option value="5-15万">5-15万（基础版）</option>
                <option value="15-50万">15-50万（标准版）</option>
                <option value="50-100万">50-100万（进阶版）</option>
                <option value="100万以上">100万以上（旗舰版）</option>
              </select>
            </div>
          </div>
        )

      case 'brand':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌阶段</label>
                <select value={data.brandStage || ''}
                  onChange={(e) => onChange({ ...data, brandStage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">选择阶段</option>
                  <option value="初创">初创（0-1年）</option>
                  <option value="成长">成长（1-3年）</option>
                  <option value="成熟">成熟（3年以上）</option>
                  <option value="转型">转型/升级</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">当前市场表现</label>
                <input type="text" value={data.currentPerformance || ''}
                  onChange={(e) => onChange({ ...data, currentPerformance: e.target.value })}
                  placeholder="如：本地市场前三" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">核心挑战</label>
              <textarea value={data.coreChallenge || ''}
                onChange={(e) => onChange({ ...data, coreChallenge: e.target.value })}
                placeholder="当前面临的主要问题或挑战" rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            {renderTagInput('品牌资产盘点', data.brandAssets || [],
              (v) => onChange({ ...data, brandAssets: v }), '如：品牌故事/VI资产/用户口碑')}
          </div>
        )

      case 'audience':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">人口属性</label>
                <input type="text" value={data.targetDemographic || ''}
                  onChange={(e) => onChange({ ...data, targetDemographic: e.target.value })}
                  placeholder="如：25-40岁女性/中等收入" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">消费行为</label>
                <input type="text" value={data.consumerBehavior || ''}
                  onChange={(e) => onChange({ ...data, consumerBehavior: e.target.value })}
                  placeholder="如：高频小额/低频大额" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            {renderTagInput('核心痛点', data.corePainPoints || [],
              (v) => onChange({ ...data, corePainPoints: v }), '用户的主要需求和痛点')}
            {renderTagInput('媒介习惯', data.mediaHabits || [],
              (v) => onChange({ ...data, mediaHabits: v }), '如：抖音/朋友圈/小红书')}
          </div>
        )

      case 'competition':
        return (
          <div className="space-y-4">
            {renderTagInput('直接竞品TOP3', data.topCompetitors || [],
              (v) => onChange({ ...data, topCompetitors: v }), '主要竞争对手')}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">竞品差异化分析</label>
              <textarea value={data.competitorDiff || ''}
                onChange={(e) => onChange({ ...data, competitorDiff: e.target.value })}
                placeholder="分析竞品的差异化特点和优势" rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">竞争机会点</label>
              <textarea value={data.opportunityPoints || ''}
                onChange={(e) => onChange({ ...data, opportunityPoints: e.target.value })}
                placeholder="我们可能的机会点和突破口" rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        )

      case 'goals':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌目标</label>
                <select value={data.brandGoal || ''}
                  onChange={(e) => onChange({ ...data, brandGoal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">选择目标</option>
                  <option value="提升认知度">提升认知度</option>
                  <option value="提升美誉度">提升美誉度</option>
                  <option value="塑造品牌形象">塑造品牌形象</option>
                  <option value="品牌升级">品牌升级</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">营销目标</label>
                <select value={data.marketingGoal || ''}
                  onChange={(e) => onChange({ ...data, marketingGoal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">选择目标</option>
                  <option value="提升销量">提升销量</option>
                  <option value="增加客流">增加客流</option>
                  <option value="提高转化">提高转化</option>
                  <option value="获客拉新">获客拉新</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">传播目标</label>
                <select value={data.communicationGoal || ''}
                  onChange={(e) => onChange({ ...data, communicationGoal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">选择目标</option>
                  <option value="曝光量">曝光量</option>
                  <option value="互动量">互动量</option>
                  <option value="话题热度">话题热度</option>
                  <option value="UGC产出">UGC产出</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">KPI量化指标</label>
              <input type="text" value={data.kpi || ''}
                onChange={(e) => onChange({ ...data, kpi: e.target.value })}
                placeholder="如：曝光100万+/互动1万+/转化500+" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        )

      case 'strategy':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">策略定位</label>
              <textarea value={data.strategyPositioning || ''}
                onChange={(e) => onChange({ ...data, strategyPositioning: e.target.value })}
                placeholder="核心策略方向和定位" rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
              <label className="block text-sm font-bold text-purple-800 mb-1.5">💡 核心主张（一句话Slogan）</label>
              <input type="text" value={data.coreProposition || ''}
                onChange={(e) => onChange({ ...data, coreProposition: e.target.value })}
                placeholder="用一句话表达品牌的核心价值主张" 
                className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
            </div>
            {renderTagInput('支撑点（3个核心）', data.supportPoints || [],
              (v) => onChange({ ...data, supportPoints: v }), '支撑核心主张的3个关键点')}
          </div>
        )

      case 'planning':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">传播主题/Slogan</label>
              <input type="text" value={data.themeSlogan || ''}
                onChange={(e) => onChange({ ...data, themeSlogan: e.target.value })}
                placeholder="本次传播的核心主题" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {renderTagInput('传播渠道', data.channels || [],
              (v) => onChange({ ...data, channels: v }), '抖音/小红书/朋友圈/电梯广告等')}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">内容方向</label>
                <textarea value={data.contentDirection || ''}
                  onChange={(e) => onChange({ ...data, contentDirection: e.target.value })}
                  placeholder="内容创作的主要方向" rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">执行节奏</label>
                <select value={data.executionRhythm || ''}
                  onChange={(e) => onChange({ ...data, executionRhythm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">选择节奏</option>
                  <option value="集中爆发">集中爆发（1-2周）</option>
                  <option value="持续渗透">持续渗透（1个月）</option>
                  <option value="长线运营">长线运营（季度）</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'budget':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">渠道预算占比</label>
              <input type="text" value={data.channelBudgetRatio || ''}
                onChange={(e) => onChange({ ...data, channelBudgetRatio: e.target.value })}
                placeholder="如：抖音40%/小红书30%/朋友圈30%" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">阶段预算分配</label>
              <textarea value={data.phaseBudgetAllocation || ''}
                onChange={(e) => onChange({ ...data, phaseBudgetAllocation: e.target.value })}
                placeholder="预热期30%/爆发期50%/长尾期20%" rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getSectionColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      pink: 'bg-pink-100 text-pink-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      cyan: 'bg-cyan-100 text-cyan-600',
      amber: 'bg-amber-100 text-amber-600',
    }
    return colors[color] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 页面头部 - 移动端适配 */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">创意简报</h2>
            <p className="text-xs sm:text-sm text-gray-500">精简版 · 二三四线城市实用框架</p>
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
          <span className="font-medium">简报生成成功！</span>
          <span className="text-green-600">AI已填充完整简报内容</span>
        </div>
      )}

      {/* 简报分组卡片 - 移动端适配 */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
        {BRIEF_SECTIONS.map((section) => {
          const Icon = section.icon
          const isExpanded = expandedSections[section.id]
          return (
            <div key={section.id}>
              <button onClick={() => toggleSection(section.id)}
                className="w-full px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3 sm:gap-4">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${getSectionColorClass(section.color)}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{section.label}</span>
                    <span className="text-xs text-gray-400 ml-1 sm:ml-2 hidden xs:inline">专业维度</span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
              </button>
              {isExpanded && (
                <div className="px-3 sm:px-4 py-4 sm:py-5 bg-gray-50/50 border-t border-gray-100">
                  {renderSectionContent(section.id)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 操作按钮 - 移动端适配 */}
      <div className="mt-6 sm:mt-8 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">准备好生成创意简报了吗？</h4>
            <p className="text-xs sm:text-sm text-gray-500">基于已填写的项目信息，AI将生成完整的专业创意简报</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button onClick={handleExportBrief}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-gray-700 rounded-lg sm:rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors text-sm">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              导出
            </button>
            <button onClick={handleGenerateBrief} disabled={generating}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-orange-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 text-sm">
              {generating ? (
                <><div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />生成中...</>
              ) : (
                <><Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />AI生成</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 使用说明 - 移动端适配 */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-xs sm:text-sm flex items-center justify-center">💡</span>
          精简版简报说明
        </h4>
        <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
          <li>• 本简报基于专业框架，针对二三四线城市实际情况精简优化</li>
          <li>• 8大模块覆盖品牌策略全流程，可直接指导执行落地</li>
          <li>• 渠道建议包含本地化资源（朋友圈、抖音本地生活、电梯广告等）</li>
          <li>• 点击「AI一键生成」可基于项目信息自动填充简报内容</li>
        </ul>
      </div>
    </div>
  )
}

export default BriefStep
