// 消息服务 - 与后端消息API交互

const API_BASE = '/api';

export interface Message {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'system' | 'project' | 'reminder' | 'news' | 'tip';
  link?: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high';
  metadata?: any;
  senderId?: string;
  createdAt: string;
  readAt?: string;
}

export interface MessageListResponse {
  messages: Message[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface LingsiProfile {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  description?: string;
  greeting?: string;
  systemPrompt?: string;
  settings?: any;
  isActive: boolean;
}

// 获取认证头
function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('stratomind_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// API请求封装
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...getAuthHeader(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// 获取消息列表
export async function getMessages(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  isRead?: boolean;
}): Promise<MessageListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));
  if (params?.type) queryParams.set('type', params.type);
  if (params?.isRead !== undefined) queryParams.set('isRead', String(params.isRead));

  const query = queryParams.toString();
  const url = `/messages${query ? `?${query}` : ''}`;
  
  return apiRequest<MessageListResponse>(url);
}

// 获取未读消息数量
export async function getUnreadCount(): Promise<number> {
  try {
    const response = await apiRequest<{ success: boolean; data: { count: number } }>('/messages/unread-count');
    return response.data?.count || 0;
  } catch (error) {
    console.error('获取未读消息数失败:', error);
    return 0;
  }
}

// 标记单条消息已读
export async function markAsRead(messageId: string): Promise<void> {
  await apiRequest(`/messages/${messageId}/read`, {
    method: 'PUT',
  });
}

// 标记所有消息已读
export async function markAllAsRead(): Promise<void> {
  await apiRequest('/messages/read-all', {
    method: 'PUT',
  });
}

// 删除消息
export async function deleteMessage(messageId: string): Promise<void> {
  await apiRequest(`/messages/${messageId}`, {
    method: 'DELETE',
  });
}

// 获取灵思Profile
export async function getLingsiProfile(): Promise<LingsiProfile> {
  const response = await apiRequest<{ success: boolean; data: LingsiProfile }>('/messages/profile/lingsi');
  return response.data;
}

// 更新灵思Profile (管理员)
export async function updateLingsiProfile(data: Partial<LingsiProfile>): Promise<LingsiProfile> {
  const response = await apiRequest<{ success: boolean; data: LingsiProfile }>('/messages/profile/lingsi', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

// 消息类型配置
export const MESSAGE_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  system: { label: '系统通知', color: 'blue', icon: '🔔' },
  project: { label: '项目动态', color: 'purple', icon: '📁' },
  reminder: { label: '待办提醒', color: 'orange', icon: '⏰' },
  news: { label: '行业资讯', color: 'green', icon: '📰' },
  tip: { label: '使用技巧', color: 'pink', icon: '💡' },
};

// 格式化时间
export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

// 获取消息类型样式
export function getMessageTypeStyles(type: string): {
  bg: string;
  text: string;
  border: string;
} {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    system: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    project: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    reminder: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    news: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    tip: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
  };
  
  return styles[type] || styles.system;
}
