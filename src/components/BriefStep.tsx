import React, { useState } from 'react'
import { FileText, Plus, Trash2, Wand2, Download } from 'lucide-react'
import { Brief } from '../types'

interface Props {
  data: Partial<Brief>
  onChange: (data: Partial<Brief>) => void
}

const BriefStep: React.FC<Props> = ({ data, onChange }) => {
  const [generating, setGenerating] = useState(false)

  // AI生成简报内容
  const handleGenerateBrief = async () => {
    setGenerating(true)
    try {
      // 模拟AI生成（实际项目中可调用后端API）
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const generatedBrief: Partial<Brief> = {
        projectOverview: data.projectOverview || '基于市场洞察和品牌定位，本项目旨在打造具有差异化竞争力的品牌形象，通过创新的传播策略提升品牌在目标市场的认知度和美誉度。',
        creativeDirection: data.creativeDirection || '采用年轻化、时尚化的视觉风格，结合故事化的内容叙事方式，突出品牌的独特价值和情感连接点。',
        keyInsights: data.keyInsights?.length ? data.keyInsights : [
          '目标用户对品质和性价比有双重需求',
          '竞品在情感化表达方面存在不足',
          '社交媒体是触达目标用户的主要渠道',
          '内容共创可以有效提升用户参与度'
        ],
        successMetrics: data.successMetrics?.length ? data.successMetrics : [
          '品牌认知度提升20%',
          '社交媒体互动率提升30%',
          '目标用户转化率提升15%'
        ]
      }
      onChange(generatedBrief)
    } catch (error) {
      console.error('生成失败:', error)
      alert('生成失败，请稍后重试')
    } finally {
      setGenerating(false)
    }
  }

  // 导出简报为文本文件
  const handleExportBrief = () => {
    const content = `# 创意简报

## 项目概述
${data.projectOverview || '（未填写）'}

## 创意方向
${data.creativeDirection || '（未填写）'}

## 关键洞察
${(data.keyInsights || []).map((insight, i) => `${i + 1}. ${insight}`).join('\n') || '（未填写）'}

## 成功指标
${(data.successMetrics || []).map((metric, i) => `${i + 1}. ${metric}`).join('\n') || '（未填写）'}

---
生成时间：${new Date().toLocaleString('zh-CN')}
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">创意简报</h2>
        </div>
        <p className="text-gray-500 text-sm">明确项目的创意方向和核心洞察</p>
      </div>

      <div className="space-y-5">
        {/* 项目概述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">项目概述</label>
          <textarea
            value={data.projectOverview || ''}
            onChange={(e) => onChange({ ...data, projectOverview: e.target.value })}
            placeholder="用一段话概括整个项目的背景、目标和预期成果"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 创意方向 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">创意方向</label>
          <textarea
            value={data.creativeDirection || ''}
            onChange={(e) => onChange({ ...data, creativeDirection: e.target.value })}
            placeholder="描述您期望的创意风格、表达方式或创意亮点"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 关键洞察 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">关键洞察</label>
          <p className="text-xs text-gray-400 mb-3">列出项目需要关注的关键洞察点</p>
          {data.keyInsights?.map((insight, index) => (
            <div key={index} className="flex gap-3 mb-3">
              <input
                type="text"
                value={insight}
                onChange={(e) => {
                  const newInsights = [...(data.keyInsights || [])]
                  newInsights[index] = e.target.value
                  onChange({ ...data, keyInsights: newInsights })
                }}
                placeholder={`洞察点 ${index + 1}`}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  const newInsights = (data.keyInsights || []).filter((_, i) => i !== index)
                  onChange({ ...data, keyInsights: newInsights })
                }}
                className="px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...data, keyInsights: [...(data.keyInsights || []), ''] })}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all border border-dashed border-gray-300"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            添加洞察点
          </button>
        </div>

        {/* 成功指标 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">成功指标</label>
          <p className="text-xs text-gray-400 mb-3">定义项目成功的衡量标准</p>
          {data.successMetrics?.map((metric, index) => (
            <div key={index} className="flex gap-3 mb-3">
              <input
                type="text"
                value={metric}
                onChange={(e) => {
                  const newMetrics = [...(data.successMetrics || [])]
                  newMetrics[index] = e.target.value
                  onChange({ ...data, successMetrics: newMetrics })
                }}
                placeholder={`成功指标 ${index + 1}`}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  const newMetrics = (data.successMetrics || []).filter((_, i) => i !== index)
                  onChange({ ...data, successMetrics: newMetrics })
                }}
                className="px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...data, successMetrics: [...(data.successMetrics || []), ''] })}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all border border-dashed border-gray-300"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            添加成功指标
          </button>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          <button 
            onClick={handleGenerateBrief}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            {generating ? '生成中...' : 'AI一键生成'}
          </button>
          <button 
            onClick={handleExportBrief}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            导出简报
          </button>
        </div>
      </div>
    </div>
  )
}

export default BriefStep
