import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, ChevronLeft, Bell, Star, Sparkles,
  Building2, Target, Users, FileText, Lightbulb, FolderOpen,
  Book, Bot, Plus, Briefcase, MessageSquare, Image, Video,
  FileCheck, BarChart3, Settings, MoreHorizontal, Palette,
  Mic, FileEdit, GraduationCap, Calculator, Globe,
  Landmark, Building, Megaphone, Shield
} from 'lucide-react';
import { User } from '../types/user';
import { getProjects } from '../services/api';
import { Project } from '../types';
import { getUserRole } from '../services/auth';
import { RoleType, getRoleConfig, ROLE_CONFIGS } from '../config/roleConfig';

interface SidebarProps {
  user: User | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentProject?: {
    id: string;
    name: string;
  };
}

// 高频功能入口 - 全案策划导向
const quickActions = [
  { icon: Sparkles, label: '创建品牌全案', path: '/projects/workspace/new?type=brand', emoji: '✨', color: 'from-purple-500 to-pink-500' },
  { icon: Megaphone, label: '创建活动全案', path: '/projects/workspace/new?type=campaign', emoji: '📢', color: 'from-blue-500 to-cyan-500' },
  { icon: Target, label: '创建新品方案', path: '/projects/workspace/new?type=launch', emoji: '🎯', color: 'from-orange-500 to-red-500' },
  { icon: FileText, label: '创建内容全案', path: '/projects/workspace/new?type=content', emoji: '📝', color: 'from-green-500 to-emerald-500' },
];

// 更多工具
const moreTools = [
  { icon: Mic, label: '语音转文字', path: '/projects?type=voice', emoji: '🎙️' },
  { icon: GraduationCap, label: '学习助手', path: '/projects/assistant', emoji: '📚' },
  { icon: Calculator, label: '数据计算', path: '/projects?type=calc', emoji: '🔢' },
  { icon: Globe, label: '多语言翻译', path: '/projects?type=translate', emoji: '🌐' },
  { icon: Palette, label: '配色方案', path: '/projects?type=color', emoji: '🎨' },
];

// 当前项目的五个步骤
const projectSteps = [
  { icon: Building2, label: '客户背景', step: 0 },
  { icon: Target, label: '项目需求', step: 1 },
  { icon: Users, label: '竞品分析', step: 2 },
  { icon: FileText, label: '创意简报', step: 3 },
  { icon: Lightbulb, label: '创意策略', step: 4 },
];

// 后台管理功能
const adminItems = [
  { icon: FolderOpen, label: '方案资产', path: '/projects/files' },
  { icon: Book, label: '知识库', path: '/projects/knowledge' },
  { icon: Bot, label: '写作秘书', path: '/projects/assistant' },
  { icon: MessageSquare, label: '话术包装', path: '/projects/requirement-parser' },
  { icon: Settings, label: '个人设置', path: '/projects/member' },
];

// 根据角色获取功能菜单
const getRoleMenuItems = (role: RoleType | null) => {
  const config = role ? getRoleConfig(role) : null;
  
  if (!config) return adminItems;
  
  return config.features.map(feature => ({
    icon: getFeatureIcon(feature.id),
    label: feature.name,
    path: feature.path
  }));
};

// 获取功能图标
const getFeatureIcon = (featureId: string) => {
  const iconMap: Record<string, any> = {
    'client-translator': MessageSquare,
    'copy-writer': FileEdit,
    'creative-brief': FileText,
    'competitor-analysis': BarChart3,
    'strategy': Lightbulb,
    'social-calendar': Calendar,
    'wechat-manager': MessageSquare,
    'event-planner': Megaphone,
    'report-generator': BarChart3,
    'asset-manager': FolderOpen,
    'doc-format': FileCheck,
    'compliance-check': Shield,
    'submission-manager': FileEdit,
    'info-platform': Building,
    'approval-workflow': Shield,
  };
  return iconMap[featureId] || Bot;
};

const Sidebar: React.FC<SidebarProps> = ({ user, collapsed, onToggleCollapse, currentProject }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectExpanded, setProjectExpanded] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const moreToolsRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // 获取用户角色
  const userRole = getUserRole();
  const roleConfig = userRole ? getRoleConfig(userRole) : null;
  const menuItems = getRoleMenuItems(userRole);

  // 获取项目列表
  useEffect(() => {
    getProjects().then(setProjects).catch(console.error);
  }, []);

  // 点击外部关闭更多工具
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreToolsRef.current && !moreToolsRef.current.contains(event.target as Node)) {
        setShowMoreTools(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  // 滚动事件处理
  const handleWheel = useCallback((e: WheelEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if ((e.deltaY > 0 && isAtBottom) || (e.deltaY < 0 && isAtTop)) {
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
    minHeight: 0,
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    scrollbarWidth: 'thin',
    scrollbarColor: 'transparent transparent',
  };

  // 隐藏滚动条的CSS
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
    .quick-action-btn:hover .quick-action-bg {
      transform: scale(1.02);
    }
    .more-tools-dropdown {
      animation: slideIn 0.2s ease-out;
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  // 折叠状态 - 简化版
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

        {/* 快捷功能图标 */}
        <div className="px-1.5 py-2 flex-shrink-0">
          {quickActions.slice(0, 4).map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className="w-full h-11 flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-colors mb-1"
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
          <button
            onClick={() => setShowMoreTools(!showMoreTools)}
            className="w-full h-11 flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            title="更多工具"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* 更多工具弹出层 */}
        {showMoreTools && (
          <div 
            ref={moreToolsRef}
            className="more-tools-dropdown absolute left-full top-20 ml-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50"
          >
            {moreTools.map((tool, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(tool.path);
                  setShowMoreTools(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-purple-600 transition-colors"
              >
                <span className="text-base">{tool.emoji}</span>
                <span className="text-sm">{tool.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* 后台功能 */}
        <div className="flex-1 overflow-y-auto py-2 sidebar-scroll">
          <div className="my-2 mx-3 border-t border-gray-100" />
          {adminItems.slice(0, 3).map(item => (
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
        </div>

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

  // 展开状态 - 完整版
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

      {/* 快捷功能入口 - 核心优化 */}
      <div className="p-3 border-b border-gray-100 flex-shrink-0">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">
          常用功能
        </div>
        <div className="space-y-1">
          {quickActions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`quick-action-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                location.search.includes(item.path.split('?')[1])
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
          
          {/* 更多工具 */}
          <div className="relative" ref={moreToolsRef}>
            <button
              onClick={() => setShowMoreTools(!showMoreTools)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                showMoreTools ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-sm font-medium">更多工具...</span>
            </button>
            
            {/* 更多工具下拉 */}
            {showMoreTools && (
              <div className="more-tools-dropdown absolute left-full top-0 ml-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1 px-2">
                  工具箱
                </div>
                {moreTools.map((tool, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      navigate(tool.path);
                      setShowMoreTools(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    <span className="text-base">{tool.emoji}</span>
                    <span className="text-sm">{tool.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 可滚动区域 */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto sidebar-scroll"
        style={{ 
          minHeight: 0,
          overscrollBehavior: 'contain'
        }}
        onWheel={(e) => e.stopPropagation()}
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

        {/* 后台管理功能 */}
        <div className="px-3 py-2 border-t border-gray-100">
          {/* 角色指示器 */}
          {roleConfig && (
            <div className={`
              mb-2 px-3 py-2 rounded-lg text-xs font-medium
              ${userRole === 'ad_agency' ? 'bg-purple-50 text-purple-600' : ''}
              ${userRole === 'enterprise' ? 'bg-blue-50 text-blue-600' : ''}
              ${userRole === 'government' ? 'bg-red-50 text-red-600' : ''}
            `}>
              <div className="flex items-center gap-1.5">
                <span>{roleConfig.icon}</span>
                <span>{roleConfig.name}</span>
              </div>
            </div>
          )}
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1 px-1">
            {roleConfig ? '角色功能' : '管理功能'}
          </div>
          {menuItems.map((item, idx) => {
            // 处理图标可能是函数组件的情况
            const IconComponent = typeof item.icon === 'function' ? item.icon : item.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                  location.pathname === item.path ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {IconComponent && <IconComponent className="w-5 h-5" />}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
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
          <button 
            onClick={() => navigate('/projects/member')}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            升级
          </button>
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
