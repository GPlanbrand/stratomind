import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { RadarChartComponent, PositioningMatrix, WordCloudChart, UserJourneyChart } from '../components/CompetitorAnalysisCharts'

const AnalysisChartsPage: React.FC = () => {
  const handleExport = () => {
    alert('请使用浏览器打印功能(Ctrl+P)或截图工具保存图表')
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      {/* 顶部导航 */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/projects/workspace"
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">竞品分析图表</h1>
                <p className="text-sm text-gray-500">可视化竞品对比分析</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all text-sm font-medium flex items-center gap-2"
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">图表解读指南</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-700 mb-2">📊 雷达图</h4>
              <p className="text-sm text-gray-600">
                展示品牌在产品力、品牌力、渠道力、服务力、创新力、价格力六个维度的表现。
                面积越大，综合实力越强。
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-700 mb-2">🎯 定位矩阵</h4>
              <p className="text-sm text-gray-600">
                X轴为价格，Y轴为品质，气泡大小代表市场份额。
                右上角是理想竞争区域。
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-700 mb-2">☁️ 词云图</h4>
              <p className="text-sm text-gray-600">
                展示消费者对品牌的认知关键词。
                字号越大表示该关键词关联度越高。
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-700 mb-2">🚀 旅程对比</h4>
              <p className="text-sm text-gray-600">
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
