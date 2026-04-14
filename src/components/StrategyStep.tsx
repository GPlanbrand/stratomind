import React from 'react'
import { Lightbulb, Sparkles } from 'lucide-react'
import { Strategy } from '../types'

interface Props {
  data: Partial<Strategy>
  onChange: (data: Partial<Strategy>) => void
}

const StrategyStep: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">创意策略</h2>
          <p className="text-sm text-gray-500">制定品牌的整体策略和差异化方向</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">整体策略</label>
          <textarea
            value={data.overallStrategy || ''}
            onChange={(e) => onChange({ ...data, overallStrategy: e.target.value })}
            placeholder="描述品牌的整体战略方向和核心主张"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">差异化定位</label>
          <textarea
            value={data.differentiation || ''}
            onChange={(e) => onChange({ ...data, differentiation: e.target.value })}
            placeholder="说明品牌与竞品的差异化优势和独特卖点"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">内容策略</label>
          <textarea
            value={data.contentStrategy || ''}
            onChange={(e) => onChange({ ...data, contentStrategy: e.target.value })}
            placeholder="规划内容创作的方向、风格和发布节奏"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">媒体策略</label>
          <textarea
            value={data.mediaStrategy || ''}
            onChange={(e) => onChange({ ...data, mediaStrategy: e.target.value })}
            placeholder="规划媒体渠道的选择和投放策略"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-red-50 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <p className="font-medium">提示</p>
            <p className="mt-1">恭喜完成所有步骤！您可以导出简报或策略文档，也可以返回修改任何步骤。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StrategyStep
