import React, { useState } from 'react'
import { Target, ChevronDown, ChevronUp } from 'lucide-react'
import { Requirements } from '../types'

interface Props {
  data: Partial<Requirements>
  onChange: (data: Partial<Requirements>) => void
}

const RequirementsStep: React.FC<Props> = ({ data, onChange }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    businessGoals: true,
    targetAudience: false,
    communicationStrategy: false,
    creativeRequirements: false,
    timeline: false
  })

  // 选项数据
  const projectTypes = ['品牌建设', '产品推广', '活动策划', '整合营销', '数字营销', '其他']
  const serviceTypes = ['年度全案', '单项Campaign', '专项服务', '长期代理']
  const projectCycles = ['1个月内', '1-3个月', '3-6个月', '6-12个月', '12个月以上']
  const budgets = ['10万以下', '10-30万', '30-60万', '60-100万', '100-300万', '300万以上']
  const primaryChannelsOptions = ['社交媒体', '搜索引擎', '短视频平台', '传统媒体', '户外广告', 'KOL/KOC合作', '电商直播', '线下活动', '私域运营']
  const secondaryChannelsOptions = ['微博', '微信', '抖音', '小红书', 'B站', '知乎', '今日头条', '百度', '分众传媒', '地方电视台', '行业媒体']
  const deliverablesOptions = ['品牌策略报告', '创意设计方案', '视频广告片', '社交内容素材', 'KV主视觉', '线下活动物料', '媒介投放方案', '效果追踪报告']

  // 切换分组展开/收起
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // 渲染折叠分组
  const renderCollapsibleSection = (key: string, title: string, required: boolean, children: React.ReactNode, tips?: string) => (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => toggleSection(key)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800">{title}</span>
          {required && <span className="text-red-500 text-sm">*</span>}
        </div>
        {expandedSections[key] ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {expandedSections[key] && (
        <div className="p-4 space-y-4">
          {children}
          {tips && <p className="text-xs text-gray-500 mt-2 pl-1">{tips}</p>}
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">项目需求</h2>
        </div>
        <p className="text-gray-500 text-xs sm:text-sm">按4A广告公司标准明确项目核心需求和目标</p>
      </div>

      <div className="space-y-4">
        {/* 项目基础信息 - 始终展开 */}
        {renderCollapsibleSection('basicInfo', '项目基础信息', true, (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                项目名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.projectName || ''}
                onChange={(e) => onChange({ ...data, projectName: e.target.value })}
                placeholder="请输入项目名称"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">项目类型</label>
                <select
                  value={data.projectType || ''}
                  onChange={(e) => onChange({ ...data, projectType: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">请选择项目类型</option>
                  {projectTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">服务类型</label>
                <select
                  value={data.serviceType || ''}
                  onChange={(e) => onChange({ ...data, serviceType: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">请选择服务类型</option>
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">项目周期</label>
                <select
                  value={data.projectCycle || ''}
                  onChange={(e) => onChange({ ...data, projectCycle: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">请选择项目周期</option>
                  {projectCycles.map(cycle => (
                    <option key={cycle} value={cycle}>{cycle}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">预算范围</label>
                <select
                  value={data.budgetRange || ''}
                  onChange={(e) => onChange({ ...data, budgetRange: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">请选择预算范围</option>
                  {budgets.map(budget => (
                    <option key={budget} value={budget}>{budget}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ))}

        {/* 商业目标 */}
        {renderCollapsibleSection('businessGoals', '商业目标', true, (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                商业目标 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={data.businessGoal || ''}
                onChange={(e) => onChange({ ...data, businessGoal: e.target.value })}
                placeholder="如：提升销量20%、扩大市场份额、增加新用户注册"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌目标</label>
              <textarea
                value={data.brandGoal || ''}
                onChange={(e) => onChange({ ...data, brandGoal: e.target.value })}
                placeholder="如：提升品牌知名度至80%、建立品牌美誉度、改善品牌形象"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">传播目标</label>
              <textarea
                value={data.communicationGoal || ''}
                onChange={(e) => onChange({ ...data, communicationGoal: e.target.value })}
                placeholder="如：曝光量1000万+、互动率5%+、话题讨论量50万+"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                核心KPI指标 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={data.coreKPI || ''}
                onChange={(e) => onChange({ ...data, coreKPI: e.target.value })}
                placeholder="列出需要考核的核心指标及目标值"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </>
        ), '明确可量化的KPI有助于效果追踪和项目评估')}

        {/* 目标人群 */}
        {renderCollapsibleSection('targetAudience', '目标人群', false, (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">核心人群画像</label>
              <textarea
                value={data.targetPersona || ''}
                onChange={(e) => onChange({ ...data, targetPersona: e.target.value })}
                placeholder="描述目标人群特征：年龄、性别、职业、收入、兴趣等"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">人群触媒习惯</label>
              <textarea
                value={data.mediaHabits || ''}
                onChange={(e) => onChange({ ...data, mediaHabits: e.target.value })}
                placeholder="描述目标人群的媒体使用习惯：如高频使用抖音、小红书，偏好短视频内容"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">消费决策路径</label>
              <textarea
                value={data.decisionJourney || ''}
                onChange={(e) => onChange({ ...data, decisionJourney: e.target.value })}
                placeholder="描述消费者从认知到购买的决策过程"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </>
        ), '精准的人群洞察是创意策略的基础')}

        {/* 传播策略 */}
        {renderCollapsibleSection('communicationStrategy', '传播策略', false, (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">核心传播信息</label>
              <textarea
                value={data.coreMessage || ''}
                onChange={(e) => onChange({ ...data, coreMessage: e.target.value })}
                placeholder="本次传播的核心信息和主张"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">传播调性</label>
              <textarea
                value={data.communicationTone || ''}
                onChange={(e) => onChange({ ...data, communicationTone: e.target.value })}
                placeholder="如：年轻活力、专业权威、温暖亲切、幽默有趣"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">主要传播渠道</label>
              <div className="flex flex-wrap gap-2">
                {primaryChannelsOptions.map(channel => (
                  <button
                    key={channel}
                    onClick={() => {
                      const current = data.primaryChannels || []
                      const newChannels = current.includes(channel)
                        ? current.filter(c => c !== channel)
                        : [...current, channel]
                      onChange({ ...data, primaryChannels: newChannels })
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      data.primaryChannels?.includes(channel)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">次要传播渠道</label>
              <div className="flex flex-wrap gap-2">
                {secondaryChannelsOptions.map(channel => (
                  <button
                    key={channel}
                    onClick={() => {
                      const current = data.secondaryChannels || []
                      const newChannels = current.includes(channel)
                        ? current.filter(c => c !== channel)
                        : [...current, channel]
                      onChange({ ...data, secondaryChannels: newChannels })
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      data.secondaryChannels?.includes(channel)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>
          </>
        ), '合理选择渠道可提升传播效率和控制成本')}

        {/* 创意要求 */}
        {renderCollapsibleSection('creativeRequirements', '创意要求', false, (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">创意方向偏好</label>
              <textarea
                value={data.creativeDirection || ''}
                onChange={(e) => onChange({ ...data, creativeDirection: e.target.value })}
                placeholder="描述期望的创意风格、方向或禁忌"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">参考案例</label>
              <textarea
                value={data.referenceCases || ''}
                onChange={(e) => onChange({ ...data, referenceCases: e.target.value })}
                placeholder="列出喜欢的品牌案例或参考作品"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">禁忌事项</label>
              <textarea
                value={data.taboos || ''}
                onChange={(e) => onChange({ ...data, taboos: e.target.value })}
                placeholder="明确需要避免的元素、风格或话题"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">期望交付物</label>
              <div className="flex flex-wrap gap-2">
                {deliverablesOptions.map(item => (
                  <button
                    key={item}
                    onClick={() => {
                      const current = data.deliverables || []
                      const newDeliverables = current.includes(item)
                        ? current.filter(d => d !== item)
                        : [...current, item]
                      onChange({ ...data, deliverables: newDeliverables })
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      data.deliverables?.includes(item)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </>
        ), '明确的创意边界有助于快速产出符合预期的作品')}

        {/* 时间节奏 */}
        {renderCollapsibleSection('timeline', '时间节奏', false, (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">关键时间节点</label>
              <textarea
                value={data.keyMilestones || ''}
                onChange={(e) => onChange({ ...data, keyMilestones: e.target.value })}
                placeholder="列出项目各阶段的关键截止时间"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">里程碑事件</label>
              <textarea
                value={data.milestoneEvents || ''}
                onChange={(e) => onChange({ ...data, milestoneEvents: e.target.value })}
                placeholder="如：产品发布会、电商大促、品牌周年庆等"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </>
        ), '合理规划时间节奏可确保项目顺利推进')}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">💡 4A标准提示</p>
            <p>完整的项目需求信息是产出高质量创意简报的基础。建议重点填写商业目标、核心KPI和传播策略部分，这些将直接影响创意方向和策略制定。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequirementsStep
