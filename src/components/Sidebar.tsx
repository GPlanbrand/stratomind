import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, ChevronLeft, Bell, Star, Sparkles,
  Building2, Target, Users, FileText, Lightbulb, FolderOpen,
  Book, Bot, Plus, Briefcase, MessageSquare
} from 'lucide-react';
import { User } from '../types/user';
import { getProjects } from '../services/api';
import { Project } from '../types';

interface SidebarProps {
  user: User | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentProject?: {
    id: string;
    name: string;
  };
}

// 当前项目的五个步骤 - 对应 step 参数
const projectSteps = [
  { icon: Building2, label: '客户背景', step: 0 },
  { icon: Target, label: '项目需求', step: 1 },
  { icon: Users, label: '竞品分析', step: 2 },
  { icon: FileText, label: '创意简报', step: 3 },
  { icon: Lightbulb, label: '创意策略', step: 4 },
];

// 独立导航
const independentItems = [
  { icon: FolderOpen, label: '方案资产', path: '/projects/assets' },
  { icon: Book, label: '知识库', path: '/projects/knowledge' },
  { icon: Bot, label: 'AI助手', path: '/projects/assistant' },
  { icon: MessageSquare, label: '甲方翻译器', path: '/projects/requirement-parser' },
];

const Sidebar: React.FC<SidebarProps> = ({ user, collapsed, onToggleCollapse, currentProject }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectExpanded, setProjectExpanded] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 获取项目列表
  useEffect(() => {
    getProjects().then(setProjects).catch(console.error);
  }, []);

  // 当前项目：优先使用props传入的，否则使用列表第一个
  const activeProject = currentProject || projects[0];
  const projectId = activeProject?.id || '';
  const projectName = activeProject?.name || '暂无项目';

  // 检查当前步骤是否激活
  const isStepActive = (step: number) => {
    const params = new URLSearchParams(location.search);
    const currentStep = parseInt(params.get('step') || '0', 10);
    return location.pathname.includes('/workspace') && currentStep === step;
  };

  // 跳转到项目步骤
  const navigateToStep = (step: number) => {
    if (!activeProject) {
      // 没有项目，跳转到新建项目
      navigate('/projects/workspace/new');
      return;
    }
    navigate(`/projects/workspace/${projectId}?step=${step}`);
  };

  // 滚动事件处理 - 确保鼠标滚轮能正常滚动
  const handleWheel = useCallback((e: WheelEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // 如果已经滚动到边界，让事件继续传播
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    // 如果是向下滚动且已到底，或向上滚动且已在顶，且内容高度大于容器高度
    if ((e.deltaY > 0 && isAtBottom) || (e.deltaY < 0 && isAtTop)) {
      // 内容不足以滚动，不阻止事件
      if (scrollHeight <= clientHeight) {
        return;
      }
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // 滚动状态样式
  const scrollableContainerStyle: React.CSSProperties = {
    minHeight: 0,                        // Flexbox 中允许收缩的关键属性
    height: '100%',                      // 确保填满父容器
    overflowY: 'auto',                   // 允许垂直滚动
    overflowX: 'hidden',                 // 隐藏水平溢出
    overscrollBehavior: 'contain',       // 防止滚动链到父元素
    scrollbarWidth: 'thin',              // Firefox 细滚动条
    scrollbarColor: 'transparent transparent', // 隐藏滚动条（可选）
  };

  // 隐藏滚动条的 CSS（通过 webkit）
  const hideScrollbarCSS = `
    .sidebar-scroll::-webkit-scrollbar {
      width: 4px;
    }
    .sidebar-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .sidebar-scroll::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 4px;
    }
    .sidebar-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.25);
    }
  `;

  // 折叠状态
  if (collapsed) {
    return (
      <div className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-gray-200 flex flex-col z-40">
        {/* Logo */}
        <div className="p-2 border-b border-gray-100 flex items-center justify-center flex-shrink-0">
          <button 
            onClick={() => navigate('/projects')}
            className="p-1"
            title="灵思"
          >
            <img src="/favicon.svg" alt="灵思" className="h-6 w-6" />
          </button>
        </div>

        {/* 新建项目 */}
        <div className="p-2 flex-shrink-0">
          <button 
            onClick={() => navigate('/projects/workspace/new')}
            className="w-full flex items-center justify-center py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            title="新建项目"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* 当前项目 */}
        <div className="px-2 py-1 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => activeProject ? navigate(`/projects/workspace/${projectId}`) : navigate('/projects/workspace/new')}
            className="w-full flex items-center justify-center py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            title={projectName}
          >
            <Briefcase className="w-5 h-5 text-purple-500" />
          </button>
        </div>

        {/* 可滚动区域 */}
        <nav 
          className="flex-1 overflow-y-auto py-2 sidebar-scroll" 
          style={{ minHeight: 0, overscrollBehavior: 'contain' }}
          onWheel={(e) => e.stopPropagation()}
        >
          {projectSteps.map(item => (
            <button
              key={item.step}
              onClick={() => navigateToStep(item.step)}
              className={`w-full h-11 flex items-center justify-center ${
                isStepActive(item.step) 
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
        <div className="py-3 border-t border-gray-200 flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.username?.charAt(0)?.toUpperCase() || 'D'}
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
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
        <button onClick={() => navigate('/projects')} className="flex items-center gap-2">
          <img src="/stratomind-logo.svg" alt="灵思" className="h-7" />
        </button>
        <button onClick={onToggleCollapse} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 新建项目 */}
      <div className="p-3 border-b border-gray-100 flex-shrink-0">
        <button 
          onClick={() => navigate('/projects/workspace/new')}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">新建项目</span>
        </button>
      </div>

      {/* 可滚动区域 - 确保可以正常滚动 */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto sidebar-scroll"
        style={{ 
          minHeight: 0,
          overscrollBehavior: 'contain'
        }}
        onWheel={(e) => {
          // 阻止滚动穿透到主页面
          e.stopPropagation();
        }}
      >
        {/* 当前项目 */}
        <div className="px-3 py-2">
          <button 
            onClick={() => setProjectExpanded(!projectExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Briefcase className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-800 truncate">{projectName}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${projectExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          {/* 项目步骤 */}
          {projectExpanded && (
            <div className="mt-1 ml-2 space-y-0.5">
              {projectSteps.map(item => (
                <button
                  key={item.step}
                  onClick={() => navigateToStep(item.step)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isStepActive(item.step) 
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
      </div>

      {/* 用户区域 */}
      <div className="border-t border-gray-200 p-3 flex-shrink-0">
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
              {user?.username?.charAt(0)?.toUpperCase() || 'D'}
            </div>
            <span className="text-sm font-medium text-gray-800">{user?.username || 'DASU'}</span>
          </div>
          <button className="relative p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* 隐藏滚动条样式 */}
      <style>{hideScrollbarCSS}</style>
    </div>
  );
};

export default Sidebar;
