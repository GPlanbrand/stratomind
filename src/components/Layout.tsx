import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

const Layout: React.FC = () => {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* 动态背景装饰球体 - 增强版 */}
      <div className="bg-orb bg-orb-lg bg-purple-400 top-0 left-0 -translate-x-1/3 -translate-y-1/3 fixed animate-orb-1"></div>
      <div className="bg-orb bg-orb-lg bg-blue-400 bottom-0 right-0 translate-x-1/3 translate-y-1/3 fixed animate-orb-2"></div>
      <div className="bg-orb bg-orb-lg bg-pink-400 top-1/3 right-1/4 fixed animate-orb-3"></div>
      <div className="bg-orb bg-orb-sm bg-cyan-400 bottom-1/4 left-1/6 fixed animate-float-slow"></div>
      <div className="bg-orb bg-orb-sm bg-yellow-400 top-1/4 left-1/3 fixed animate-float" style={{animationDelay: '1s'}}></div>
      
      {/* 网格背景 */}
      <div className="absolute inset-0 bg-grid opacity-20"></div>
      
      {/* 顶部导航栏 - 玻璃态增强 */}
      <nav className="glass-strong rounded-b-2xl mx-4 mt-0 fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo区域 */}
          <div className="flex items-center gap-4 cursor-pointer logo-hover group" onClick={() => navigate('/')}>
            <div className="relative">
              <img 
                src="/logo.svg" 
                alt="灵思StratoMind" 
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" 
              />
              {/* Logo光效 */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
          
          {/* 右侧操作区 */}
          <div className="flex items-center gap-4">
            {/* 返回首页按钮 - 优化样式 */}
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/25 transition-all duration-300 backdrop-blur-md hover-glow"
            >
              <svg className="w-5 h-5 text-white transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-white font-medium text-sm">返回首页</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* 主内容区域 */}
      <div className="pt-20 pb-16 relative z-10">
        <Outlet />
      </div>
      
      {/* 底部版权 - 增强样式 */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900/90 via-gray-900/95 to-gray-900/90 backdrop-blur-xl border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"></div>
          <p className="text-gray-400 text-sm font-medium tracking-wide">
            © 2024 <span className="text-white/80">StratoMind</span>. All Rights Reserved.
          </p>
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
