import React from 'react'
import { Target } from 'lucide-react'
import { Requirements } from '../types'

interface Props {
  data: Partial<Requirements>
  onChange: (data: Partial<Requirements>) => void
}

const RequirementsStep: React.FC<Props> = ({ data, onChange }) => {
  const serviceTypes = ['年度全案', '单项campaign', '专项服务']
  const budgets = ['10万以下', '10-30万', '30-60万', '60-100万', '100万以上']
  const timelines = ['1个月内', '1-3个月', '3-6个月', '6-12个月', '12个月以上']
  const channels = ['社交媒体', '搜索引擎', '短视频平台', '传统媒体', '户外广告', 'KOL/KOC合作', '电商直播', '线下活动']

  return (
    <div className="max-w-2xl mx-auto px-0 sm:px-4">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">项目需求</h2>
        </div>
        <p className="text-gray-500 text-xs sm:text-sm">明确项目的核心需求和目标</p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* 服务类型和预算 - 移动端堆叠 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">服务类型</label>
            <select
              value={data.projectType || ''}
              onChange={(e) => onChange({ ...data, projectType: e.target.value })}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-h-[44px]"
            >
              <option value="">请选择服务类型</option>
              {serviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">预算范围</label>
            <select
              value={data.budget || ''}
              onChange={(e) => onChange({ ...data, budget: e.target.value })}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-h-[44px]"
            >
              <option value="">请选择预算范围</option>
              {budgets.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 时间节点 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">时间节点</label>
          <select
            value={data.timeline || ''}
            onChange={(e) => onChange({ ...data, timeline: e.target.value })}
            className="w-full px-3 py-2.5 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-h-[44px]"
          >
            <option value="">请选择项目周期</option>
            {timelines.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* 项目目标 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">项目目标</label>
          <textarea
            value={data.keyMessage || ''}
            onChange={(e) => onChange({ ...data, keyMessage: e.target.value })}
            placeholder="描述项目的核心目标和预期成果"
            rows={3}
            className="w-full px-3 py-2.5 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white min-h-[80px]"
          />
        </div>

        {/* 核心KPI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">核心KPI</label>
          <textarea
            value={data.targetAudience || ''}
            onChange={(e) => onChange({ ...data, targetAudience: e.target.value })}
            placeholder="列出需要考核的核心指标，如：曝光量、点击率、转化率、销售额等"
            rows={2}
            className="w-full px-3 py-2.5 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white min-h-[60px]"
          />
        </div>

        {/* 主要传播渠道 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">主要传播渠道</label>
          <div className="flex flex-wrap gap-2">
            {channels.map(channel => (
              <button
                key={channel}
                onClick={() => {
                  const currentChannels = (data as any).channels || []
                  const newChannels = currentChannels.includes(channel)
                    ? currentChannels.filter((c: string) => c !== channel)
                    : [...currentChannels, channel]
                  onChange({ ...data, channels: newChannels } as any)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[36px] sm:min-h-[auto] ${
                  (data as any).channels?.includes(channel)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {channel}
              </button>
            ))}
          </div>
        </div>

        {/* 品牌挑战 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌挑战</label>
          <textarea
            value={data.brandChallenge || ''}
            onChange={(e) => onChange({ ...data, brandChallenge: e.target.value })}
            placeholder="描述当前面临的主要挑战和难点"
            rows={2}
            className="w-full px-3 py-2.5 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white min-h-[60px]"
          />
        </div>
      </div>
    </div>
  )
}

export default RequirementsStep
