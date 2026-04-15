import React from 'react'
import { Building2, Lightbulb } from 'lucide-react'
import { ClientInfo } from '../types'

interface Props {
  data: Partial<ClientInfo>
  onChange: (data: Partial<ClientInfo>) => void
}

const ClientInfoStep: React.FC<Props> = ({ data, onChange }) => {
  const industries = [
    '科技/互联网', '金融/银行', '消费品/零售', '医疗健康', 
    '教育培训', '房地产/建筑', '制造业', '媒体/娱乐', '汽车/出行', '其他'
  ]

  const companySizes = ['初创期(1-50人)', '成长期(50-200人)', '成熟期(200-1000人)', '大型企业(1000人以上)']

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">客户背景</h2>
        </div>
        <p className="text-gray-500 text-sm">输入客户公司的基本信息</p>
      </div>

      <div className="space-y-5">
        {/* 客户名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            客户名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.companyName || ''}
            onChange={(e) => onChange({ ...data, companyName: e.target.value })}
            placeholder="请输入客户/公司全称"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        {/* 行业和规模 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">所属行业</label>
            <select
              value={data.industry || ''}
              onChange={(e) => onChange({ ...data, industry: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">请选择行业</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">公司规模</label>
            <select
              value={data.companySize || ''}
              onChange={(e) => onChange({ ...data, companySize: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">请选择规模</option>
              {companySizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 公司描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">公司描述</label>
          <textarea
            value={data.description || ''}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="简要描述公司业务、发展历程、市场地位等"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 目标市场 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">目标市场</label>
          <input
            type="text"
            value={data.targetMarket || ''}
            onChange={(e) => onChange({ ...data, targetMarket: e.target.value })}
            placeholder="描述目标市场区域、人群特征或市场份额"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        {/* 核心产品 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">核心产品/服务</label>
          <input
            type="text"
            value={data.keyProducts?.join('、') || ''}
            onChange={(e) => onChange({ ...data, keyProducts: e.target.value.split('、').filter(Boolean) })}
            placeholder="输入主要产品或服务，用顿号分隔"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        {/* 品牌定位 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌定位</label>
          <textarea
            value={data.brandPosition || ''}
            onChange={(e) => onChange({ ...data, brandPosition: e.target.value })}
            placeholder="描述品牌在市场中的独特定位、核心价值主张"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">💡 提示</p>
            <p>详细的公司背景信息有助于后续制定更精准的品牌策略。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientInfoStep
