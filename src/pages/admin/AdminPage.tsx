import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AdminUsersPage from './AdminUsersPage';
import AdminProjectsPage from './AdminProjectsPage';

const API_BASE = import.meta.env.VITE_API_URL || 'https://stratomind-production.up.railway.app';

type MenuItem = 'dashboard' | 'users' | 'projects';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [adminUsername, setAdminUsername] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const username = localStorage.getItem('adminUsername');
    
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    setAdminUsername(username || 'Admin');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const menuItems = [
    { id: 'dashboard', label: '仪表盘', icon: '📊' },
    { id: 'users', label: '用户管理', icon: '👥' },
    { id: 'projects', label: '项目管理', icon: '📁' },
  ] as const;

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUsersPage />;
      case 'projects':
        return <AdminProjectsPage />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
      >
        {/* Logo区域 */}
        <div className="h-16 border-b border-gray-200 flex items-center px-4 gap-3">
          <img src="/logo.svg" alt="Logo" className="h-8 w-auto flex-shrink-0" />
          {sidebarOpen && (
            <div className="overflow-hidden">
              <span className="font-semibold text-gray-900 whitespace-nowrap">管理后台</span>
            </div>
          )}
        </div>

        {/* 菜单 */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeMenu === item.id
                  ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* 折叠按钮 */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="border-t border-gray-200 p-4 text-gray-400 hover:text-gray-600 transition-colors text-center"
        >
          {sidebarOpen ? '◀ 收起' : '▶ 展开'}
        </button>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-900">
            {menuItems.find((m) => m.id === activeMenu)?.label}
          </h1>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              欢迎，<span className="font-medium text-gray-900">{adminUsername}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              退出登录
            </button>
          </div>
        </header>

        {/* 内容 */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
