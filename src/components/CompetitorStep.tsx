import React, { useState } from 'react'
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">竞品分析</h2>
          <p className="text-sm text-gray-500">分析主要竞争对手的市场表现</p>
        </div>
      </div>

      {data.competitors.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">还没有添加竞品</p>
          <button
            onClick={addCompetitor}
            className="px-6 py-3 bg-green-100 text-green-600 rounded-xl font-medium hover:bg-green-200 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            添加竞品
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.competitors.map((competitor, index) => (
            <div key={competitor.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">竞品 {index + 1}</h3>
                <button
                  onClick={() => removeCompetitor(competitor.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">竞品名称</label>
                  <input
                    type="text"
                    value={competitor.name}
                    onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                    placeholder="输入竞品公司/品牌名称"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">品牌定位</label>
                  <input
                    type="text"
                    value={competitor.brandPositioning}
                    onChange={(e) => updateCompetitor(competitor.id, 'brandPositioning', e.target.value)}
                    placeholder="描述竞品的品牌定位"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">视觉风格</label>
                    <input
                      type="text"
                      value={competitor.visualStyle}
                      onChange={(e) => updateCompetitor(competitor.id, 'visualStyle', e.target.value)}
                      placeholder="如：简约、科技感"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">市场份额</label>
                    <input
                      type="text"
                      value={competitor.marketShare}
                      onChange={(e) => updateCompetitor(competitor.id, 'marketShare', e.target.value)}
                      placeholder="如：20%"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">目标受众</label>
                  <input
                    type="text"
                    value={competitor.targetAudience}
                    onChange={(e) => updateCompetitor(competitor.id, 'targetAudience', e.target.value)}
                    placeholder="描述竞品的目标用户群体"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">优势</label>
                  <input
                    type="text"
                    value={competitor.strengths?.join('、') || ''}
                    onChange={(e) => updateCompetitor(competitor.id, 'strengths', e.target.value.split('、').filter(Boolean))}
                    placeholder="竞品的优势，用顿号分隔"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">劣势</label>
                  <input
                    type="text"
                    value={competitor.weaknesses?.join('、') || ''}
                    onChange={(e) => updateCompetitor(competitor.id, 'weaknesses', e.target.value.split('、').filter(Boolean))}
                    placeholder="竞品的劣势，用顿号分隔"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addCompetitor}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            添加更多竞品
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-green-50 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-700">
            <p className="font-medium">提示</p>
            <p className="mt-1">建议分析2-4个主要竞品，过于分散的分析会影响策略的聚焦性。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompetitorStep
