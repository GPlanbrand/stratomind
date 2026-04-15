import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Folder, 
  Mail, 
  Calendar, 
  Book, 
  Bot, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bell,
  Star,
  Crown,
  Gift,
  LayoutGrid
} from 'lucide-react';
import { User } from '../types/user';

interface SidebarProps {
  user: User | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// 导航项配置
const navItems = [
  { icon: LayoutGrid, label: '项目', path: '/projects' },
  { icon: Folder, label: '文件', path: '/projects/files' },
  { icon: Mail, label: '邮箱', path: '/projects/email' },
  { icon: Calendar, label: '日程', path: '/projects/calendar' },
];

const futureItems = [
  { icon: Book, label: '知识库', path: '/projects/knowledge', badge: '即将上线' },
  { icon: Bot, label: 'AI助手', path: '/projects/assistant', badge: '即将上线' },
];

const Sidebar: React.FC<SidebarProps> = ({ user, collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 检查路径是否匹配
  const isActive = (path: string) => {
    if (path === '/projects') {
      return location.pathname === '/projects' || location.pathname === '/projects/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (collapsed) {
    // 折叠状态 - 仅显示图标
    return (
      <div className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-gray-200 flex flex-col z-40">
        {/* Logo区 */}
        <div className="h-14 flex items-center justify-center border-b border-gray-200">
          <Sparkles className="w-6 h-6 text-purple-600" />
        </div>

        {/* 导航图标 */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full h-12 flex items-center justify-center transition-colors ${
                isActive(item.path)
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
          
          <div className="my-3 mx-2 border-t border-gray-200" />
          
          {futureItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className="w-full h-12 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </nav>

        {/* 底部区域 */}
        <div className="py-4 border-t border-gray-200 flex flex-col items-center gap-2">
          <button
            onClick={() => navigate('/projects/member')}
            className="p-2 rounded-lg hover:bg-gray-100 text-amber-500 transition-colors"
            title="积分"
          >
            <Star className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="展开"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // 展开状态
  return (
    <div className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* 顶部品牌区 */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Sparkles className="w-6 h-6 text-purple-600" />
          <span className="text-base font-semibold text-gray-800">灵思</span>
        </button>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title="收起"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 功能导航区 */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {/* 主导航 */}
        <div className="px-3">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive(item.path)
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* 分隔线 */}
        <div className="mx-4 my-3 border-t border-gray-100" />

        {/* 未来功能 */}
        <div className="px-3">
          {futureItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
              <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                {item.badge}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* 积分与会员区 */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-gray-700">积分: {user?.points?.toLocaleString() || 0}</span>
          </div>
          <button
            onClick={() => navigate('/projects/member')}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-medium hover:from-amber-600 hover:to-orange-600 transition-colors"
          >
            <Crown className="w-3.5 h-3.5" />
            个人高阶版
          </button>
        </div>
      </div>

      {/* 邀请好友入口 */}
      <div className="px-3 pb-2">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
          <Gift className="w-4 h-4" />
          <span className="text-sm font-medium">邀请好友 领积分</span>
        </button>
      </div>

      {/* 底部通知区 */}
      <div className="px-3 py-3 border-t border-gray-200 flex items-center justify-end">
        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
