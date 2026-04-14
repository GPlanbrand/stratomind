import React from 'react'
import { Lightbulb, Wand2, Copy } from 'lucide-react'
import { Strategy } from '../types'

interface Props {
  data: Partial<Strategy>
  onChange: (data: Partial<Strategy>) => void
}

const StrategyStep: React.FC<Props> = ({ data, onChange }) => {
  const copyPrompt = () => {
    const prompt = `品牌策略分析任务：
核心策略主张：${data.overallStrategy || ''}
传播主轴：${data.differentiation || ''}
创意方向：${data.contentStrategy || ''}
执行建议：${data.mediaStrategy || ''}`
    navigator.clipboard.writeText(prompt)
    alert('Prompt已复制到剪贴板')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">创意策略</h2>
        </div>
        <p className="text-gray-500 text-sm">制定品牌的整体策略和差异化方向</p>
      </div>

      <div className="space-y-5">
        {/* 核心策略主张 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">核心策略主张</label>
          <textarea
            value={data.overallStrategy || ''}
            onChange={(e) => onChange({ ...data, overallStrategy: e.target.value })}
            placeholder="品牌最核心的价值主张是什么？希望传达给消费者什么样的信息？"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 传播主轴 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">传播主轴</label>
          <textarea
            value={data.differentiation || ''}
            onChange={(e) => onChange({ ...data, differentiation: e.target.value })}
            placeholder="贯穿整个传播活动的主线是什么？如何保持信息的一致性？"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 创意方向 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">创意方向</label>
          <textarea
            value={data.contentStrategy || ''}
            onChange={(e) => onChange({ ...data, contentStrategy: e.target.value })}
            placeholder="创意表现的风格、调性、视觉语言等有什么要求？"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 执行建议 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">执行建议</label>
          <textarea
            value={data.mediaStrategy || ''}
            onChange={(e) => onChange({ ...data, mediaStrategy: e.target.value })}
            placeholder="在执行层面有什么特别的建议或注意事项？"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Prompt生成 */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">生成Prompt</label>
            <button
              onClick={copyPrompt}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Copy className="w-4 h-4" />
              复制
            </button>
          </div>
          <div className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-200">
            {data.overallStrategy || data.differentiation || data.contentStrategy || data.mediaStrategy 
              ? `${data.overallStrategy || ''}\n\n${data.differentiation || ''}\n\n${data.contentStrategy || ''}\n\n${data.mediaStrategy || ''}`
              : '填写上方内容后将自动生成可复制的Prompt'}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Wand2 className="w-4 h-4" />
            AI生成策略
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-sm text-green-800">
            <p className="font-medium">🎉 恭喜完成！</p>
            <p className="mt-1 text-green-700">您已完成所有步骤！可以导出简报或策略文档，也可以返回修改任何步骤。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StrategyStep
