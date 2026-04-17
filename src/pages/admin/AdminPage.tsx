import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FolderOpen, Gem, Coins, Bot, 
  Folder, BookOpen, ScrollText, Settings, ChevronLeft, ChevronRight, 
  Shield, ChevronDown, Plus, HelpCircle, Headphones, Zap
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

// 菜单分组配置
interface MenuGroup {
  id: string;
  name: string;
  icon: React.ElementType;
  items: { id: MenuItem; label: string; icon: React.ElementType }[];
  quickAction?: { label: string; icon: React.ElementType; onClick: () => void };
}

const API_BASE = '';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminRole, setAdminRole] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

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

  // 切换分组折叠状态
  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // 所有菜单分组
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
      ],
      quickAction: {
        label: '新建用户',
        icon: Plus,
        onClick: () => setActiveMenu('users')
      }
    },
    {
      id: 'content',
      name: '内容管理',
      icon: FolderOpen,
      items: [
        { id: 'projects', label: '项目管理', icon: FolderOpen },
        { id: 'files', label: '文件管理', icon: Folder },
        { id: 'knowledge', label: '知识库管理', icon: BookOpen }
      ],
      quickAction: {
        label: '新建项目',
        icon: Plus,
        onClick: () => setActiveMenu('projects')
      }
    },
    {
      id: 'finance',
      name: '财务中心',
      icon: Coins,
      items: [
        { id: 'recharges', label: '充值记录', icon: Coins }
      ],
      quickAction: {
        label: '充值积分',
        icon: Plus,
        onClick: () => setActiveMenu('recharges')
      }
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

  // 根据角色过滤菜单
  const filteredGroups = adminRole === 'superadmin' 
    ? menuGroups 
    : menuGroups.filter(g => g.id !== 'system' || !g.items.some(i => i.id === 'admins'));

  // 获取当前页面标题
  const getPageTitle = () => {
    for (const group of filteredGroups) {
      const item = group.items.find(i => i.id === activeMenu);
      if (item) return item.label;
    }
    return '仪表盘';
  };

  // 快捷操作
  const quickActions = [
    { label: '新建用户', icon: Plus, action: () => setActiveMenu('users') },
    { label: '新建项目', icon: Plus, action: () => setActiveMenu('projects') },
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm`}
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

        {/* 菜单区域 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {filteredGroups.map((group) => {
            const isCollapsed = collapsedGroups[group.id];
            const isActiveGroup = group.items.some(item => item.id === activeMenu);
            
            return (
              <div key={group.id} className="mb-2">
                {/* 分组标题 */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-all ${
                    sidebarOpen ? '' : 'justify-center'
                  }`}
                >
                  {sidebarOpen ? (
                    <>
                      <div className={`flex items-center gap-2 ${isActiveGroup ? 'text-purple-600' : 'text-gray-500'}`}>
                        <group.icon className="w-4 h-4" />
                        <span className={`text-xs font-medium ${isActiveGroup ? 'text-purple-600' : 'text-gray-400'}`}>
                          {group.name}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                    </>
                  ) : (
                    <group.icon className={`w-5 h-5 ${isActiveGroup ? 'text-purple-600' : 'text-gray-400'}`} />
                  )}
                </button>

                {/* 分组菜单项 */}
                <div className={`${isCollapsed ? 'hidden' : ''}`}>
                  {group.items.map((item) => (
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
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && (
                        <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>
                      )}
                    </button>
                  ))}

                  {/* 分组快捷操作 */}
                  {sidebarOpen && group.quickAction && (
                    <button
                      onClick={group.quickAction.onClick}
                      className="w-full flex items-center gap-2 px-4 py-2 ml-4 text-xs text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <group.quickAction.icon className="w-3 h-3" />
                      <span>{group.quickAction.label}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        {/* 底部区域 */}
        <div className="border-t border-gray-200">
          {sidebarOpen ? (
            <>
              {/* 帮助链接 */}
              <a href="#" className="flex items-center gap-2 px-4 py-3 text-gray-500 hover:text-purple-600 hover:bg-gray-50 transition-colors">
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm">帮助文档</span>
              </a>
              <a href="#" className="flex items-center gap-2 px-4 py-3 text-gray-500 hover:text-purple-600 hover:bg-gray-50 transition-colors">
                <Headphones className="w-4 h-4" />
                <span className="text-sm">在线客服</span>
              </a>
              {/* 版本信息 */}
              <div className="px-4 py-3 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <span>StratoMind</span>
                  <span className="text-gray-300">|</span>
                  <span>v2.0.0</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-3 gap-3">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <Headphones className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* 折叠按钮 */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="border-t border-gray-200 p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="w-4 h-4" />
            </>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
            {/* 快捷操作 */}
            <div className="hidden lg:flex items-center gap-2 ml-6">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.action}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <action.icon className="w-3.5 h-3.5" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
          
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
