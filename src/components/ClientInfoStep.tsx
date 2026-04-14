import React from 'react'
import { Building2, Sparkles } from 'lucide-react'
import { ClientInfo } from '../types'

interface Props {
  data: Partial<ClientInfo>
  onChange: (data: Partial<ClientInfo>) => void
}

const ClientInfoStep: React.FC<Props> = ({ data, onChange }) => {
  const industries = [
    '科技/互联网', '金融/银行', '消费品/零售', '医疗健康', 
    '教育培训', '房地产/建筑', '制造业', '媒体/娱乐', '其他'
  ]

  const companySizes = ['初创期(1-50人)', '成长期(50-200人)', '成熟期(200-1000人)', '大型企业(1000人以上)']

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">客户背景信息</h2>
          <p className="text-sm text-gray-500">输入客户公司的基本信息</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            公司名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.companyName || ''}
            onChange={(e) => onChange({ ...data, companyName: e.target.value })}
            placeholder="请输入公司全称"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">所属行业</label>
            <select
              value={data.industry || ''}
              onChange={(e) => onChange({ ...data, industry: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            >
              <option value="">请选择行业</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">公司规模</label>
            <select
              value={data.companySize || ''}
              onChange={(e) => onChange({ ...data, companySize: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            >
              <option value="">请选择规模</option>
              {companySizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">公司描述</label>
          <textarea
            value={data.description || ''}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="简要描述公司业务、产品或服务"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">目标市场</label>
          <input
            type="text"
            value={data.targetMarket || ''}
            onChange={(e) => onChange({ ...data, targetMarket: e.target.value })}
            placeholder="描述您的目标市场区域或人群"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">核心产品/服务</label>
          <input
            type="text"
            value={data.keyProducts?.join('、') || ''}
            onChange={(e) => onChange({ ...data, keyProducts: e.target.value.split('、').filter(Boolean) })}
            placeholder="输入主要产品或服务，用顿号分隔"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">品牌定位</label>
          <textarea
            value={data.brandPosition || ''}
            onChange={(e) => onChange({ ...data, brandPosition: e.target.value })}
            placeholder="描述品牌在市场中的独特定位"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-purple-50 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-700">
            <p className="font-medium">提示</p>
            <p className="mt-1">详细的公司背景信息有助于后续制定更精准的品牌策略。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientInfoStep
