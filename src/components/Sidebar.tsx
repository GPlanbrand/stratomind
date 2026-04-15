import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, ChevronLeft, Bell, Star, Sparkles,
  Building2, Target, Users, FileText, Lightbulb, FolderOpen,
  Book, Bot, Plus
} from 'lucide-react';
import { User } from '../types/user';

interface SidebarProps {
  user: User | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// 当前项目的五个步骤
const projectSteps = [
  { icon: Building2, label: '客户背景', path: '/projects/workspace' },
  { icon: Target, label: '项目需求', path: '/projects/requirements' },
  { icon: Users, label: '竞品分析', path: '/projects/competitors' },
  { icon: FileText, label: '创意简报', path: '/projects/brief' },
  { icon: Lightbulb, label: '创意策略', path: '/projects/strategy' },
];

// 独立导航
const independentItems = [
  { icon: FolderOpen, label: '方案资产', path: '/projects/assets' },
  { icon: Book, label: '知识库', path: '/projects/knowledge' },
  { icon: Bot, label: 'AI助手', path: '/projects/assistant' },
];

const Sidebar: React.FC<SidebarProps> = ({ user, collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectExpanded, setProjectExpanded] = useState(true);

  const isActive = (path: string) => {
    if (path === '/projects/workspace') {
      return location.pathname === '/projects/workspace' || location.pathname.includes('/workspace');
    }
    return location.pathname.startsWith(path);
  };

  // 折叠状态
  if (collapsed) {
    return (
      <div className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-gray-200 flex flex-col z-40">
        {/* 新建项目 */}
        <div className="p-2 border-b border-gray-100">
          <button 
            onClick={() => navigate('/projects/workspace/new')}
            className="w-full flex items-center justify-center py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            title="新建项目"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* 项目步骤 */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {projectSteps.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full h-11 flex items-center justify-center ${
                isActive(item.path) 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
          
          <div className="my-2 mx-3 border-t border-gray-100" />
          
          {independentItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full h-11 flex items-center justify-center ${
                location.pathname === item.path ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:bg-gray-50'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </nav>

        {/* 用户 */}
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

      {/* 新建项目 */}
      <div className="p-3 border-b border-gray-100">
        <button 
          onClick={() => navigate('/projects/workspace/new')}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">新建项目</span>
        </button>
      </div>

      {/* 当前项目 */}
      <div className="px-3 py-2">
        <button 
          onClick={() => setProjectExpanded(!projectExpanded)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-800 truncate">烟火序肥牛火锅</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${projectExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        {/* 项目步骤 */}
        {projectExpanded && (
          <div className="mt-1 ml-2 space-y-0.5">
            {projectSteps.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isActive(item.path) 
                    ? 'bg-purple-50 text-purple-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 独立导航 */}
      <div className="px-3 py-2 border-t border-gray-100">
        {independentItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${
              location.pathname === item.path ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 弹性空间 */}
      <div className="flex-1" />

      {/* 用户区域 */}
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
