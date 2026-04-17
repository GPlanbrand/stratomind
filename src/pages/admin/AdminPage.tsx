import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FolderOpen, Gem, Coins, Bot, 
  Folder, BookOpen, ScrollText, Settings, ChevronLeft, ChevronRight, 
  Shield, Plus, HelpCircle, Headphones, Search, Bell, LogOut,
  FileText, CreditCard, Activity, ChevronDown
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

interface MenuGroup {
  id: string;
  name: string;
  icon: React.ElementType;
  items: { id: MenuItem; label: string; icon: React.ElementType }[];
}

const API_BASE = '';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminRole, setAdminRole] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const menuGroups: MenuGroup[] = [
    {
      id: 'overview',
      name: '数据概览',
      icon: LayoutDashboard,
      items: [
        { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard }
      ]
    },
    {
      id: 'users',
      name: '用户中心',
      icon: Users,
      items: [
        { id: 'users', label: '用户管理', icon: Users },
        { id: 'members', label: '会员管理', icon: Gem },
        { id: 'points', label: '积分管理', icon: Coins }
      ]
    },
    {
      id: 'content',
      name: '内容管理',
      icon: FolderOpen,
      items: [
        { id: 'projects', label: '项目管理', icon: FolderOpen },
        { id: 'files', label: '文件管理', icon: Folder },
        { id: 'knowledge', label: '知识库管理', icon: BookOpen }
      ]
    },
    {
      id: 'finance',
      name: '财务中心',
      icon: CreditCard,
      items: [
        { id: 'recharges', label: '充值记录', icon: Coins }
      ]
    },
    {
      id: 'ai',
      name: 'AI中心',
      icon: Bot,
      items: [
        { id: 'ai-logs', label: 'AI使用记录', icon: Bot }
      ]
    },
    {
      id: 'system',
      name: '系统管理',
      icon: Settings,
      items: [
        { id: 'admins', label: '管理员', icon: Shield },
        { id: 'logs', label: '操作日志', icon: ScrollText },
        { id: 'settings', label: '系统设置', icon: Settings }
      ]
    }
  ];

  const filteredGroups = adminRole === 'superadmin' 
    ? menuGroups 
    : menuGroups.filter(g => g.id !== 'system' || !g.items.some(i => i.id === 'admins'));

  const getPageTitle = () => {
    for (const group of filteredGroups) {
      const item = group.items.find(i => i.id === activeMenu);
      if (item) return item.label;
    }
    return '仪表盘';
  };

  const quickActions = [
    { label: '新建用户', icon: Plus, action: () => setActiveMenu('users') },
    { label: '新建项目', icon: FileText, action: () => setActiveMenu('projects') },
    { label: '充值积分', icon: Coins, action: () => setActiveMenu('recharges') },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <AdminDashboard onNavigate={setActiveMenu} />;
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
      default: return <AdminDashboard onNavigate={setActiveMenu} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex">
      {/* 侧边栏 - 极简设计 */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
        } bg-white border-r border-[#e5e7eb] flex flex-col transition-all duration-300`}
      >
        {/* Logo区域 */}
        <div className="h-[60px] border-b border-[#e5e7eb] flex items-center px-4 gap-3">
          <img src="/logo.svg" alt="Logo" className="h-7 w-auto flex-shrink-0" />
          {!sidebarCollapsed && (
            <span className="font-semibold text-[#111827] text-sm whitespace-nowrap">管理后台</span>
          )}
        </div>

        {/* 菜单区域 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {filteredGroups.map((group) => {
            const isCollapsed = collapsedGroups[group.id];
            const isActiveGroup = group.items.some(item => item.id === activeMenu);
            
            return (
              <div key={group.id} className="mb-1">
                {/* 分组标题 */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center px-4 py-2.5 text-left transition-colors hover:bg-[#f9fafb] ${
                    sidebarCollapsed ? 'justify-center' : 'justify-between'
                  }`}
                >
                  {sidebarCollapsed ? (
                    <group.icon className={`w-5 h-5 ${isActiveGroup ? 'text-[#7c3aed]' : 'text-[#6b7280]'}`} />
                  ) : (
                    <>
                      <div className={`flex items-center gap-2 ${isActiveGroup ? 'text-[#7c3aed]' : 'text-[#6b7280]'}`}>
                        <group.icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{group.name}</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-[#9ca3af] transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                    </>
                  )}
                </button>

                {/* 分组菜单项 */}
                {!isCollapsed && (
                  <div>
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveMenu(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                          sidebarCollapsed ? 'justify-center px-0' : 'px-4'
                        } ${
                          activeMenu === item.id
                            ? 'bg-[#7c3aed] text-white'
                            : 'text-[#6b7280] hover:bg-[#f3f4f6]'
                        }`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* 底部区域 */}
        <div className="border-t border-[#e5e7eb]">
          {!sidebarCollapsed && (
            <>
              <div className="px-4 py-3 text-[11px] text-[#9ca3af]">
                <div className="flex items-center gap-1">
                  <span>StratoMind</span>
                  <span className="text-[#d1d5db]">|</span>
                  <span>v2.0.0</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 折叠按钮 */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="border-t border-[#e5e7eb] h-10 flex items-center justify-center text-[#9ca3af] hover:text-[#7c3aed] hover:bg-[#f9fafb] transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航 - 极简设计 */}
        <header className="h-[60px] bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <h1 className="text-base font-semibold text-[#111827]">{getPageTitle()}</h1>
            
            {/* 快捷操作 */}
            <div className="hidden xl:flex items-center gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.action}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#7c3aed] bg-[#faf5ff] hover:bg-[#ede9fe] rounded-md transition-colors"
                >
                  <action.icon className="w-3.5 h-3.5" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* 右侧用户区域 */}
          <div className="flex items-center gap-4">
            {/* 搜索 */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#f9fafb] rounded-md border border-[#e5e7eb]">
              <Search className="w-4 h-4 text-[#9ca3af]" />
              <input 
                type="text" 
                placeholder="搜索..." 
                className="bg-transparent border-none outline-none text-sm text-[#374151] w-32 placeholder:text-[#9ca3af]"
              />
            </div>

            {/* 通知 */}
            <button className="relative p-2 text-[#6b7280] hover:text-[#7c3aed] hover:bg-[#f9fafb] rounded-md transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ef4444] rounded-full"></span>
            </button>

            {/* 用户菜单 */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 hover:bg-[#f9fafb] rounded-md transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-sm font-medium">
                  {adminUsername.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4 text-[#6b7280]" />
              </button>

              {/* 下拉菜单 */}
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg border border-[#e5e7eb] shadow-lg z-20 py-1">
                    <div className="px-4 py-3 border-b border-[#e5e7eb]">
                      <p className="text-sm font-medium text-[#111827]">{adminUsername}</p>
                      <p className="text-xs text-[#6b7280] mt-0.5">
                        {adminRole === 'superadmin' ? '超级管理员' : '管理员'}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>退出登录</span>
                    </button>
                  </div>
                </>
              )}
            </div>
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
