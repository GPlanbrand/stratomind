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
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
          <Lightbulb className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">创意策略</h2>
          <p className="text-sm text-white/60">制定品牌的整体策略和差异化方向</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">整体策略</label>
          <textarea
            value={data.overallStrategy || ''}
            onChange={(e) => onChange({ ...data, overallStrategy: e.target.value })}
            placeholder="描述品牌的整体战略方向和核心主张"
            rows={4}
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-red-400 focus:ring-2 focus:ring-red-400/30 outline-none transition-all resize-none text-white placeholder-white/40 backdrop-blur"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">差异化定位</label>
          <textarea
            value={data.differentiation || ''}
            onChange={(e) => onChange({ ...data, differentiation: e.target.value })}
            placeholder="说明品牌与竞品的差异化优势和独特卖点"
            rows={4}
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-red-400 focus:ring-2 focus:ring-red-400/30 outline-none transition-all resize-none text-white placeholder-white/40 backdrop-blur"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">内容策略</label>
          <textarea
            value={data.contentStrategy || ''}
            onChange={(e) => onChange({ ...data, contentStrategy: e.target.value })}
            placeholder="规划内容创作的方向、风格和发布节奏"
            rows={4}
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-red-400 focus:ring-2 focus:ring-red-400/30 outline-none transition-all resize-none text-white placeholder-white/40 backdrop-blur"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">媒体策略</label>
          <textarea
            value={data.mediaStrategy || ''}
            onChange={(e) => onChange({ ...data, mediaStrategy: e.target.value })}
            placeholder="规划媒体渠道的选择和投放策略"
            rows={4}
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-red-400 focus:ring-2 focus:ring-red-400/30 outline-none transition-all resize-none text-white placeholder-white/40 backdrop-blur"
          />
        </div>
      </div>

      <div className="mt-8 p-5 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-2xl border border-red-500/30 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-red-300" />
          </div>
          <div className="text-sm text-red-100">
            <p className="font-semibold text-red-200">🎉 恭喜完成！</p>
            <p className="mt-2 text-white/80">您已完所有步骤！可以导出简报或策略文档，也可以返回修改任何步骤。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StrategyStep
