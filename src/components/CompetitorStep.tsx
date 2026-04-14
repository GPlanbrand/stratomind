import React from 'react'
import { Users, Plus, Trash2, Sparkles } from 'lucide-react'
import { Competitor } from '../types'

interface Props {
  data: { competitors: Competitor[] }
  onChange: (data: { competitors: Competitor[] }) => void
}

const CompetitorStep: React.FC<Props> = ({ data, onChange }) => {
  const addCompetitor = () => {
    const newCompetitor: Competitor = {
      id: Date.now().toString(),
      name: '',
      brandPositioning: '',
      visualStyle: '',
      targetAudience: '',
      strengths: [],
      weaknesses: [],
      marketShare: ''
    }
    onChange({ competitors: [...data.competitors, newCompetitor] })
  }

  const updateCompetitor = (id: string, field: keyof Competitor, value: any) => {
    onChange({
      competitors: data.competitors.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    })
  }

  const removeCompetitor = (id: string) => {
    onChange({ competitors: data.competitors.filter(c => c.id !== id) })
  }

  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-xl animate-pulse-glow">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-green-500/50 to-emerald-500/50 rounded-2xl blur-lg -z-10"></div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">竞品分析</h2>
          <p className="text-sm text-white/60">分析主要竞争对手的市场表现</p>
        </div>
      </div>

      {data.competitors.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10">
              <Users className="w-12 h-12 text-white/60" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-xl -z-10"></div>
          </div>
          <p className="text-white/60 mb-6 text-lg">还没有添加竞品</p>
          <button
            onClick={addCompetitor}
            className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 mx-auto btn-press btn-shine hover-glow-green"
          >
            <Plus className="w-5 h-5" />
            <span className="text-lg">添加竞品</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.competitors.map((competitor, index) => (
            <div key={competitor.id} className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/15 backdrop-blur-xl hover:border-green-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg text-white flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center text-sm font-bold border border-green-500/30">{index + 1}</span>
                  竞品信息
                </h3>
                <button
                  onClick={() => removeCompetitor(competitor.id)}
                  className="p-2.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">竞品名称</label>
                  <input
                    type="text"
                    value={competitor.name}
                    onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                    placeholder="输入竞品公司/品牌名称"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-400/30 outline-none transition-all text-white placeholder-white/40 input-glow-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">品牌定位</label>
                  <input
                    type="text"
                    value={competitor.brandPositioning}
                    onChange={(e) => updateCompetitor(competitor.id, 'brandPositioning', e.target.value)}
                    placeholder="描述竞品的品牌定位"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-400/30 outline-none transition-all text-white placeholder-white/40 input-glow-green"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">视觉风格</label>
                    <input
                      type="text"
                      value={competitor.visualStyle}
                      onChange={(e) => updateCompetitor(competitor.id, 'visualStyle', e.target.value)}
                      placeholder="如：简约、科技感"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-400/30 outline-none transition-all text-white placeholder-white/40 input-glow-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">市场份额</label>
                    <input
                      type="text"
                      value={competitor.marketShare}
                      onChange={(e) => updateCompetitor(competitor.id, 'marketShare', e.target.value)}
                      placeholder="如：20%"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-400/30 outline-none transition-all text-white placeholder-white/40 input-glow-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">目标受众</label>
                  <input
                    type="text"
                    value={competitor.targetAudience}
                    onChange={(e) => updateCompetitor(competitor.id, 'targetAudience', e.target.value)}
                    placeholder="描述竞品的目标用户群体"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-400/30 outline-none transition-all text-white placeholder-white/40 input-glow-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">优势</label>
                  <input
                    type="text"
                    value={competitor.strengths?.join('、') || ''}
                    onChange={(e) => updateCompetitor(competitor.id, 'strengths', e.target.value.split('、').filter(Boolean))}
                    placeholder="竞品的优势，用顿号分隔"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-400/30 outline-none transition-all text-white placeholder-white/40 input-glow-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">劣势</label>
                  <input
                    type="text"
                    value={competitor.weaknesses?.join('、') || ''}
                    onChange={(e) => updateCompetitor(competitor.id, 'weaknesses', e.target.value.split('、').filter(Boolean))}
                    placeholder="竞品的劣势，用顿号分隔"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-400/30 outline-none transition-all text-white placeholder-white/40 input-glow-green"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addCompetitor}
            className="w-full py-4 border-2 border-dashed border-white/20 hover:border-green-400/50 rounded-xl text-white/60 hover:text-green-400 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur hover-glow-green"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">添加更多竞品</span>
          </button>
        </div>
      )}

      {/* 提示卡片 */}
      <div className="mt-8 p-5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-green-300" />
          </div>
          <div className="text-sm text-green-100">
            <p className="font-semibold text-green-200">💡 提示</p>
            <p className="mt-2 text-white/80">建议分析2-4个主要竞品，过于分散的分析会影响策略的聚焦性。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompetitorStep
