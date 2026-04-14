import React from 'react'
import { FileText, Sparkles, Plus, Trash2 } from 'lucide-react'
import { Brief } from '../types'

interface Props {
  data: Partial<Brief>
  onChange: (data: Partial<Brief>) => void
}

const BriefStep: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-xl animate-pulse-glow">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/50 to-yellow-500/50 rounded-2xl blur-lg -z-10"></div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">创意简报</h2>
          <p className="text-sm text-white/60">明确项目的创意方向和核心洞察</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* 项目概述 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">项目概述</label>
          <textarea
            value={data.projectOverview || ''}
            onChange={(e) => onChange({ ...data, projectOverview: e.target.value })}
            placeholder="用一段话概括整个项目的背景、目标和预期成果"
            rows={4}
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 outline-none transition-all resize-none text-white placeholder-white/40 backdrop-blur input-glow-orange"
          />
        </div>

        {/* 创意方向 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">创意方向</label>
          <textarea
            value={data.creativeDirection || ''}
            onChange={(e) => onChange({ ...data, creativeDirection: e.target.value })}
            placeholder="描述您期望的创意风格、表达方式或创意亮点"
            rows={4}
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 outline-none transition-all resize-none text-white placeholder-white/40 backdrop-blur input-glow-orange"
          />
        </div>

        {/* 关键洞察 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">关键洞察</label>
          <p className="text-xs text-white/50 mb-3">列出项目需要关注的关键洞察点</p>
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
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 outline-none transition-all text-white placeholder-white/40 input-glow-orange"
              />
              <button
                onClick={() => {
                  const newInsights = (data.keyInsights || []).filter((_, i) => i !== index)
                  onChange({ ...data, keyInsights: newInsights })
                }}
                className="px-4 py-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...data, keyInsights: [...(data.keyInsights || []), ''] })}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-orange-300 hover:text-orange-200 transition-all border border-white/10 hover:border-orange-400/30 backdrop-blur"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            添加洞察点
          </button>
        </div>

        {/* 成功指标 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">成功指标</label>
          <p className="text-xs text-white/50 mb-3">定义项目成功的衡量标准</p>
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
                placeholder={`指标 ${index + 1}`}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 outline-none transition-all text-white placeholder-white/40 input-glow-orange"
              />
              <button
                onClick={() => {
                  const newMetrics = (data.successMetrics || []).filter((_, i) => i !== index)
                  onChange({ ...data, successMetrics: newMetrics })
                }}
                className="px-4 py-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...data, successMetrics: [...(data.successMetrics || []), ''] })}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-orange-300 hover:text-orange-200 transition-all border border-white/10 hover:border-orange-400/30 backdrop-blur"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            添加成功指标
          </button>
        </div>
      </div>

      {/* 提示卡片 */}
      <div className="mt-8 p-5 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-2xl border border-orange-500/30 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-yellow-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-orange-300" />
          </div>
          <div className="text-sm text-orange-100">
            <p className="font-semibold text-orange-200">💡 提示</p>
            <p className="mt-2 text-white/80">创意简报是整个项目的核心指导文档，后续的策略都将基于此展开。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BriefStep
