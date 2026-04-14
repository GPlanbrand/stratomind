import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { RadarChartComponent, PositioningMatrix, WordCloudChart, UserJourneyChart } from '../components/CompetitorAnalysisCharts'

const AnalysisChartsPage: React.FC = () => {
  const handleExport = () => {
    // 提示用户右键保存或截图
    alert('请使用浏览器打印功能(Ctrl+P)或截图工具保存图表')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      {/* 顶部导航 */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="glass rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/workspace"
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">竞品分析图表</h1>
                <p className="text-sm text-white/60">可视化竞品对比分析</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-semibold shadow-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出图表
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 图表容器 */}
      <div id="charts-container" className="max-w-7xl mx-auto space-y-6">
        {/* 第一行：雷达图 + 竞争定位矩阵 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RadarChartComponent />
          <PositioningMatrix />
        </div>

        {/* 第二行：词云 */}
        <div className="grid grid-cols-1">
          <WordCloudChart />
        </div>

        {/* 第三行：用户旅程对比 */}
        <div className="grid grid-cols-1">
          <UserJourneyChart />
        </div>
      </div>

      {/* 底部说明 */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="glass rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">图表解读指南</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="font-semibold text-purple-300 mb-2">📊 雷达图</h4>
              <p className="text-sm text-white/70">
                展示品牌在产品力、品牌力、渠道力、服务力、创新力、价格力六个维度的表现。
                面积越大，综合实力越强。
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="font-semibold text-blue-300 mb-2">🎯 定位矩阵</h4>
              <p className="text-sm text-white/70">
                X轴为价格，Y轴为品质，气泡大小代表市场份额。
                右上角是理想竞争区域。
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="font-semibold text-green-300 mb-2">☁️ 词云图</h4>
              <p className="text-sm text-white/70">
                展示消费者对品牌的认知关键词。
                字号越大表示该关键词关联度越高。
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="font-semibold text-orange-300 mb-2">🚀 旅程对比</h4>
              <p className="text-sm text-white/70">
                展示用户从认知到忠诚五个阶段的转化效率。
                柱越高表示该阶段表现越好。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisChartsPage
