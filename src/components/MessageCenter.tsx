import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Mail,
  FolderOpen,
  Clock,
  Newspaper,
  Lightbulb,
  AlertCircle,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  Message,
  getMessages,
  markAsRead,
  markAllAsRead,
  deleteMessage,
  getUnreadCount,
  formatMessageTime,
  getMessageTypeStyles,
  MESSAGE_TYPE_CONFIG,
  LingsiProfile,
  getLingsiProfile,
} from '../services/message';

interface MessageCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessageCenter: React.FC<MessageCenterProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lingsiProfile, setLingsiProfile] = useState<LingsiProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 加载消息
  const loadMessages = useCallback(async (resetPage = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const params: any = { page: currentPage, pageSize: 20 };
      
      if (filterType !== 'all') {
        params.type = filterType;
      }

      const response = await getMessages(params);
      const newMessages = response.messages || [];
      
      if (resetPage) {
        setMessages(newMessages);
        setPage(1);
      } else {
        setMessages(prev => [...prev, ...newMessages]);
      }
      
      setHasMore(currentPage < response.pagination.totalPages);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('加载消息失败:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, page, filterType]);

  // 加载灵思Profile
  const loadLingsiProfile = async () => {
    try {
      const profile = await getLingsiProfile();
      setLingsiProfile(profile);
    } catch (error) {
      console.error('加载灵思Profile失败:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages(true);
      loadLingsiProfile();
    }
  }, [isOpen]);

  // 处理筛选变化
  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setPage(1);
    setLoading(true);
    loadMessages(true);
  };

  // 标记已读
  const handleMarkAsRead = async (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(messageId);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  // 全部标记已读
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('标记全部已读失败:', error);
    }
  };

  // 删除消息
  const handleDelete = async (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMessage(messageId);
      const deletedMsg = messages.find(m => m.id === messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      if (deletedMsg && !deletedMsg.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('删除消息失败:', error);
    }
  };

  // 点击消息
  const handleMessageClick = (message: Message) => {
    if (!message.isRead) {
      handleMarkAsRead(message.id, {} as React.MouseEvent);
    }
    if (message.link) {
      navigate(message.link);
      onClose();
    }
  };

  // 加载更多
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadMessages(false);
    }
  };

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      system: <Bell className="w-4 h-4" />,
      project: <FolderOpen className="w-4 h-4" />,
      reminder: <Clock className="w-4 h-4" />,
      news: <Newspaper className="w-4 h-4" />,
      tip: <Lightbulb className="w-4 h-4" />,
    };
    return icons[type] || icons.system;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 消息面板 */}
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
        {/* 头部 */}
        <div className="flex-shrink-0 px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 灵思头像 */}
              <div className="relative">
                {lingsiProfile?.avatar ? (
                  <img
                    src={lingsiProfile.avatar}
                    alt={lingsiProfile.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}
                {/* 在线状态 */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {lingsiProfile?.name || '灵思'}
                </h2>
                <p className="text-xs text-gray-500">
                  {lingsiProfile?.title || '您的智能创意伙伴'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 快捷操作 */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              全部已读
            </button>
            <div className="flex-1" />
            <button
              onClick={() => loadMessages(true)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              title="刷新"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 筛选标签 */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 bg-white overflow-x-auto">
          <div className="flex gap-2">
            <FilterTab
              active={filterType === 'all'}
              onClick={() => handleFilterChange('all')}
            >
              全部
              {unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </FilterTab>
            {Object.entries(MESSAGE_TYPE_CONFIG).map(([type, config]) => (
              <FilterTab
                key={type}
                active={filterType === type}
                onClick={() => handleFilterChange(type)}
              >
                {config.icon} {config.label}
              </FilterTab>
            ))}
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto">
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Mail className="w-12 h-12 mb-3 opacity-50" />
              <p>暂无消息</p>
              <p className="text-sm mt-1">有新消息时会在这里显示</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {messages.map((message) => {
                  const styles = getMessageTypeStyles(message.type);
                  const config = MESSAGE_TYPE_CONFIG[message.type];

                  return (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`relative px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !message.isRead ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      {/* 未读指示器 */}
                      {!message.isRead && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                      )}

                      <div className="flex gap-3 pl-2">
                        {/* 类型图标 */}
                        <div className={`flex-shrink-0 w-9 h-9 rounded-full ${styles.bg} ${styles.text} flex items-center justify-center`}>
                          {getTypeIcon(message.type)}
                        </div>

                        {/* 内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`text-sm font-medium truncate ${!message.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {message.title}
                            </h3>
                            <span className="flex-shrink-0 text-xs text-gray-400">
                              {formatMessageTime(message.createdAt)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {message.content}
                          </p>

                          {/* 类型标签和操作 */}
                          <div className="flex items-center justify-between mt-2">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}>
                              {config?.icon} {config?.label}
                            </span>

                            {/* 操作按钮 */}
                            <div className="flex items-center gap-1">
                              {!message.isRead && (
                                <button
                                  onClick={(e) => handleMarkAsRead(message.id, e)}
                                  className="p-1.5 hover:bg-white rounded-lg transition-colors"
                                  title="标记已读"
                                >
                                  <Check className="w-4 h-4 text-gray-400 hover:text-green-500" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDelete(message.id, e)}
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                              </button>
                              {message.link && (
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 加载更多 */}
              {hasMore && (
                <div className="p-4 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        加载中...
                      </span>
                    ) : (
                      '加载更多消息'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 底部灵思入口 */}
        <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <button
            onClick={() => {
              onClose();
              // 可以跳转到灵思对话页面
              navigate('/ai');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-shadow"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">与灵思对话</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 筛选标签组件
interface FilterTabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const FilterTab: React.FC<FilterTabProps> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-full transition-colors ${
      active
        ? 'bg-purple-100 text-purple-700 font-medium'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

export default MessageCenter;
