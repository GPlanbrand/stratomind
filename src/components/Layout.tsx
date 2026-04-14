import React from 'react'
import { Outlet } from 'react-router-dom'

const Layout: React.FC = () => {
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
      
      <Outlet />
    </div>
  )
}

export default Layout
