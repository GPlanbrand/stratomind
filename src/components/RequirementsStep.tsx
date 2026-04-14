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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">项目需求</h2>
          <p className="text-sm text-gray-500">明确项目的核心需求和目标</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">项目类型</label>
            <select
              value={data.projectType || ''}
              onChange={(e) => onChange({ ...data, projectType: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            >
              <option value="">请选择类型</option>
              {projectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">预算范围</label>
            <select
              value={data.budget || ''}
              onChange={(e) => onChange({ ...data, budget: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            >
              <option value="">请选择预算</option>
              {budgets.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">项目周期</label>
          <select
            value={data.timeline || ''}
            onChange={(e) => onChange({ ...data, timeline: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          >
            <option value="">请选择周期</option>
            {timelines.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">目标受众</label>
          <textarea
            value={data.targetAudience || ''}
            onChange={(e) => onChange({ ...data, targetAudience: e.target.value })}
            placeholder="描述目标人群的特征：年龄、职业、消费习惯等"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">核心信息</label>
          <textarea
            value={data.keyMessage || ''}
            onChange={(e) => onChange({ ...data, keyMessage: e.target.value })}
            placeholder="品牌需要传达给受众的核心信息是什么"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">预期交付物</label>
          <input
            type="text"
            value={data.deliverables?.join('、') || ''}
            onChange={(e) => onChange({ ...data, deliverables: e.target.value.split('、').filter(Boolean) })}
            placeholder="如：品牌手册、VI设计、营销方案等，用顿号分隔"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">品牌调性</label>
          <div className="flex flex-wrap gap-2">
            {tones.map(tone => (
              <button
                key={tone}
                onClick={() => onChange({ ...data, tone })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  data.tone === tone
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">提示</p>
            <p className="mt-1">清晰的需求描述有助于AI更准确地生成创意策略。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequirementsStep
