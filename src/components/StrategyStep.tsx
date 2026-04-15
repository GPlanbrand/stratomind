import React, { useState, useEffect } from 'react'
import { Lightbulb, Wand2, Copy, Download, AlertCircle, CheckCircle, FileText, Palette, Video, Sparkles, Tag, Clock, DollarSign, X } from 'lucide-react'
import { Strategy, SpreadRhythm, BudgetAllocation } from '../types'

interface Props {
  data: Partial<Strategy>
  onChange: (data: Partial<Strategy>) => void
}

// Prompt类型
type PromptType = 'copywriting' | 'creative' | 'video'

const promptTypes: { key: PromptType; label: string; icon: React.ElementType; description: string }[] = [
  { key: 'copywriting', label: '文案Prompt', icon: FileText, description: '品牌文案、广告语、社媒内容' },
  { key: 'creative', label: '创意Prompt', icon: Palette, description: '创意概念、视觉方向、海报设计' },
  { key: 'video', label: '视频Prompt', icon: Video, description: '视频脚本、分镜、短视频内容' },
]

// 预置策略关键词
const commonKeywords = [
  '高端', '年轻化', '创新', '品质', '时尚', '专业', '信赖', '健康',
  '科技', '智能', '温暖', '自然', '活力', '极致', '匠心', '性价比'
]

const StrategyStep: React.FC<Props> = ({ data, onChange }) => {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedPromptType, setSelectedPromptType] = useState<PromptType>('copywriting')
  const [generatedPrompts, setGeneratedPrompts] = useState<Record<PromptType, string>>({
    copywriting: '',
    creative: '',
    video: '',
  })
  
  // 关键词标签状态
  const [keywordInput, setKeywordInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>(data.strategyKeywords || [])

  // 同步关键词到data
  useEffect(() => {
    if (data.strategyKeywords) {
      setKeywords(data.strategyKeywords)
    }
  }, [data.strategyKeywords])

  // 添加关键词
  const addKeyword = (kw: string) => {
    const trimmed = kw.trim()
    if (trimmed && !keywords.includes(trimmed)) {
      const newKeywords = [...keywords, trimmed]
      setKeywords(newKeywords)
      onChange({ ...data, strategyKeywords: newKeywords })
    }
    setKeywordInput('')
  }

  // 删除关键词
  const removeKeyword = (kw: string) => {
    const newKeywords = keywords.filter(k => k !== kw)
    setKeywords(newKeywords)
    onChange({ ...data, strategyKeywords: newKeywords })
  }

  // 快捷添加预置关键词
  const togglePresetKeyword = (kw: string) => {
    let newKeywords: string[]
    if (keywords.includes(kw)) {
      newKeywords = keywords.filter(k => k !== kw)
    } else {
      newKeywords = [...keywords, kw]
    }
    setKeywords(newKeywords)
    onChange({ ...data, strategyKeywords: newKeywords })
  }

  // 生成三类Prompt
  const generateAllPrompts = () => {
    const clientInfo = (window as any).__workspaceClientInfo || {}
    const requirements = (window as any).__workspaceRequirements || {}
    const brief = (window as any).__workspaceBrief || {}
    const competitors = (window as any).__workspaceCompetitors || []
    
    const brandName = clientInfo.companyName || requirements.projectName || '品牌'
    const industry = clientInfo.industry || requirements.industry || '行业'
    const targetAudience = brief.targetDemographic || requirements.targetPersona || requirements.targetAudience || '目标人群'
    const projectType = requirements.projectType || '品牌策划'
    const coreMessage = data.overallStrategy || '核心价值主张'
    const differentiation = data.differentiation || '差异化优势'
    const creativeDirection = data.contentStrategy || '创意方向'
    const channels = requirements.primaryChannels || requirements.channels || []
    const budget = requirements.budgetRange || '待定'
    
    // 提取竞品分析关键词
    const competitorKeywords = competitors.length > 0 
      ? competitors.map((c: any) => c.differentiation || c.brandPositioning).filter(Boolean).slice(0, 3)
      : []

    // 根据项目类型调整Prompt模板
    const typeAdjustedContent = getProjectTypeAdjustedContent(projectType)

    // 文案Prompt
    const copywritingPrompt = `【文案创作任务】

## 品牌信息
品牌名称：${brandName}
所属行业：${industry}
项目类型：${projectType}
目标人群：${targetAudience}

## 策略基础
核心策略主张：
${coreMessage}

传播主轴：
${differentiation}

创意方向：
${creativeDirection}

## 竞品参考
${competitorKeywords.length > 0 ? `已分析的竞品差异化方向：${competitorKeywords.join('；')}` : '暂无竞品数据，需自主探索差异化'}

## 传播渠道
${Array.isArray(channels) && channels.length > 0 ? channels.join('、') : '待定'}

## 文案创作要求
${typeAdjustedContent.copywriting}

请创作以下文案内容：

1. **品牌Slogan**（3-5个备选）
   - 简洁有力，8字以内最佳
   - 易于传播和记忆
   - 体现差异化优势

2. **品牌故事**（200-300字）
   - 体现品牌价值观
   - 与目标人群建立情感连接
   - 适合多渠道延展

3. **社交媒体文案**（3-5条）
   - 小红书种草风格
   - 抖音/短视频风格
   - 微信公众号风格
   - 微博话题文案

4. **产品卖点文案**（3个核心卖点）
   - 每个卖点包含：标题+描述+金句`

    // 创意Prompt
    const creativePrompt = `【创意设计任务】

## 品牌信息
品牌名称：${brandName}
所属行业：${industry}
项目类型：${projectType}
目标人群：${targetAudience}

## 策略基础
创意方向：
${creativeDirection}

传播主轴：
${differentiation}

## 竞品视觉参考
${competitorKeywords.length > 0 ? `已分析竞品的视觉风格：${competitorKeywords.join('；')}，需避免同质化` : '需自主建立独特的视觉风格'}

## 创意设计要求
${typeAdjustedContent.creative}

请提供以下创意设计方案：

1. **视觉风格定义**
   - 色彩体系（主色、辅助色、点缀色）
   - 字体选择建议
   - 图形元素和ICON风格
   - 整体视觉调性

2. **海报创意概念**（3个方向）
   每个方向包含：
   - 概念名称和创意阐述
   - 画面元素描述
   - 适合的应用场景

3. **社交媒体视觉**
   - 小红书封面风格建议
   - 抖音/短视频封面风格
   - 朋友圈广告风格
   - 微博头图风格

4. **品牌视觉延展**
   - 包装设计方向
   - 线下物料应用
   - IP形象建议（如适用）`

    // 视频Prompt
    const videoPrompt = `【视频创作任务】

## 品牌信息
品牌名称：${brandName}
所属行业：${industry}
项目类型：${projectType}
目标人群：${targetAudience}

## 策略基础
核心策略主张：
${coreMessage}

创意方向：
${creativeDirection}

## 预算考量
预算范围：${budget}

## 视频创作要求
${typeAdjustedContent.video}

请创作以下视频内容方案：

1. **品牌宣传片**（30秒版）
   - 脚本大纲
   - 分镜描述
   - 核心画面要点
   - 配乐风格建议

2. **短视频内容规划**（5个选题）
   - 抖音/快手风格
   - 小红书视频风格
   - 每个选题包含：标题、时长、内容要点

3. **产品展示视频**（15秒版）
   - 分镜脚本
   - 节奏把控
   - 关键画面

4. **口播文案**（3个版本）
   - 达人带货版本
   - 品牌官方版本
   - 情景剧版本

5. **视频制作建议**
   - 拍摄风格
   - 后期调色方向
   - 字幕和特效风格`

    setGeneratedPrompts({
      copywriting: copywritingPrompt,
      creative: creativePrompt,
      video: videoPrompt,
    })
  }

  // 根据项目类型调整Prompt内容
  const getProjectTypeAdjustedContent = (projectType: string) => {
    switch (projectType) {
      case '品牌建设':
        return {
          copywriting: '- 侧重品牌故事和价值主张\n- 语言要有高度和格局\n- 强调长期品牌资产积累',
          creative: '- 风格稳重专业\n- 视觉要有品质感\n- 强调品牌调性统一',
          video: '- 叙事性强，有情感深度\n- 画面讲究有质感\n- 适合品牌沉淀'
        }
      case '产品推广':
        return {
          copywriting: '- 突出产品卖点和差异化\n- 语言有说服力\n- 注重场景化表达',
          creative: '- 产品要突出醒目\n- 视觉冲击力要强\n- 卖点传达要直接',
          video: '- 产品展示要精致\n- 节奏明快\n- 行动召唤要明确'
        }
      case '活动策划':
        return {
          copywriting: '- 强调参与感和互动性\n- 语言有号召力\n- 话题感要强',
          creative: '- 视觉要吸引眼球\n- 活动主题要突出\n- 便于二次传播',
          video: '- 前3秒要有爆点\n- 内容要有梗\n- 便于用户参与和模仿'
        }
      case '整合营销':
        return {
          copywriting: '- 考虑多渠道适配\n- 核心信息要统一\n- 各渠道文案要有差异化',
          creative: '- 视觉要有辨识度\n- 便于多渠道延展\n- 线上线下要协调',
          video: '- 内容形式多样化\n- 便于拆条传播\n- 各平台要有适配版本'
        }
      default:
        return {
          copywriting: '- 语言简洁有感染力\n- 符合品牌调性\n- 突出差异化优势',
          creative: '- 视觉差异化明显\n- 易于传播和记忆\n- 符合目标人群审美',
          video: '- 前3秒有强吸引力\n- 节奏符合平台调性\n- 结尾有明确行动召唤'
        }
    }
  }

  // 复制当前选中的Prompt
  const copyCurrentPrompt = () => {
    const prompt = generatedPrompts[selectedPromptType]
    if (prompt) {
      navigator.clipboard.writeText(prompt)
      alert('Prompt已复制到剪贴板')
    }
  }

  const copyPrompt = () => {
    const prompt = `品牌策略分析任务：
核心策略主张：${data.overallStrategy || ''}
传播主轴：${data.differentiation || ''}
创意方向：${data.contentStrategy || ''}
执行建议：${data.mediaStrategy || ''}`
    navigator.clipboard.writeText(prompt)
    alert('Prompt已复制到剪贴板')
  }

  // AI生成策略
  const handleGenerateStrategy = async () => {
    setGenerating(true)
    setError(null)
    setSuccess(false)
    
    try {
      // 从全局获取上下文数据
      const clientInfo = (window as any).__workspaceClientInfo || {}
      const requirements = (window as any).__workspaceRequirements || {}
      const brief = (window as any).__workspaceBrief || {}
      const competitors = (window as any).__workspaceCompetitors || []
      
      // 调用API
      const response = await fetch('/api/ai/generate-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientInfo,
          requirements,
          brief,
          competitors,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '生成失败')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // 合并更新数据
        const newData = {
          ...result.data,
          // 保留原有内容（如果有用户修改过）
          overallStrategy: result.data.overallStrategy || data.overallStrategy || '',
          differentiation: result.data.differentiation || data.differentiation || '',
          contentStrategy: result.data.contentStrategy || data.contentStrategy || '',
          mediaStrategy: result.data.mediaStrategy || data.mediaStrategy || '',
        }
        
        // 更新关键词
        if (result.data.strategyKeywords && result.data.strategyKeywords.length > 0) {
          setKeywords(result.data.strategyKeywords)
        }
        
        onChange(newData)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
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

  // 更新传播节奏
  const updateSpreadRhythm = (field: keyof SpreadRhythm, value: string) => {
    const current = data.spreadRhythm || { preHeat: '', outbreak: '', continuation: '' }
    const newSpreadRhythm = { ...current, [field]: value }
    onChange({ ...data, spreadRhythm: newSpreadRhythm })
  }

  // 更新预算分配
  const updateBudgetAllocation = (field: keyof BudgetAllocation, value: string) => {
    const current = data.budgetAllocation || { byChannel: '', byPhase: '' }
    const newBudget = { ...current, [field]: value }
    onChange({ ...data, budgetAllocation: newBudget })
  }

  // 导出策略文档
  const handleExportStrategy = () => {
    const spreadRhythm = data.spreadRhythm || { preHeat: '待填充', outbreak: '待填充', continuation: '待填充' }
    const budgetAllocation = data.budgetAllocation || { byChannel: '待填充', byPhase: '待填充' }
    
    const content = `# 创意策略方案

## 一、核心策略主张
${data.overallStrategy || '（未填写）'}

## 二、传播主轴
${data.differentiation || '（未填写）'}

## 三、创意方向
${data.contentStrategy || '（未填写）'}

## 四、执行建议
${data.mediaStrategy || '（未填写）'}

## 五、策略关键词
${keywords.length > 0 ? keywords.join('、') : '（未填写）'}

## 六、传播节奏

### 预热期
${spreadRhythm.preHeat || '（未填写）'}

### 爆发期
${spreadRhythm.outbreak || '（未填写）'}

### 延续期
${spreadRhythm.continuation || '（未填写）'}

## 七、预算分配

### 按渠道分配
${budgetAllocation.byChannel || '（未填写）'}

### 按阶段分配
${budgetAllocation.byPhase || '（未填写）'}

---
生成时间：${new Date().toLocaleString('zh-CN')}
`.trim()

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `创意策略_${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">创意策略</h2>
        </div>
        <p className="text-gray-500 text-xs sm:text-sm">制定品牌的整体策略和差异化方向</p>
      </div>

      {/* 状态提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>生成成功！内容已填充，可根据需要修改。</span>
        </div>
      )}

      <div className="space-y-5">
        {/* AI生成按钮 */}
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-4">
          <div>
            <p className="text-sm font-medium text-gray-800">AI智能生成策略</p>
            <p className="text-xs text-gray-500 mt-0.5">基于项目信息自动生成完整策略方案</p>
          </div>
          <button
            onClick={handleGenerateStrategy}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                AI生成策略
              </>
            )}
          </button>
        </div>

        {/* 核心策略主张 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">核心策略主张</label>
          <textarea
            value={data.overallStrategy || ''}
            onChange={(e) => onChange({ ...data, overallStrategy: e.target.value })}
            placeholder="品牌最核心的价值主张是什么？希望传达给消费者什么样的信息？"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 传播主轴 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">传播主轴</label>
          <textarea
            value={data.differentiation || ''}
            onChange={(e) => onChange({ ...data, differentiation: e.target.value })}
            placeholder="贯穿整个传播活动的主线是什么？如何保持信息的一致性？"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 创意方向 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">创意方向</label>
          <textarea
            value={data.contentStrategy || ''}
            onChange={(e) => onChange({ ...data, contentStrategy: e.target.value })}
            placeholder="创意表现的风格、调性、视觉语言等有什么要求？"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 执行建议 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">执行建议</label>
          <textarea
            value={data.mediaStrategy || ''}
            onChange={(e) => onChange({ ...data, mediaStrategy: e.target.value })}
            placeholder="在执行层面有什么特别的建议或注意事项？"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 策略关键词标签 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-purple-600" />
            <label className="text-sm font-medium text-gray-700">策略关键词</label>
            <span className="text-xs text-gray-400">（AI自动提取，可手动调整）</span>
          </div>
          
          {/* 当前关键词标签 */}
          <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
            {keywords.map((kw) => (
              <span 
                key={kw}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                {kw}
                <button 
                  onClick={() => removeKeyword(kw)}
                  className="w-4 h-4 rounded-full hover:bg-purple-200 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {keywords.length === 0 && (
              <span className="text-sm text-gray-400 italic">暂无关键词，点击下方快速添加或让AI生成</span>
            )}
          </div>
          
          {/* 添加关键词输入 */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addKeyword(keywordInput)
                }
              }}
              placeholder="输入关键词后按回车添加"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => addKeyword(keywordInput)}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              添加
            </button>
          </div>
          
          {/* 预置关键词快捷添加 */}
          <div className="flex flex-wrap gap-1.5">
            {commonKeywords.filter(k => !keywords.includes(k)).slice(0, 8).map((kw) => (
              <button
                key={kw}
                onClick={() => togglePresetKeyword(kw)}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 transition-colors"
              >
                + {kw}
              </button>
            ))}
          </div>
        </div>

        {/* 传播节奏建议 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-600" />
            <label className="text-sm font-medium text-gray-800">传播节奏建议</label>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">预热期（启动期）</label>
              <textarea
                value={data.spreadRhythm?.preHeat || ''}
                onChange={(e) => updateSpreadRhythm('preHeat', e.target.value)}
                placeholder="如何引起关注，制造期待..."
                rows={2}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white/80"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">爆发期（集中爆发）</label>
              <textarea
                value={data.spreadRhythm?.outbreak || ''}
                onChange={(e) => updateSpreadRhythm('outbreak', e.target.value)}
                placeholder="如何集中资源，形成声量..."
                rows={2}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white/80"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">延续期（长尾传播）</label>
              <textarea
                value={data.spreadRhythm?.continuation || ''}
                onChange={(e) => updateSpreadRhythm('continuation', e.target.value)}
                placeholder="如何保持热度，长尾传播..."
                rows={2}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white/80"
              />
            </div>
          </div>
        </div>

        {/* 预算分配建议 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-green-600" />
            <label className="text-sm font-medium text-gray-800">预算分配建议</label>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">按渠道分配</label>
              <textarea
                value={data.budgetAllocation?.byChannel || ''}
                onChange={(e) => updateBudgetAllocation('byChannel', e.target.value)}
                placeholder="如：KOL 40%、信息流 30%、线下活动 30%"
                rows={2}
                className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none bg-white/80"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">按阶段分配</label>
              <textarea
                value={data.budgetAllocation?.byPhase || ''}
                onChange={(e) => updateBudgetAllocation('byPhase', e.target.value)}
                placeholder="如：预热 20%、爆发 60%、延续 20%"
                rows={2}
                className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none bg-white/80"
              />
            </div>
          </div>
        </div>

        {/* Prompt生成 */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="text-sm font-medium text-gray-700">生成Prompt</label>
              <p className="text-xs text-gray-500">基于当前策略生成三类AI创作Prompt</p>
            </div>
            <button
              onClick={generateAllPrompts}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              一键生成
            </button>
          </div>
          
          {/* Prompt类型选择 */}
          <div className="flex gap-2 mb-3">
            {promptTypes.map((type) => {
              const Icon = type.icon
              const isActive = selectedPromptType === type.key
              return (
                <button
                  key={type.key}
                  onClick={() => setSelectedPromptType(type.key)}
                  className={`flex-1 flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                    isActive 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                  <span className="sm:hidden">{type.label.replace('Prompt', '')}</span>
                </button>
              )
            })}
          </div>
          
          {/* Prompt内容展示 */}
          <div className="relative">
            <div className="text-xs text-gray-500 mb-1.5">
              {promptTypes.find(t => t.key === selectedPromptType)?.description}
            </div>
            <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200 min-h-[150px] sm:min-h-[200px] whitespace-pre-wrap font-mono text-xs leading-relaxed overflow-y-auto max-h-[250px] sm:max-h-[300px]">
              {generatedPrompts[selectedPromptType] || '点击「一键生成」生成三类Prompt'}
            </div>
            {generatedPrompts[selectedPromptType] && (
              <button
                onClick={copyCurrentPrompt}
                className="absolute top-6 right-2 flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50"
              >
                <Copy className="w-3 h-3" />
                复制
              </button>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={copyPrompt}
            className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            <Copy className="w-4 h-4" />
            复制策略
          </button>
          <button
            onClick={handleExportStrategy}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            导出文档
          </button>
        </div>
      </div>
    </div>
  )
}

export default StrategyStep
