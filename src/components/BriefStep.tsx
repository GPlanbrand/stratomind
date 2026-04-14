import React from 'react'
import { FileText, Sparkles } from 'lucide-react'
import { Brief } from '../types'

interface Props {
  data: Partial<Brief>
  onChange: (data: Partial<Brief>) => void
}

const BriefStep: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-md">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">创意简报</h2>
          <p className="text-sm text-gray-500">明确项目的创意方向和核心洞察</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">项目概述</label>
          <textarea
            value={data.projectOverview || ''}
            onChange={(e) => onChange({ ...data, projectOverview: e.target.value })}
            placeholder="用一段话概括整个项目的背景、目标和预期成果"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">创意方向</label>
          <textarea
            value={data.creativeDirection || ''}
            onChange={(e) => onChange({ ...data, creativeDirection: e.target.value })}
            placeholder="描述您期望的创意风格、表达方式或创意亮点"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">关键洞察</label>
          <p className="text-xs text-gray-500 mb-2">列出项目需要关注的关键洞察点</p>
          {data.keyInsights?.map((insight, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={insight}
                onChange={(e) => {
                  const newInsights = [...(data.keyInsights || [])]
                  newInsights[index] = e.target.value
                  onChange({ ...data, keyInsights: newInsights })
                }}
                placeholder={`洞察点 ${index + 1}`}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
              <button
                onClick={() => {
                  const newInsights = (data.keyInsights || []).filter((_, i) => i !== index)
                  onChange({ ...data, keyInsights: newInsights })
                }}
                className="px-3 text-red-500 hover:bg-red-50 rounded-lg"
              >
                删除
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...data, keyInsights: [...(data.keyInsights || []), ''] })}
            className="text-sm text-orange-500 hover:text-orange-600"
          >
            + 添加洞察点
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">成功指标</label>
          <p className="text-xs text-gray-500 mb-2">定义项目成功的衡量标准</p>
          {data.successMetrics?.map((metric, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={metric}
                onChange={(e) => {
                  const newMetrics = [...(data.successMetrics || [])]
                  newMetrics[index] = e.target.value
                  onChange({ ...data, successMetrics: newMetrics })
                }}
                placeholder={`指标 ${index + 1}`}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
              <button
                onClick={() => {
                  const newMetrics = (data.successMetrics || []).filter((_, i) => i !== index)
                  onChange({ ...data, successMetrics: newMetrics })
                }}
                className="px-3 text-red-500 hover:bg-red-50 rounded-lg"
              >
                删除
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...data, successMetrics: [...(data.successMetrics || []), ''] })}
            className="text-sm text-orange-500 hover:text-orange-600"
          >
            + 添加成功指标
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-orange-50 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-700">
            <p className="font-medium">提示</p>
            <p className="mt-1">创意简报是整个项目的核心指导文档，后续的策略都将基于此展开。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BriefStep
