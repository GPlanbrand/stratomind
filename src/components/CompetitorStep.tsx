import React, { useState } from 'react'
import { Users, Plus, Trash2, Search, BarChart3, X, Download, BarChart2, Target, Cloud, TrendingUp } from 'lucide-react'
import { Competitor } from '../types'
import { RadarChartComponent, PositioningMatrix, WordCloudChart, UserJourneyChart } from './CompetitorAnalysisCharts'

interface Props {
  data: { competitors: Competitor[] }
  onChange: (data: { competitors: Competitor[] }) => void
}

const CompetitorStep: React.FC<Props> = ({ data, onChange }) => {
  const [showCharts, setShowCharts] = useState(false)

  const addCompetitor = () => {
    if (data.competitors.length >= 3) {
      alert('最多添加3个竞品')
      return
    }
    const newCompetitor: Competitor = {
      id: Date.now().toString(),
      name: '',
      brandPositioning: '',
      visualStyle: '',
      targetAudience: '',
      strengths: [],
      weaknesses: [],
      marketShare: ''
    }
    onChange({ competitors: [...data.competitors, newCompetitor] })
  }

  const updateCompetitor = (id: string, field: keyof Competitor, value: any) => {
    onChange({
      competitors: data.competitors.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    })
  }

  const removeCompetitor = (id: string) => {
    onChange({ competitors: data.competitors.filter(c => c.id !== id) })
  }

  // 导出图表为PNG
  const exportChartAsImage = (chartId: string, chartName: string) => {
    const chartElement = document.getElementById(chartId)
    if (!chartElement) return
    
    // 使用html2canvas将DOM转换为canvas
    const svgElement = chartElement.querySelector('svg')
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    // 设置canvas尺寸
    canvas.width = 800
    canvas.height = 600

    img.onload = () => {
      if (ctx) {
        // 白色背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 50, 50, 700, 500)
        
        // 下载
        const link = document.createElement('a')
        link.download = `${chartName}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">竞品分析</h2>
        </div>
        <p className="text-gray-500 text-sm">分析主要竞争对手的市场表现（最多添加3个）</p>
      </div>

      {data.competitors.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">还没有添加竞品</p>
          <button
            onClick={addCompetitor}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            添加竞品
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.competitors.map((competitor, index) => (
            <div key={competitor.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-green-100 text-green-700 text-sm font-medium flex items-center justify-center">{index + 1}</span>
                  竞品信息
                </h3>
                <button
                  onClick={() => removeCompetitor(competitor.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">竞品名称</label>
                  <input
                    type="text"
                    value={competitor.name}
                    onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                    placeholder="输入竞品公司/品牌名称"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌定位</label>
                  <textarea
                    value={competitor.brandPositioning}
                    onChange={(e) => updateCompetitor(competitor.id, 'brandPositioning', e.target.value)}
                    placeholder="描述竞品的品牌定位"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">视觉风格</label>
                    <input
                      type="text"
                      value={competitor.visualStyle}
                      onChange={(e) => updateCompetitor(competitor.id, 'visualStyle', e.target.value)}
                      placeholder="如：简约、科技感"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">市场份额</label>
                    <input
                      type="text"
                      value={competitor.marketShare}
                      onChange={(e) => updateCompetitor(competitor.id, 'marketShare', e.target.value)}
                      placeholder="如：15%"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">目标受众</label>
                  <input
                    type="text"
                    value={competitor.targetAudience}
                    onChange={(e) => updateCompetitor(competitor.id, 'targetAudience', e.target.value)}
                    placeholder="描述竞品的目标受众"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            {data.competitors.length < 3 && (
              <button
                onClick={addCompetitor}
                className="flex items-center gap-2 px-4 py-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all border border-dashed border-gray-300"
              >
                <Plus className="w-4 h-4" />
                添加更多竞品
              </button>
            )}
          </div>

          {/* AI搜索和图表按钮 */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Search className="w-4 h-4" />
              AI搜索竞品信息
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              <BarChart3 className="w-4 h-4" />
              生成对比矩阵
            </button>
          </div>
        </div>
      )}

      {/* 查看竞品分析图表按钮 */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setShowCharts(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
        >
          <BarChart2 className="w-5 h-5" />
          查看竞品分析图表
        </button>
      </div>

      <p className="text-center text-gray-400 text-xs mt-3">
        点击查看雷达图、定位矩阵、词云、用户旅程等可视化分析
      </p>

      {/* 图表模态框 */}
      {showCharts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCharts(false)}>
          <div 
            className="bg-gray-100 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 模态框头部 */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">竞品分析图表</h2>
                <p className="text-sm text-gray-500">可交互 · 可导出</p>
              </div>
              <button
                onClick={() => setShowCharts(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* 图表内容 */}
            <div className="p-6 space-y-6">
              {/* 图表1: 雷达图 */}
              <div id="chart-radar" className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => exportChartAsImage('chart-radar', '品牌竞争力雷达图')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
                  >
                    <Download className="w-4 h-4" />
                    导出PNG
                  </button>
                </div>
                <RadarChartComponent />
              </div>

              {/* 图表2: 竞争定位矩阵 */}
              <div id="chart-matrix" className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => exportChartAsImage('chart-matrix', '竞争定位矩阵')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
                  >
                    <Download className="w-4 h-4" />
                    导出PNG
                  </button>
                </div>
                <PositioningMatrix />
              </div>

              {/* 图表3: 消费者心智词云 */}
              <div id="chart-wordcloud" className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => exportChartAsImage('chart-wordcloud', '消费者心智词云')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
                  >
                    <Download className="w-4 h-4" />
                    导出PNG
                  </button>
                </div>
                <WordCloudChart />
              </div>

              {/* 图表4: 用户旅程对比图 */}
              <div id="chart-journey" className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => exportChartAsImage('chart-journey', '用户旅程对比')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
                  >
                    <Download className="w-4 h-4" />
                    导出PNG
                  </button>
                </div>
                <UserJourneyChart />
              </div>

              {/* 图表使用说明 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">i</span>
                  图表使用说明
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>雷达图</strong>：展示客户品牌与竞品在6个维度的综合实力对比</li>
                  <li>• <strong>竞争定位矩阵</strong>：以价格和品质为坐标轴，展示各品牌的市场定位</li>
                  <li>• <strong>消费者心智词云</strong>：对比品牌在消费者心中的关联关键词</li>
                  <li>• <strong>用户旅程对比</strong>：分析客户品牌与竞品在各转化阶段的效能差异</li>
                  <li className="pt-2 text-blue-600">💡 点击每张图表右上角的「导出PNG」按钮可保存图表</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompetitorStep
