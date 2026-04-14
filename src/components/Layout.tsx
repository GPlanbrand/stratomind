import React from 'react'
import { Outlet } from 'react-router-dom'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500">
      <Outlet />
    </div>
  )
}

export default Layout
