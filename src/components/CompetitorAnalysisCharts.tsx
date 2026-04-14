import React from 'react'
import { BarChart2, Target, Cloud, TrendingUp } from 'lucide-react'

// 雷达图组件
export const RadarChartComponent: React.FC = () => {
  const data = [
    { dimension: '产品力', client: 85, competitor: 72 },
    { dimension: '品牌力', client: 78, competitor: 88 },
    { dimension: '渠道力', client: 90, competitor: 65 },
    { dimension: '服务力', client: 82, competitor: 75 },
    { dimension: '创新力', client: 76, competitor: 80 },
    { dimension: '价格力', client: 68, competitor: 85 },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6" style={{minHeight: '320px'}}>
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
        <svg viewBox="0 0 500 280" className="w-full h-auto">
          {/* 背景网格 */}
          {[20, 40, 60, 80, 100].map((level) => (
            <polygon
              key={level}
              points={data.map((_, i) => {
                const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
                const r = (level / 100) * 120
                const cx = 250
                const cy = 150
                return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
              }).join(' ')}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* 轴线 */}
          {data.map((_, i) => {
            const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
            const cx = 250
            const cy = 150
            const x = cx + 130 * Math.cos(angle)
            const y = cy + 130 * Math.sin(angle)
            return (
              <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            )
          })}
          
          {/* 客户品牌多边形 */}
          <polygon
            points={data.map((d, i) => {
              const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
              const r = (d.client / 100) * 120
              const cx = 250
              const cy = 150
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
            }).join(' ')}
            fill="rgba(55, 65, 81, 0.15)"
            stroke="#374151"
            strokeWidth="2"
          />
          
          {/* 竞品多边形 */}
          <polygon
            points={data.map((d, i) => {
              const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
              const r = (d.competitor / 100) * 120
              const cx = 250
              const cy = 150
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
            }).join(' ')}
            fill="rgba(156, 163, 175, 0.1)"
            stroke="#9ca3af"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {/* 数据点 - 客户 */}
          {data.map((d, i) => {
            const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
            const r = (d.client / 100) * 120
            const cx = 250
            const cy = 150
            return (
              <circle
                key={`client-${i}`}
                cx={cx + r * Math.cos(angle)}
                cy={cy + r * Math.sin(angle)}
                r="4"
                fill="#374151"
                stroke="white"
                strokeWidth="2"
              />
            )
          })}
          
          {/* 标签 */}
          {data.map((d, i) => {
            const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
            const cx = 250
            const cy = 150
            const r = 150
            const x = cx + r * Math.cos(angle)
            const y = cy + r * Math.sin(angle)
            const textAnchor = x > 260 ? 'start' : x < 240 ? 'end' : 'middle'
            const dy = y > 160 ? 15 : y < 140 ? -5 : 5
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={y}
                textAnchor={textAnchor}
                dy={dy}
                fill="#374151"
                fontSize="12"
                fontWeight="500"
              >
                {d.dimension}
              </text>
            )
          })}
        </svg>
      </div>
      
      {/* 图例 */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-700"></div>
          <span className="text-sm text-gray-600">客户品牌</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-400"></div>
          <span className="text-sm text-gray-600">竞品</span>
        </div>
      </div>
    </div>
  )
}

// 竞争定位矩阵组件
export const PositioningMatrix: React.FC = () => {
  const brands = [
    { name: '客户品牌', x: 75, y: 70, size: 35, color: '#374151' },
    { name: '竞品A', x: 60, y: 50, size: 45, color: '#9ca3af' },
    { name: '竞品B', x: 30, y: 75, size: 25, color: '#d1d5db' },
    { name: '竞品C', x: 85, y: 30, size: 20, color: '#6b7280' },
    { name: '竞品D', x: 45, y: 85, size: 30, color: '#9ca3af' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6" style={{minHeight: '320px'}}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">竞争定位矩阵</h3>
          <p className="text-xs text-gray-500">价格 vs 品质 定位对比</p>
        </div>
      </div>
      
      <div className="mt-4 relative">
        <svg viewBox="0 0 500 280" className="w-full h-auto">
          {/* 背景 */}
          <rect x="50" y="20" width="430" height="220" fill="#f9fafb" rx="4" />
          
          {/* 象限分割线 */}
          <line x1="265" y1="20" x2="265" y2="240" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="50" y1="130" x2="480" y2="130" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
          
          {/* 轴 */}
          <line x1="50" y1="240" x2="480" y2="240" stroke="#374151" strokeWidth="2" />
          <line x1="50" y1="20" x2="50" y2="240" stroke="#374151" strokeWidth="2" />
          
          {/* 轴标签 */}
          <text x="265" y="265" textAnchor="middle" fill="#6b7280" fontSize="11">价格 →</text>
          <text x="15" y="130" textAnchor="middle" fill="#6b7280" fontSize="11" transform="rotate(-90, 15, 130)">品质 →</text>
          
          {/* 轴刻度标签 */}
          <text x="50" y="255" textAnchor="start" fill="#9ca3af" fontSize="10">低</text>
          <text x="480" y="255" textAnchor="end" fill="#9ca3af" fontSize="10">高</text>
          <text x="35" y="240" textAnchor="end" fill="#9ca3af" fontSize="10">低</text>
          <text x="35" y="25" textAnchor="end" fill="#9ca3af" fontSize="10">高</text>
          
          {/* 象限标签 */}
          <text x="100" y="50" textAnchor="middle" fill="#d1d5db" fontSize="10" fontWeight="500">低价低质</text>
          <text x="400" y="50" textAnchor="middle" fill="#d1d5db" fontSize="10" fontWeight="500">高价低质</text>
          <text x="100" y="220" textAnchor="middle" fill="#d1d5db" fontSize="10" fontWeight="500">低价高质</text>
          <text x="400" y="220" textAnchor="middle" fill="#d1d5db" fontSize="10" fontWeight="500">高价高质</text>
          
          {/* 气泡 */}
          {brands.map((brand, i) => {
            const cx = 50 + (brand.x / 100) * 430
            const cy = 240 - (brand.y / 100) * 220
            const r = brand.size
            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={brand.color}
                  opacity="0.7"
                  stroke={brand.color}
                  strokeWidth="2"
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {brand.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      
      {/* 图例 */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {brands.map((brand, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brand.color }}></div>
            <span className="text-xs text-gray-600">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 消费者心智词云组件
export const WordCloudChart: React.FC = () => {
  const clientKeywords = [
    { text: '创新', value: 90, color: '#374151' },
    { text: '品质', value: 85, color: '#374151' },
    { text: '专业', value: 78, color: '#6b7280' },
    { text: '可靠', value: 72, color: '#6b7280' },
    { text: '时尚', value: 65, color: '#9ca3af' },
    { text: '服务', value: 60, color: '#9ca3af' },
    { text: '科技', value: 55, color: '#d1d5db' },
    { text: '高端', value: 50, color: '#d1d5db' },
  ]

  const competitorKeywords = [
    { text: '传统', value: 88, color: '#6b7280' },
    { text: '稳定', value: 82, color: '#6b7280' },
    { text: '成熟', value: 75, color: '#9ca3af' },
    { text: '便宜', value: 70, color: '#9ca3af' },
    { text: '渠道', value: 62, color: '#d1d5db' },
    { text: '老牌', value: 55, color: '#d1d5db' },
    { text: '经典', value: 48, color: '#e5e7eb' },
    { text: '大众', value: 42, color: '#e5e7eb' },
  ]

  const renderWordCloud = (words: typeof clientKeywords, startX: number) => {
    let currentX = startX
    let currentY = 30
    const maxY = 180
    const lineHeight = 28

    return words.map((word, i) => {
      const fontSize = 10 + (word.value / 100) * 20
      const estimatedWidth = word.text.length * fontSize * 0.7 + 20
      
      if (currentX + estimatedWidth > startX + 200) {
        currentX = startX
        currentY += lineHeight
      }
      
      const x = currentX
      currentX += estimatedWidth
      
      return (
        <text
          key={i}
          x={x}
          y={Math.min(currentY, maxY)}
          fill={word.color}
          fontSize={`${fontSize}px`}
          fontWeight={word.value > 70 ? 'bold' : 'normal'}
          opacity={0.6 + (word.value / 100) * 0.4}
        >
          {word.text}
        </text>
      )
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6" style={{minHeight: '320px'}}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <Cloud className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">消费者心智词云</h3>
          <p className="text-xs text-gray-500">品牌关联关键词对比</p>
        </div>
      </div>
      
      <div className="mt-4 flex">
        {/* 客户品牌词云 */}
        <div className="flex-1 pr-4 border-r border-gray-200">
          <div className="text-center mb-3">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              客户品牌
            </span>
          </div>
          <svg viewBox="0 0 220 210" className="w-full h-auto">
            <g>{renderWordCloud(clientKeywords, 10)}</g>
          </svg>
        </div>
        
        {/* 竞品词云 */}
        <div className="flex-1 pl-4">
          <div className="text-center mb-3">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              竞品
            </span>
          </div>
          <svg viewBox="0 0 220 210" className="w-full h-auto">
            <g>{renderWordCloud(competitorKeywords, 10)}</g>
          </svg>
        </div>
      </div>
      
      {/* 解读 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-600">
          <span className="font-semibold text-gray-700">客户品牌</span> 以"创新、品质"为核心心智，突出差异化；
          <span className="font-semibold text-gray-500"> 竞品</span> 侧重"传统、稳定"形象，需突破固有认知。
        </p>
      </div>
    </div>
  )
}

// 用户旅程对比图组件
export const UserJourneyChart: React.FC = () => {
  const stages = [
    { name: '认知', client: 85, competitor: 75 },
    { name: '兴趣', client: 72, competitor: 80 },
    { name: '欲望', client: 68, competitor: 70 },
    { name: '行动', client: 90, competitor: 60 },
    { name: '忠诚', client: 78, competitor: 72 },
  ]

  const maxValue = 100
  const barHeight = 24
  const groupGap = 50
  const startY = 40

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6" style={{minHeight: '320px'}}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">用户旅程对比</h3>
          <p className="text-xs text-gray-500">五阶段转化效能分析</p>
        </div>
      </div>
      
      <div className="mt-6">
        <svg viewBox="0 0 500 280" className="w-full h-auto">
          {/* Y轴 */}
          <line x1="60" y1="40" x2="60" y2="240" stroke="#d1d5db" strokeWidth="1" />
          
          {/* Y轴刻度和标签 */}
          {[0, 25, 50, 75, 100].map((value) => (
            <g key={value}>
              <line x1="55" y1={240 - (value / 100) * 200} x2="60" y2={240 - (value / 100) * 200} stroke="#d1d5db" strokeWidth="1" />
              <text x="50" y={240 - (value / 100) * 200 + 4} textAnchor="end" fill="#9ca3af" fontSize="10">
                {value}
              </text>
            </g>
          ))}
          
          {/* 阶段组 */}
          {stages.map((stage, i) => {
            const y = startY + i * groupGap
            const clientHeight = (stage.client / maxValue) * 200
            const competitorHeight = (stage.competitor / maxValue) * 200
            
            return (
              <g key={i}>
                {/* 阶段标签 */}
                <text x="10" y={y + 20} fill="#374151" fontSize="12" fontWeight="500">
                  {stage.name}
                </text>
                
                {/* 客户品牌条 */}
                <rect
                  x="70"
                  y={240 - clientHeight}
                  width="90"
                  height={clientHeight}
                  fill="#374151"
                  rx="4"
                  opacity="0.9"
                />
                <text
                  x="115"
                  y={240 - clientHeight - 8}
                  textAnchor="middle"
                  fill="#374151"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {stage.client}
                </text>
                
                {/* 竞品条 */}
                <rect
                  x="170"
                  y={240 - competitorHeight}
                  width="90"
                  height={competitorHeight}
                  fill="#9ca3af"
                  rx="4"
                  opacity="0.7"
                />
                <text
                  x="215"
                  y={240 - competitorHeight - 8}
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {stage.competitor}
                </text>
              </g>
            )
          })}
          
          {/* X轴标签 */}
          <text x="115" y="260" textAnchor="middle" fill="#374151" fontSize="11" fontWeight="500">客户品牌</text>
          <text x="215" y="260" textAnchor="middle" fill="#6b7280" fontSize="11" fontWeight="500">竞品</text>
        </svg>
      </div>
      
      {/* 洞察 */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-700">✓</span>
          <span className="text-gray-700">客户品牌在<span className="font-semibold">认知、行动</span>阶段领先明显</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">!</span>
          <span className="text-gray-700">竞品在<span className="font-semibold">兴趣</span>阶段略占优势，需强化内容吸引</span>
        </div>
      </div>
    </div>
  )
}
