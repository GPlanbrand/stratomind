import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, ChevronLeft, Bell, Star, 
  Building2, Target, Users, FileText, Lightbulb, FolderOpen,
  Book, Bot, Plus, Briefcase
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
];

// 滚动容器样式 - 明确的 overflow-y-auto 和高度约束
const scrollContainerClassName = 'flex-1 overflow-y-auto overscroll-contain';

const Sidebar: React.FC<SidebarProps> = ({ user, collapsed, onToggleCollapse, currentProject }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectExpanded, setProjectExpanded] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      navigate('/projects/workspace/new');
      return;
    }
    navigate(`/projects/workspace/${projectId}?step=${step}`);
  };

  // 折叠状态
  if (collapsed) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-gray-200 flex flex-col z-40">
        {/* Logo */}
        <div className="h-14 flex items-center justify-center border-b border-gray-100 flex-shrink-0">
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

        {/* 可滚动区域 - 修复滚动问题的关键样式 */}
        <nav 
          ref={scrollRef}
          className={scrollContainerClassName}
          style={{ minHeight: 0 }}
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
      </aside>
    );
  }

  // 展开状态
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-40">
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

      {/* 
        可滚动区域 - 修复滚动问题的关键：
        1. flex-1: 占据flex容器的剩余空间
        2. overflow-y-auto: 内容超出时显示滚动条
        3. min-height: 0: flexbox中允许收缩的关键属性
        4. overscroll-contain: 防止滚动穿透到父元素
      */}
      <div 
        ref={scrollRef}
        className={scrollContainerClassName}
        style={{ minHeight: 0 }}
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
    </aside>
  );
};

export default Sidebar;
