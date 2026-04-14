import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

const Layout: React.FC = () => {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="bg-orb w-96 h-96 bg-purple-400 top-0 left-0 -translate-x-1/2 -translate-y-1/2 fixed"></div>
      <div className="bg-orb w-80 h-80 bg-blue-400 bottom-0 right-0 translate-x-1/2 translate-y-1/2 fixed"></div>
      <div className="bg-orb w-64 h-64 bg-pink-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fixed"></div>
      
      {/* 网格背景 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* 顶部导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo.svg" alt="灵思StratoMind" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              返回首页
            </button>
          </div>
        </div>
      </nav>
      
      {/* 主内容区域 */}
      <div className="pt-20">
        <Outlet />
      </div>
      
      {/* 底部版权 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 py-3 text-center text-gray-400 text-sm z-40">
        © 2024 StratoMind. All Rights Reserved.
      </footer>
    </div>
  )
}

export default Layout
