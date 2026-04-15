import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, ChevronLeft, Bell, Star, Sparkles,
  ClipboardList, Scan, Target, PenTool, FolderOpen,
  LayoutGrid, Settings, HelpCircle, Layers
} from 'lucide-react';
import { User } from '../types/user';

interface SidebarProps {
  user: User | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// 核心工作区
const workItems = [
  { icon: ClipboardList, label: '项目启动', path: '/projects/workspace', num: '01' },
  { 
    icon: Scan, label: '市场扫描', path: '/projects/market', num: '02',
    children: [
      { label: '竞品分析摘要', path: '/projects/market/competitors' },
      { label: '行业趋势简报', path: '/projects/market/trends' },
      { label: '受众画像初探', path: '/projects/market/audience' },
    ]
  },
  { 
    icon: Target, label: '策略中心', path: '/projects/strategy', num: '03',
    children: [
      { label: '定位推演', path: '/projects/strategy/positioning' },
      { label: '价值主张', path: '/projects/strategy/value' },
      { label: '品牌人格', path: '/projects/strategy/personality' },
    ]
  },
  { 
    icon: PenTool, label: '创意工坊', path: '/projects/creative', num: '04',
    children: [
      { label: '命名与口号', path: '/projects/creative/naming' },
      { label: '品牌故事', path: '/projects/creative/story' },
      { label: '内容点子库', path: '/projects/creative/ideas' },
    ]
  },
  { 
    icon: FolderOpen, label: '方案资产', path: '/projects/assets', num: '05',
    children: [
      { label: '完整简报预览', path: '/projects/assets/brief' },
      { label: '导出历史', path: '/projects/assets/exports' },
      { label: '我的收藏夹', path: '/projects/assets/favorites' },
    ]
  },
];

// 系统与辅助
const systemItems = [
  { icon: LayoutGrid, label: '全部项目', path: '/projects' },
  { icon: Settings, label: '使用偏好', path: '/projects/settings' },
  { icon: HelpCircle, label: '帮助与灵感', path: '/projects/help' },
];

const Sidebar: React.FC<SidebarProps> = ({ user, collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState<string[]>([]);

  const isActive = (path: string) => location.pathname.startsWith(path);
  const hasActiveChild = (children?: { path: string }[]) => 
    children?.some(c => location.pathname === c.path);

  const toggleExpand = (label: string) => {
    setExpanded(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  // 折叠状态
  if (collapsed) {
    return (
      <div className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-gray-200 flex flex-col z-40">
        <div className="h-14 flex items-center justify-center border-b border-gray-200">
          <Sparkles className="w-6 h-6 text-purple-600" />
        </div>
        
        <nav className="flex-1 py-3">
          {workItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full h-11 flex items-center justify-center ${
                isActive(item.path) || hasActiveChild(item.children) 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </nav>

        <div className="py-2 border-t border-gray-200">
          {systemItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full h-10 flex items-center justify-center ${
                location.pathname === item.path ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        <div className="py-3 border-t border-gray-200 flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <button onClick={onToggleCollapse} className="p-1 text-gray-400 hover:text-gray-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 展开状态
  return (
    <div className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
        <button onClick={() => navigate('/projects')} className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <span className="font-semibold text-gray-800">灵思</span>
        </button>
        <button onClick={onToggleCollapse} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 当前项目 */}
      <div className="px-3 py-3 border-b border-gray-100">
        <button className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl hover:bg-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate">新消费茶饮品牌全案</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </button>
      </div>

      {/* 核心工作区 */}
      <div className="px-3 pt-2 pb-1">
        <span className="text-xs font-medium text-gray-400 px-2">核心工作区</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {workItems.map(item => (
          <div key={item.path}>
            <button
              onClick={() => item.children ? toggleExpand(item.label) : navigate(item.path)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
                isActive(item.path) || hasActiveChild(item.children)
                  ? 'bg-purple-50 text-purple-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs text-gray-400 w-5 font-mono">{item.num}</span>
              <item.icon className="w-5 h-5" />
              <span className="text-sm flex-1 text-left">{item.label}</span>
              {item.children && (
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded.includes(item.label) ? 'rotate-180' : ''}`} />
              )}
            </button>
            
            {item.children && expanded.includes(item.label) && (
              <div className="ml-7 mt-1 space-y-0.5 mb-1">
                {item.children.map(child => (
                  <button
                    key={child.path}
                    onClick={() => navigate(child.path)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                      location.pathname === child.path 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* 系统与辅助 */}
      <div className="px-3 pt-2 pb-1 border-t border-gray-100">
        <span className="text-xs font-medium text-gray-400 px-2">系统与辅助</span>
      </div>
      
      <div className="px-2 pb-2 space-y-0.5">
        {systemItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${
              location.pathname === item.path ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 用户 */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl mb-2">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-gray-600">积分</span>
            <span className="text-xs font-semibold">{user?.points?.toLocaleString() || '272,922'}</span>
          </div>
          <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">升级</button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'D'}
            </div>
            <span className="text-sm font-medium text-gray-800">{user?.name || 'DASU'}</span>
          </div>
          <button className="relative p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
