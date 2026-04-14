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
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">客户背景信息</h2>
          <p className="text-sm text-white/60">输入客户公司的基本信息</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            公司名称 <span className="text-pink-400">*</span>
          </label>
          <input
            type="text"
            value={data.companyName || ''}
            onChange={(e) => onChange({ ...data, companyName: e.target.value })}
            placeholder="请输入公司全称"
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 outline-none transition-all text-white placeholder-white/40 backdrop-blur"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">所属行业</label>
            <select
              value={data.industry || ''}
              onChange={(e) => onChange({ ...data, industry: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 outline-none transition-all text-white backdrop-blur"
            >
              <option value="" className="bg-gray-800">请选择行业</option>
              {industries.map(ind => (
                <option key={ind} value={ind} className="bg-gray-800">{ind}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">公司规模</label>
            <select
              value={data.companySize || ''}
              onChange={(e) => onChange({ ...data, companySize: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 outline-none transition-all text-white backdrop-blur"
            >
              <option value="" className="bg-gray-800">请选择规模</option>
              {companySizes.map(size => (
                <option key={size} value={size} className="bg-gray-800">{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">公司描述</label>
          <textarea
            value={data.description || ''}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="简要描述公司业务、产品或服务"
            rows={4}
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 outline-none transition-all resize-none text-white placeholder-white/40 backdrop-blur"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">目标市场</label>
          <input
            type="text"
            value={data.targetMarket || ''}
            onChange={(e) => onChange({ ...data, targetMarket: e.target.value })}
            placeholder="描述您的目标市场区域或人群"
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 outline-none transition-all text-white placeholder-white/40 backdrop-blur"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">核心产品/服务</label>
          <input
            type="text"
            value={data.keyProducts?.join('、') || ''}
            onChange={(e) => onChange({ ...data, keyProducts: e.target.value.split('、').filter(Boolean) })}
            placeholder="输入主要产品或服务，用顿号分隔"
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 outline-none transition-all text-white placeholder-white/40 backdrop-blur"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">品牌定位</label>
          <textarea
            value={data.brandPosition || ''}
            onChange={(e) => onChange({ ...data, brandPosition: e.target.value })}
            placeholder="描述品牌在市场中的独特定位"
            rows={3}
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 outline-none transition-all resize-none text-white placeholder-white/40 backdrop-blur"
          />
        </div>
      </div>

      <div className="mt-8 p-5 bg-purple-500/20 rounded-2xl border border-purple-500/30 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>
          <div className="text-sm text-purple-100">
            <p className="font-semibold text-purple-200">💡 提示</p>
            <p className="mt-2 text-white/80">详细的公司背景信息有助于后续制定更精准的品牌策略。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientInfoStep
