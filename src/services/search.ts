import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stratomind_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除登录状态
      localStorage.removeItem('stratomind_token')
      localStorage.removeItem('stratomind_current_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============ 搜索相关 API ============

export interface SearchResult {
  projects: Array<{ id: string; name: string; type: string; path: string }>
  knowledge: Array<{ id: string; title: string; type: string; path: string }>
  history: Array<{ id: string; content: string; type: string; path: string }>
}

export interface SearchResponse {
  success: boolean
  data: SearchResult
}

export async function search(
  query: string,
  type?: 'project' | 'knowledge' | 'history'
): Promise<SearchResponse> {
  const params = new URLSearchParams()
  params.append('q', query)
  if (type) params.append('type', type)
  
  const response = await api.get(`/search?${params.toString()}`)
  return response.data
}

export async function getSearchHistory(): Promise<{ success: boolean; data: any[] }> {
  const response = await api.get('/search/history')
  return response.data
}

export async function clearSearchHistory(): Promise<{ success: boolean; message: string }> {
  const response = await api.delete('/search/history')
  return response.data
}

// ============ 分享相关 API ============

export interface ShareLink {
  shareCode: string
  shareUrl: string
  projectId: string
  projectName?: string
  createdAt?: string
  expiresAt?: string
  viewCount?: number
  isExpired?: boolean
}

export async function createShareLink(
  projectId: string,
  projectName?: string,
  expiresInDays?: number
): Promise<{ success: boolean; data: ShareLink }> {
  const response = await api.post('/share', {
    projectId,
    projectName,
    expiresInDays: expiresInDays || 7,
  })
  return response.data
}

export async function getShareContent(
  shareCode: string
): Promise<{ success: boolean; data: any }> {
  const response = await api.get(`/share/${shareCode}`)
  return response.data
}

export async function verifyShareLink(
  shareCode: string
): Promise<{ success: boolean; data: { valid: boolean; projectName?: string; expiresAt?: string; error?: string } }> {
  const response = await api.get(`/share/${shareCode}/verify`)
  return response.data
}

export async function deleteShareLink(
  shareCode: string
): Promise<{ success: boolean; message: string }> {
  const response = await api.delete(`/share/${shareCode}`)
  return response.data
}

export async function getMyShareLinks(): Promise<{ success: boolean; data: ShareLink[] }> {
  const response = await api.get('/share')
  return response.data
}

// ============ AI 对话 API ============

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  message: string
  images?: string[]
  projectId?: string
  projectName?: string
  history?: ChatMessage[]
}

export interface ChatResponse {
  success: boolean
  data: {
    response: string
    provider?: string
  }
}

export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const response = await api.post('/ai/chat', request)
  return response.data
}

// 流式AI对话
export async function* streamChat(
  request: ChatRequest
): AsyncGenerator<{ content?: string; done?: boolean; error?: string }, void, unknown> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('stratomind_token')}`,
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json()
    yield { error: error.error || '请求失败' }
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    yield { error: '无法读取响应' }
    return
  }

  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        try {
          const parsed = JSON.parse(data)
          if (parsed.done) {
            yield { done: true }
          } else if (parsed.error) {
            yield { error: parsed.error }
          } else if (parsed.content) {
            yield { content: parsed.content }
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
}

// ============ 其他 API ============

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch (e) {
      document.body.removeChild(textarea)
      return false
    }
  }
}

export default api
