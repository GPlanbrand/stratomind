import React, { useState, useRef } from 'react'
import { Building2, Lightbulb, Upload, X, FileText, Image, Archive, ChevronDown, ChevronUp } from 'lucide-react'
import { ClientInfo, ClientAttachment } from '../types'

interface Props {
  data: Partial<ClientInfo>
  onChange: (data: Partial<ClientInfo>) => void
}

const ClientInfoStep: React.FC<Props> = ({ data, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<ClientAttachment[]>(data.attachments || [])
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    brandAssets: false,
    businessOverview: false,
    channels: false,
    marketingHistory: false
  })

  // 选项数据
  const industries = [
    '餐饮/食品', '零售/快消', '医疗/健康', '政务/政企',
    '文旅/文创', '教育/培训', '工业/制造', '商务/服务', '空间/环境', '其他'
  ]
  const companySizes = ['初创期(1-50人)', '成长期(50-200人)', '成熟期(200-1000人)', '大型企业(1000人以上)']
  const companyNatures = ['国企', '民企', '外企', '合资', '上市公司', '其他']
  const salesChannelsOptions = ['线上电商', '线下直营', '线下加盟', '经销商分销', '商超渠道', 'OEM/ODM']
  const keyMarketsOptions = ['一线城市', '二线城市', '三四线城市', '县域市场', '乡镇市场', '海外市场']

  // 文件上传处理
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newAttachments: ClientAttachment[] = Array.from(files).map(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      let type: ClientAttachment['type'] = 'pdf'
      if (['pdf'].includes(ext)) type = 'pdf'
      else if (['doc', 'docx'].includes(ext)) type = 'word'
      else if (['ppt', 'pptx'].includes(ext)) type = 'ppt'
      else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) type = 'image'
      else if (['zip', 'rar', '7z'].includes(ext)) type = 'zip'

      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
    })

    const updatedAttachments = [...attachments, ...newAttachments]
    setAttachments(updatedAttachments)
    onChange({ ...data, attachments: updatedAttachments })
    
    // 清空input以允许重复上传相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 删除附件
  const handleRemoveAttachment = (id: string) => {
    const updatedAttachments = attachments.filter(a => a.id !== id)
    setAttachments(updatedAttachments)
    onChange({ ...data, attachments: updatedAttachments })
  }

  // 获取文件图标
  const getFileIcon = (type: ClientAttachment['type']) => {
    switch (type) {
      case 'pdf':
      case 'word':
      case 'ppt':
        return <FileText className="w-4 h-4 text-blue-600" />
      case 'image':
        return <Image className="w-4 h-4 text-green-600" />
      case 'zip':
        return <Archive className="w-4 h-4 text-yellow-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // 切换分组展开/收起
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // 渲染折叠分组
  const renderCollapsibleSection = (key: string, title: string, children: React.ReactNode) => (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => toggleSection(key)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-800">{title}</span>
        {expandedSections[key] ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {expandedSections[key] && (
        <div className="p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">客户背景</h2>
        </div>
        <p className="text-gray-500 text-xs sm:text-sm">按4A广告公司标准填写客户品牌信息</p>
      </div>

      {/* 资料上传区 - 左侧固定 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* 资料上传区 */}
        <div className="lg:col-span-1">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">客户资料上传</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">支持PDF、Word、PPT、图片、压缩包</p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar,.7z"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              选择文件
            </button>

            {/* 已上传文件列表 */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-gray-600">已上传文件 ({attachments.length})</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {attachments.map(attachment => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 group"
                    >
                      {getFileIcon(attachment.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 truncate" title={attachment.name}>
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="p-1 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 表单填写区 - 右侧 */}
        <div className="lg:col-span-3">
          {/* 必填信息 - 始终展开 */}
          <div className="border border-blue-200 rounded-xl overflow-hidden mb-4 bg-blue-50/30">
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
              <span className="font-medium text-blue-800">基本信息</span>
              <span className="ml-2 text-xs text-blue-600">（必填项）</span>
            </div>
            <div className="p-4 space-y-4">
              {/* 客户名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  客户名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.clientName || ''}
                  onChange={(e) => onChange({ ...data, clientName: e.target.value })}
                  placeholder="请输入客户公司全称"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>

              {/* 行业和性质 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">所属行业</label>
                  <select
                    value={data.industry || ''}
                    onChange={(e) => onChange({ ...data, industry: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">请选择行业</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">企业性质</label>
                  <select
                    value={data.companyNature || ''}
                    onChange={(e) => onChange({ ...data, companyNature: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">请选择企业性质</option>
                    {companyNatures.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 规模和成立时间 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">公司规模</label>
                  <select
                    value={data.companySize || ''}
                    onChange={(e) => onChange({ ...data, companySize: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">请选择规模</option>
                    {companySizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">成立时间</label>
                  <input
                    type="text"
                    value={data.establishedYear || ''}
                    onChange={(e) => onChange({ ...data, establishedYear: e.target.value })}
                    placeholder="如：2010年"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 品牌资产 */}
          {renderCollapsibleSection('brandAssets', '品牌资产', (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">主品牌/子品牌结构</label>
                <input
                  type="text"
                  value={data.brandStructure || ''}
                  onChange={(e) => onChange({ ...data, brandStructure: e.target.value })}
                  placeholder="描述品牌架构，如：母品牌+多个子品牌"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌历史与沿革</label>
                <textarea
                  value={data.brandHistory || ''}
                  onChange={(e) => onChange({ ...data, brandHistory: e.target.value })}
                  placeholder="简述品牌发展历程、重要里程碑"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌核心价值</label>
                <input
                  type="text"
                  value={data.coreValue || ''}
                  onChange={(e) => onChange({ ...data, coreValue: e.target.value })}
                  placeholder="品牌的核心价值主张和差异化定位"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌个性</label>
                <input
                  type="text"
                  value={data.brandPersonality || ''}
                  onChange={(e) => onChange({ ...data, brandPersonality: e.target.value })}
                  placeholder="如：年轻活力、高端专业、温暖亲和"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌口号/Slogan</label>
                <input
                  type="text"
                  value={data.brandSlogan || ''}
                  onChange={(e) => onChange({ ...data, brandSlogan: e.target.value })}
                  placeholder="品牌核心口号"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ))}

          {/* 业务概况 */}
          {renderCollapsibleSection('businessOverview', '业务概况', (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">主营业务描述</label>
                <textarea
                  value={data.mainBusiness || ''}
                  onChange={(e) => onChange({ ...data, mainBusiness: e.target.value })}
                  placeholder="描述公司主营业务和核心能力"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">核心产品/服务线</label>
                <input
                  type="text"
                  value={data.productLines?.join('、') || ''}
                  onChange={(e) => onChange({ ...data, productLines: e.target.value.split('、').filter(Boolean) })}
                  placeholder="输入主要产品/服务，用顿号分隔"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">目标市场区域</label>
                  <input
                    type="text"
                    value={data.targetMarkets || ''}
                    onChange={(e) => onChange({ ...data, targetMarkets: e.target.value })}
                    placeholder="如：全国市场、华东地区"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">市场份额/行业地位</label>
                  <input
                    type="text"
                    value={data.marketPosition || ''}
                    onChange={(e) => onChange({ ...data, marketPosition: e.target.value })}
                    placeholder="如：行业前三、细分市场领先"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">竞争优势</label>
                <textarea
                  value={data.competitiveAdvantage || ''}
                  onChange={(e) => onChange({ ...data, competitiveAdvantage: e.target.value })}
                  placeholder="描述与竞争对手相比的独特优势"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </>
          ))}

          {/* 渠道与终端 */}
          {renderCollapsibleSection('channels', '渠道与终端', (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">销售渠道</label>
                <div className="flex flex-wrap gap-2">
                  {salesChannelsOptions.map(channel => (
                    <button
                      key={channel}
                      onClick={() => {
                        const current = data.salesChannels || []
                        const newChannels = current.includes(channel)
                          ? current.filter(c => c !== channel)
                          : [...current, channel]
                        onChange({ ...data, salesChannels: newChannels })
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        data.salesChannels?.includes(channel)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">终端网点数量</label>
                  <input
                    type="text"
                    value={data.outletCount || ''}
                    onChange={(e) => onChange({ ...data, outletCount: e.target.value })}
                    placeholder="如：500+门店"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">重点区域市场</label>
                  <div className="flex flex-wrap gap-2">
                    {keyMarketsOptions.map(market => (
                      <button
                        key={market}
                        onClick={() => {
                          const current = data.keyMarkets ? data.keyMarkets.split('、').filter(Boolean) : []
                          const newMarkets = current.includes(market)
                            ? current.filter(m => m !== market)
                            : [...current, market]
                          onChange({ ...data, keyMarkets: newMarkets.join('、') })
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          data.keyMarkets?.includes(market)
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {market}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ))}

          {/* 过往营销 */}
          {renderCollapsibleSection('marketingHistory', '过往营销', (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">历史营销活动概述</label>
                <textarea
                  value={data.marketingHistory || ''}
                  onChange={(e) => onChange({ ...data, marketingHistory: e.target.value })}
                  placeholder="简述过往主要的营销活动和效果"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">过往代理商</label>
                  <input
                    type="text"
                    value={data.previousAgencies || ''}
                    onChange={(e) => onChange({ ...data, previousAgencies: e.target.value })}
                    placeholder="如：奥美、华扬联众"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">营销投入水平</label>
                  <input
                    type="text"
                    value={data.marketingBudget || ''}
                    onChange={(e) => onChange({ ...data, marketingBudget: e.target.value })}
                    placeholder="如：年投放1000万+"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">💡 4A标准提示</p>
            <p>详细的客户背景信息有助于后续制定更精准的品牌策略和创意方向。如有品牌手册、过往案例等资料，建议上传以便AI更好地理解品牌。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientInfoStep
