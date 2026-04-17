import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FolderOpen, Gem, Coins, Bot, 
  Folder, BookOpen, ScrollText, Settings, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AdminUsersPage from './AdminUsersPage';
import AdminProjectsPage from './AdminProjectsPage';
import AdminMemberPage from './AdminMemberPage';
import AdminPointsPage from './AdminPointsPage';
import AdminRechargePage from './AdminRechargePage';
import AdminAILogsPage from './AdminAILogsPage';
import AdminFilesPage from './AdminFilesPage';
import AdminKnowledgePage from './AdminKnowledgePage';
import AdminLogsPage from './AdminLogsPage';
import AdminSettingsPage from './AdminSettingsPage';
import AdminManagePage from './AdminManagePage';

type MenuItem = 'dashboard' | 'users' | 'projects' | 'members' | 'points' | 
                 'recharges' | 'ai-logs' | 'files' | 'knowledge' | 'logs' | 'settings' | 'admins';

const API_BASE = '';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminRole, setAdminRole] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const username = localStorage.getItem('adminUsername');
    const role = localStorage.getItem('adminRole');
    
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    setAdminUsername(username || 'Admin');
    setAdminRole(role || 'admin');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminRole');
    navigate('/admin/login');
  };

  // 所有菜单项
  const allMenuItems: { id: MenuItem; label: string; icon: React.ElementType; group: string }[] = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, group: '概览' },
    { id: 'admins', label: '管理员', icon: Shield, group: '系统' },
    { id: 'users', label: '用户管理', icon: Users, group: '用户' },
    { id: 'projects', label: '项目管理', icon: FolderOpen, group: '用户' },
    { id: 'members', label: '会员管理', icon: Gem, group: '用户' },
    { id: 'points', label: '积分管理', icon: Coins, group: '财务' },
    { id: 'recharges', label: '充值记录', icon: Coins, group: '财务' },
    { id: 'ai-logs', label: 'AI使用记录', icon: Bot, group: '数据' },
    { id: 'files', label: '文件管理', icon: Folder, group: '数据' },
    { id: 'knowledge', label: '知识库管理', icon: BookOpen, group: '数据' },
    { id: 'logs', label: '操作日志', icon: ScrollText, group: '系统' },
    { id: 'settings', label: '系统设置', icon: Settings, group: '系统' },
  ];

  // 根据角色过滤菜单
  const menuItems = adminRole === 'superadmin' 
    ? allMenuItems 
    : allMenuItems.filter(item => item.id !== 'admins');

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <AdminDashboard />;
      case 'admins': return <AdminManagePage />;
      case 'users': return <AdminUsersPage />;
      case 'projects': return <AdminProjectsPage />;
      case 'members': return <AdminMemberPage />;
      case 'points': return <AdminPointsPage />;
      case 'recharges': return <AdminRechargePage />;
      case 'ai-logs': return <AdminAILogsPage />;
      case 'files': return <AdminFilesPage />;
      case 'knowledge': return <AdminKnowledgePage />;
      case 'logs': return <AdminLogsPage />;
      case 'settings': return <AdminSettingsPage />;
      default: return <AdminDashboard />;
    }
  };

  // 按分组整理菜单
  const groups = menuItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

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
        <nav className="flex-1 py-4 overflow-y-auto">
          {Object.entries(groups).map(([groupName, items]) => (
            <div key={groupName} className="mb-4">
              {sidebarOpen && (
                <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {groupName}
                </div>
              )}
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    activeMenu === item.id
                      ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  } ${!sidebarOpen ? 'justify-center' : ''}`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* 折叠按钮 */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="border-t border-gray-200 p-4 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">收起</span>
            </>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
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
              {adminRole === 'superadmin' && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">超级管理员</span>
              )}
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
