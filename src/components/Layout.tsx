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
            <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
            <span className="text-white font-bold text-lg">StratoMind</span>
          </div>
        </div>
      </nav>
      
      {/* 主内容区域 - 添加顶部padding避免被导航栏遮挡 */}
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
