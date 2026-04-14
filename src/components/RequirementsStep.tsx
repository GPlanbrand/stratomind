import React from 'react'
import { Target, Sparkles } from 'lucide-react'
import { Requirements } from '../types'

interface Props {
  data: Partial<Requirements>
  onChange: (data: Partial<Requirements>) => void
}

const RequirementsStep: React.FC<Props> = ({ data, onChange }) => {
  const projectTypes = [
    '品牌定位', '品牌设计', '品牌推广', '品牌升级', 
    '营销策划', '活动策划', '内容营销', '全案策划'
  ]

  const budgets = ['5万以下', '5-15万', '15-30万', '30-50万', '50万以上']
  const timelines = ['1个月内', '1-3个月', '3-6个月', '6个月以上']
  const tones = ['专业严谨', '活泼年轻', '高端奢华', '简约自然', '幽默风趣', '温暖亲切']

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
          <Target className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">项目需求</h2>
          <p className="text-sm text-white/60">明确项目的核心需求和目标</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">项目类型</label>
            <select
              value={data.projectType || ''}
              onChange={(e) => onChange({ ...data, projectType: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none transition-all text-white backdrop-blur"
            >
              <option value="" className="bg-gray-800">请选择类型</option>
              {projectTypes.map(type => (
                <option key={type} value={type} className="bg-gray-800">{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">预算范围</label>
            <select
              value={data.budget || ''}
              onChange={(e) => onChange({ ...data, budget: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none transition-all text-white backdrop-blur"
            >
              <option value="" className="bg-gray-800">请选择预算</option>
              {budgets.map(b => (
                <option key={b} value={b} className="bg-gray-800">{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">项目周期</label>
          <select
            value={data.timeline || ''}
            onChange={(e) => onChange({ ...data, timeline: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none transition-all text-white backdrop-blur"
          >
            <option value="" className="bg-gray-800">请选择周期</option>
            {timelines.map(t => (
              <option key={t} value={t} className="bg-gray-800">{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">目标受众</label>
          <textarea
            value={data.targetAudience || ''}
            onChange={(e) => onChange({ ...data, targetAudience: e.target.value })}
            placeholder="描述目标人群的特征：年龄、职业、消费习惯等"
            rows={3}
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none transition-all resize-none text-white placeholder-white/40 backdrop-blur"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">核心信息</label>
          <textarea
            value={data.keyMessage || ''}
            onChange={(e) => onChange({ ...data, keyMessage: e.target.value })}
            placeholder="品牌需要传达给受众的核心信息是什么"
            rows={3}
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none transition-all resize-none text-white placeholder-white/40 backdrop-blur"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">预期交付物</label>
          <input
            type="text"
            value={data.deliverables?.join('、') || ''}
            onChange={(e) => onChange({ ...data, deliverables: e.target.value.split('、').filter(Boolean) })}
            placeholder="如：品牌手册、VI设计、营销方案等，用顿号分隔"
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none transition-all text-white placeholder-white/40 backdrop-blur"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">品牌调性</label>
          <div className="flex flex-wrap gap-3">
            {tones.map(tone => (
              <button
                key={tone}
                onClick={() => onChange({ ...data, tone })}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  data.tone === tone
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-5 bg-blue-500/20 rounded-2xl border border-blue-500/30 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-blue-300" />
          </div>
          <div className="text-sm text-blue-100">
            <p className="font-semibold text-blue-200">💡 提示</p>
            <p className="mt-2 text-white/80">清晰的需求描述有助于AI更准确地生成创意策略。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequirementsStep
