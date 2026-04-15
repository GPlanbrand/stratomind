import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  FolderOpen, 
  Share2, 
  History, 
  ChevronRight,
  X,
  Menu,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  collapsed: boolean;
  isMobile?: boolean;
  onMenuClick?: () => void;
  projectName?: string;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const pageBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/projects': [{ label: '项目' }],
  '/projects/files': [{ label: '项目', path: '/projects' }, { label: '文件' }],
  '/projects/email': [{ label: '项目', path: '/projects' }, { label: '邮箱' }],
  '/projects/calendar': [{ label: '项目', path: '/projects' }, { label: '日程' }],
  '/projects/knowledge': [{ label: '项目', path: '/projects' }, { label: '知识库' }],
  '/projects/assistant': [{ label: '项目', path: '/projects' }, { label: 'AI助手' }],
  '/projects/member': [{ label: '项目', path: '/projects' }, { label: '会员中心' }],
};

const Header: React.FC<HeaderProps> = ({ collapsed, isMobile, onMenuClick, projectName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 获取当前面包屑
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    // 精确匹配
    if (pageBreadcrumbs[location.pathname]) {
      return pageBreadcrumbs[location.pathname];
    }
    // workspace页面不显示Header的面包屑（由WorkspacePage自己处理）
    if (location.pathname.includes('/workspace')) {
      return [];
    }
    // 其他前缀匹配
    for (const [path, items] of Object.entries(pageBreadcrumbs)) {
      if (location.pathname.startsWith(path + '/')) {
        return [...items, { label: '详情' }];
      }
    }
    return [{ label: '项目' }];
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('搜索:', searchQuery);
    }
  };

  // 移动端布局
  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4">
        {/* 左侧：汉堡菜单 + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <img src="/stratomind-logo.svg" alt="灵思" className="h-6" />
          </button>
        </div>

        {/* 右侧：搜索按钮 */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* 搜索展开层 */}
        {searchOpen && (
          <div className="fixed inset-0 top-14 bg-white z-50 p-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索..."
                  className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 桌面端布局
  return (
    <div 
      className={`fixed top-0 right-0 h-14 bg-white border-b border-gray-200 z-30 flex items-center justify-between transition-all duration-300 ${
        collapsed ? 'left-16' : 'left-60'
      }`}
    >
      {/* 左侧：面包屑导航 */}
      <div className="flex items-center px-4">
        <nav className="flex items-center gap-1">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-0.5" />
              )}
              {item.path ? (
                <button
                  onClick={() => navigate(item.path!)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-sm font-medium text-gray-900">
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* 右侧：功能按钮 */}
      <div className="flex items-center gap-1 px-4">
        {/* 搜索 */}
        <div className="relative">
          {searchOpen ? (
            <div className="flex items-center">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索..."
                  className="w-48 sm:w-64 h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
                  autoFocus
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="ml-1 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 h-9 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">搜索</span>
            </button>
          )}
        </div>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* 文件夹 */}
        <button
          onClick={() => navigate('/projects/files')}
          className="flex items-center gap-2 px-3 h-9 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
          title="文件"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">文件夹</span>
        </button>

        {/* 分享 */}
        <button
          className="flex items-center gap-2 px-3 h-9 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
          title="分享"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('链接已复制到剪贴板');
          }}
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">分享</span>
        </button>

        {/* 历史话题 */}
        <button
          className="flex items-center gap-2 px-3 h-9 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
          title="历史话题"
        >
          <History className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">历史</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
