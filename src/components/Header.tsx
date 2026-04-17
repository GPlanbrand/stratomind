import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  FolderOpen, 
  Share2, 
  ChevronRight,
  X,
  Menu,
  Folder,
  FileText,
  BookOpen,
  Clock,
  Loader2,
  Link,
  QrCode,
  Check,
  ExternalLink
} from 'lucide-react';
import FilesPanel from './FilesPanel';
import { getCurrentUser } from '../services/auth';
import { search, SearchResult, copyToClipboard } from '../services/search';

interface HeaderProps {
  collapsed: boolean;
  isMobile?: boolean;
  onMenuClick?: () => void;
  projectName?: string;
  projectId?: string;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectName?: string;
}

interface SearchDropdownProps {
  results: SearchResult;
  isLoading: boolean;
  onSelect: (path: string) => void;
  onClose: () => void;
}

// 分享模态框组件
const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, projectId, projectName }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && projectId) {
      generateShareLink();
    }
  }, [isOpen, projectId]);

  const generateShareLink = async () => {
    if (!projectId) {
      // 如果没有项目ID，使用当前URL
      setShareUrl(window.location.href);
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('stratomind_token')}`,
        },
        body: JSON.stringify({
          projectId,
          projectName: projectName || '灵思项目',
          expiresInDays: 7,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShareUrl(data.data.shareUrl);
      } else {
        setError(data.error || '生成分享链接失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">分享项目</h3>
              <p className="text-sm text-gray-500">{projectName || '当前页面'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
              <span className="ml-2 text-gray-500">生成分享链接...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={generateShareLink}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                重试
              </button>
            </div>
          ) : (
            <>
              {/* 分享链接 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分享链接
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
                    />
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      isCopied 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 二维码提示 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <QrCode className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">
                      分享链接有效期为 <span className="font-medium">7天</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      链接过期后可重新生成
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// 搜索下拉组件
const SearchDropdown: React.FC<SearchDropdownProps> = ({ results, isLoading, onSelect, onClose }) => {
  const hasResults = results.projects.length > 0 || results.knowledge.length > 0 || results.history.length > 0;

  return (
    <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
          <span className="ml-2 text-sm text-gray-500">搜索中...</span>
        </div>
      ) : hasResults ? (
        <div className="max-h-96 overflow-y-auto">
          {/* 项目 */}
          {results.projects.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase bg-gray-50">
                项目
              </div>
              {results.projects.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.path);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 truncate">{item.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* 知识库 */}
          {results.knowledge.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase bg-gray-50">
                知识库
              </div>
              {results.knowledge.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.path);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 truncate">{item.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* 历史记录 */}
          {results.history.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase bg-gray-50">
                最近搜索
              </div>
              {results.history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.path);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 truncate">{item.content}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">未找到相关结果</p>
        </div>
      )}
    </div>
  );
};

// Copy 图标组件（避免导入问题）
const Copy: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const pageBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/projects': [{ label: '项目' }],
  '/projects/files': [{ label: '项目', path: '/projects' }, { label: '文件' }],
  '/projects/email': [{ label: '项目', path: '/projects' }, { label: '邮箱' }],
  '/projects/calendar': [{ label: '项目', path: '/projects' }, { label: '日程' }],
  '/projects/knowledge': [{ label: '项目', path: '/projects' }, { label: '知识库' }],
  '/projects/assistant': [{ label: '项目', path: '/projects' }, { label: '文案助手' }],
  '/projects/member': [{ label: '项目', path: '/projects' }, { label: '会员中心' }],
};

const Header: React.FC<HeaderProps> = ({ collapsed, isMobile, onMenuClick, projectName, projectId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilesPanel, setShowFilesPanel] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<SearchResult>({ projects: [], knowledge: [], history: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  // 点击外部关闭搜索下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 获取当前面包屑
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (pageBreadcrumbs[location.pathname]) {
      return pageBreadcrumbs[location.pathname];
    }
    if (location.pathname.includes('/workspace')) {
      return [];
    }
    for (const [path, items] of Object.entries(pageBreadcrumbs)) {
      if (location.pathname.startsWith(path + '/')) {
        return [...items, { label: '详情' }];
      }
    }
    return [{ label: '项目' }];
  };

  const breadcrumbs = getBreadcrumbs();

  // 执行搜索
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ projects: [], knowledge: [], history: [] });
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const result = await search(query);
      setSearchResults(result.data);
      setShowSearchDropdown(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 搜索输入处理
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);

    // 防抖处理
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // 处理搜索提交
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  // 选择搜索结果
  const handleSelectResult = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  // 移动端布局
  if (isMobile) {
    return (
      <>
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

          {/* 分享按钮 */}
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索展开层 */}
        {searchOpen && (
          <div className="fixed inset-0 top-14 bg-white z-50 p-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="搜索项目、知识库..."
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

            {/* 搜索结果列表 */}
            {showSearchDropdown && (
              <div className="mt-4 max-h-96 overflow-y-auto">
                <SearchDropdown
                  results={searchResults}
                  isLoading={isSearching}
                  onSelect={handleSelectResult}
                  onClose={() => {
                    setShowSearchDropdown(false);
                    setSearchOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* 分享模态框 */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          projectId={projectId}
          projectName={projectName}
        />
      </>
    );
  }

  // 桌面端布局
  return (
    <>
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
          <div className="relative" ref={searchRef}>
            {searchOpen ? (
              <div className="flex items-center">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="搜索项目、知识库..."
                    className="w-48 sm:w-72 h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
                    autoFocus
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </form>
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                    setShowSearchDropdown(false);
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

            {/* 搜索下拉 */}
            {searchOpen && showSearchDropdown && (
              <SearchDropdown
                results={searchResults}
                isLoading={isSearching}
                onSelect={handleSelectResult}
                onClose={() => {
                  setShowSearchDropdown(false);
                  setSearchOpen(false);
                }}
              />
            )}
          </div>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* 文件夹 */}
          <button
            onClick={() => setShowFilesPanel(true)}
            className="flex items-center gap-2 px-3 h-9 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
            title="我的文件"
          >
            <Folder className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">文件</span>
          </button>

          {/* 分享 */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-3 h-9 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
            title="分享"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">分享</span>
          </button>
        </div>

        {/* 文件管理面板 */}
        {showFilesPanel && currentUser && (
          <FilesPanel
            isOpen={showFilesPanel}
            onClose={() => setShowFilesPanel(false)}
            userId={currentUser.id}
          />
        )}
      </div>

      {/* 分享模态框 */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectId={projectId}
        projectName={projectName}
      />
    </>
  );
};

export default Header;
