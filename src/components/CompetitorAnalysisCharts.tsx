import React from 'react'
import { BarChart2, Target, Cloud, TrendingUp, Shield, Zap } from 'lucide-react'
import { Competitor } from '../types'

// 品牌调色板
const COLORS = [
  { primary: '#3B82F6', secondary: '#93C5FD', name: '品牌蓝' },
  { primary: '#10B981', secondary: '#6EE7B7', name: '增长绿' },
  { primary: '#F59E0B', secondary: '#FCD34D', name: '活力橙' },
  { primary: '#8B5CF6', secondary: '#C4B5FD', name: '创意紫' },
]

// 竞品对比总览表格
export const ComparisonTableChart: React.FC<{ competitors: Competitor[] }> = ({ competitors }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">竞品对比总览</h3>
          <p className="text-xs text-gray-500">核心维度差异化分析</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 w-32">维度</th>
              {competitors.map((c, i) => (
                <th key={c.id} className="text-left py-3 px-4 font-semibold" style={{ color: COLORS[i % COLORS.length].primary }}>
                  {c.name || `竞品${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-600">品牌定位</td>
              {competitors.map((c, i) => (
                <td key={c.id} className="py-3 px-4 text-gray-800">{c.brandPositioning || '-'}</td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-600">目标人群</td>
              {competitors.map((c, i) => (
                <td key={c.id} className="py-3 px-4 text-gray-800">{c.targetAudience || '-'}</td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-600">价格区间</td>
              {competitors.map((c, i) => (
                <td key={c.id} className="py-3 px-4 text-gray-800">{c.priceRange || '-'}</td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-600">市场份额</td>
              {competitors.map((c, i) => (
                <td key={c.id} className="py-3 px-4 text-gray-800">{c.marketShare || '-'}</td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-600">品牌调性</td>
              {competitors.map((c, i) => (
                <td key={c.id} className="py-3 px-4 text-gray-800">{c.brandTone || '-'}</td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-600">核心产品</td>
              {competitors.map((c, i) => (
                <td key={c.id} className="py-3 px-4 text-gray-800">
                  {c.coreProducts?.length ? c.coreProducts.slice(0, 2).join('、') : '-'}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-600">主要渠道</td>
              {competitors.map((c, i) => (
                <td key={c.id} className="py-3 px-4 text-gray-800">
                  {c.channels?.length ? c.channels.slice(0, 2).join('、') : '-'}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-600">视觉风格</td>
              {competitors.map((c, i) => (
                <td key={c.id} className="py-3 px-4 text-gray-800">{c.visualStyle || '-'}</td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-600">营销策略</td>
              {competitors.map((c, i) => (
                <td key={c.id} className="py-3 px-4 text-gray-800">{c.marketingStrategy ? c.marketingStrategy.substring(0, 30) + '...' : '-'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 竞争力雷达图
export const CompetitorRadarChart: React.FC<{ competitors: Competitor[] }> = ({ competitors }) => {
  // 默认雷达图数据
  const defaultScores = { productPower: 70, brandPower: 70, channelPower: 70, servicePower: 70, innovationPower: 70, pricePower: 70 }
  const dimensions = [
    { key: 'productPower', label: '产品力' },
    { key: 'brandPower', label: '品牌力' },
    { key: 'channelPower', label: '渠道力' },
    { key: 'servicePower', label: '服务力' },
    { key: 'innovationPower', label: '创新力' },
    { key: 'pricePower', label: '价格力' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <Target className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">品牌竞争力雷达图</h3>
          <p className="text-xs text-gray-500">六维度综合实力对比</p>
        </div>
      </div>
      
      <div className="mt-4">
        <svg viewBox="0 0 500 320" className="w-full h-auto">
          {/* 背景网格 */}
          {[20, 40, 60, 80, 100].map((level) => (
            <polygon
              key={level}
              points={dimensions.map((_, i) => {
                const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2
                const r = (level / 100) * 110
                const cx = 250
                const cy = 160
                return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
              }).join(' ')}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* 轴线 */}
          {dimensions.map((_, i) => {
            const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2
            const cx = 250
            const cy = 160
            const x = cx + 120 * Math.cos(angle)
            const y = cy + 120 * Math.sin(angle)
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1" />
          })}
          
          {/* 竞品多边形 */}
          {competitors.slice(0, 4).map((competitor, competitorIndex) => {
            const scores = competitor.scores || defaultScores
            const color = COLORS[competitorIndex % COLORS.length]
            return (
              <polygon
                key={competitor.id}
                points={dimensions.map((dim, i) => {
                  const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2
                  const value = (scores as any)[dim.key] || 70
                  const r = (value / 100) * 110
                  const cx = 250
                  const cy = 160
                  return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
                }).join(' ')}
                fill={color.secondary}
                stroke={color.primary}
                strokeWidth="2"
                opacity="0.7"
              />
            )
          })}
          
          {/* 标签 */}
          {dimensions.map((dim, i) => {
            const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2
            const cx = 250
            const cy = 160
            const r = 145
            const x = cx + r * Math.cos(angle)
            const y = cy + r * Math.sin(angle)
            const textAnchor = x > 260 ? 'start' : x < 240 ? 'end' : 'middle'
            const dy = y > 170 ? 15 : y < 150 ? -5 : 5
            return (
              <text key={dim.key} x={x} y={y} textAnchor={textAnchor} dy={dy} fill="#374151" fontSize="12" fontWeight="500">
                {dim.label}
              </text>
            )
          })}
        </svg>
      </div>
      
      {/* 图例 */}
      <div className="flex justify-center gap-6 mt-4 flex-wrap">
        {competitors.slice(0, 4).map((competitor, i) => (
          <div key={competitor.id} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length].primary }}></div>
            <span className="text-sm text-gray-600">{competitor.name || `竞品${i + 1}`}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// SWOT分析图表
export const SwotChart: React.FC<{ competitors: Competitor[] }> = ({ competitors }) => {
  // 合并所有竞品的SWOT
  const allStrengths = competitors.flatMap(c => c.strengths || [])
  const allWeaknesses = competitors.flatMap(c => c.weaknesses || [])
  const allOpportunities = competitors.flatMap(c => c.opportunities || [])
  const allThreats = competitors.flatMap(c => c.threats || [])

  const swotData = [
    { label: '优势 S', items: allStrengths.slice(0, 6), color: '#10B981', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { label: '劣势 W', items: allWeaknesses.slice(0, 6), color: '#EF4444', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    { label: '机会 O', items: allOpportunities.slice(0, 6), color: '#3B82F6', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { label: '威胁 T', items: allThreats.slice(0, 6), color: '#F59E0B', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">竞品SWOT分析汇总</h3>
          <p className="text-xs text-gray-500">从各竞品分析中提取的关键洞察</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {swotData.map((swot) => (
          <div key={swot.label} className={`${swot.bgColor} rounded-xl p-4 border ${swot.borderColor}`}>
            <h4 className="font-bold text-lg mb-3" style={{ color: swot.color }}>
              {swot.label}
            </h4>
            {swot.items.length > 0 ? (
              <ul className="space-y-2">
                {swot.items.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">暂无数据</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// 竞争定位矩阵
export const PositioningMatrixChart: React.FC<{ competitors: Competitor[] }> = ({ competitors }) => {
  // 根据市场份额和品牌知名度计算位置
  const getPosition = (competitor: Competitor, index: number) => {
    const marketShareValue = parseFloat(competitor.marketShare?.replace(/[^0-9.]/g, '') || '50')
    const awarenessValue = competitor.brandAwareness?.includes('前三') || competitor.brandAwareness?.includes('领先') ? 80 : 
                           competitor.brandAwareness?.includes('前十') ? 60 : 50
    return {
      x: 20 + (100 - marketShareValue) * 0.8 + (Math.random() * 20 - 10), // 价格从低到高
      y: 20 + awarenessValue * 0.6 + (Math.random() * 20 - 10), // 品质从低到高
      size: 25 + marketShareValue * 0.3,
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">竞争定位矩阵</h3>
          <p className="text-xs text-gray-500">价格-品质 定位分布图</p>
        </div>
      </div>
      
      <div className="mt-4 relative">
        <svg viewBox="0 0 500 300" className="w-full h-auto">
          {/* 背景 */}
          <rect x="50" y="20" width="430" height="240" fill="#f9fafb" rx="4" />
          
          {/* 象限分割线 */}
          <line x1="265" y1="20" x2="265" y2="260" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="50" y1="140" x2="480" y2="140" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
          
          {/* 轴 */}
          <line x1="50" y1="260" x2="480" y2="260" stroke="#374151" strokeWidth="2" />
          <line x1="50" y1="20" x2="50" y2="260" stroke="#374151" strokeWidth="2" />
          
          {/* 轴标签 */}
          <text x="265" y="280" textAnchor="middle" fill="#6b7280" fontSize="11">价格 →</text>
          <text x="15" y="140" textAnchor="middle" fill="#6b7280" fontSize="11" transform="rotate(-90, 15, 140)">品质/知名度 →</text>
          
          {/* 象限标签 */}
          <text x="100" y="50" textAnchor="middle" fill="#d1d5db" fontSize="10" fontWeight="500">高质低价</text>
          <text x="400" y="50" textAnchor="middle" fill="#d1d5db" fontSize="10" fontWeight="500">高质高价</text>
          <text x="100" y="230" textAnchor="middle" fill="#d1d5db" fontSize="10" fontWeight="500">低质低价</text>
          <text x="400" y="230" textAnchor="middle" fill="#d1d5db" fontSize="10" fontWeight="500">低质高价</text>
          
          {/* 气泡 */}
          {competitors.map((competitor, i) => {
            const pos = getPosition(competitor, i)
            const color = COLORS[i % COLORS.length]
            return (
              <g key={competitor.id}>
                <circle
                  cx={50 + (pos.x / 100) * 430}
                  cy={260 - (pos.y / 100) * 240}
                  r={pos.size}
                  fill={color.primary}
                  opacity="0.75"
                  stroke={color.primary}
                  strokeWidth="2"
                />
                <text
                  x={50 + (pos.x / 100) * 430}
                  y={260 - (pos.y / 100) * 240}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {competitor.name ? competitor.name.substring(0, 4) : `竞${i + 1}`}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      
      {/* 图例 */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {competitors.map((competitor, i) => (
          <div key={competitor.id} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length].primary }}></div>
            <span className="text-xs text-gray-600">{competitor.name || `竞品${i + 1}`}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 消费者心智词云（保留原有组件兼容性）
export const WordCloudChart: React.FC<{ keywords?: { text: string; value: number }[] }> = ({ keywords }) => {
  const words = keywords || [
    { text: '创新', value: 90 }, { text: '品质', value: 85 }, { text: '专业', value: 78 },
    { text: '可靠', value: 72 }, { text: '时尚', value: 65 }, { text: '服务', value: 60 },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <Cloud className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">品牌关键词</h3>
          <p className="text-xs text-gray-500">关联度分析</p>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {words.map((word, i) => (
          <span
            key={i}
            className="px-4 py-2 rounded-full text-white font-medium"
            style={{
              fontSize: `${12 + (word.value / 100) * 16}px`,
              backgroundColor: COLORS[i % COLORS.length].primary,
              opacity: 0.6 + (word.value / 100) * 0.4,
            }}
          >
            {word.text}
          </span>
        ))}
      </div>
    </div>
  )
}

// 用户旅程对比图（保留原有组件兼容性）
export const UserJourneyChart: React.FC<{ data?: { stage: string; value: number }[] }> = ({ data }) => {
  const stages = data || [
    { stage: '认知', value: 85 }, { stage: '兴趣', value: 72 }, { stage: '欲望', value: 68 },
    { stage: '行动', value: 90 }, { stage: '忠诚', value: 78 },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">用户旅程转化</h3>
          <p className="text-xs text-gray-500">各阶段效能分析</p>
        </div>
      </div>
      
      <div className="mt-6 flex items-end justify-around gap-4">
        {stages.map((stage, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-600">{stage.value}</div>
            <div className="w-16 bg-blue-100 rounded-t-lg mt-2" style={{ height: `${stage.value * 1.5}px` }}>
              <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg" style={{ height: `${stage.value}%` }}></div>
            </div>
            <div className="text-sm font-medium text-gray-700 mt-2">{stage.stage}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
