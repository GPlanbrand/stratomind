import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Paperclip, Mic, X, Sparkles, ChevronUp, 
  Copy, Check, MicOff, RotateCcw, FileImage, MessageSquare,
  FileText, BarChart3, Target, ClipboardCheck, Search,
  At, ChevronDown
} from 'lucide-react';

const STORAGE_KEY = 'stratomind_ai_messages';

// 快捷指令类型
interface QuickCommand {
  id: string;
  trigger: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  description: string;
}

const QUICK_COMMANDS: QuickCommand[] = [
  {
    id: 'requirement',
    trigger: '@需求确认单',
    label: '需求确认单',
    icon: <ClipboardCheck className="w-4 h-4" />,
    prompt: '请帮我生成一份项目需求确认单，包含以下内容：\n1. 项目基本信息（项目名称、客户名称、行业）\n2. 项目目标与KPI\n3. 目标受众描述\n4. 核心信息/价值主张\n5. 预算与时间要求\n6. 交付物清单',
    description: '生成标准化的需求确认文档'
  },
  {
    id: 'competitor',
    trigger: '@竞品分析',
    label: '竞品分析',
    icon: <Search className="w-4 h-4" />,
    prompt: '请对以下竞品进行深度分析：\n1. 品牌定位与核心价值主张\n2. 目标受众分析\n3. 产品/服务差异化亮点\n4. 传播策略与渠道布局\n5. 可借鉴之处与差异化机会\n\n请给出结构化的分析报告。',
    description: '分析竞品数据，输出结构化报告'
  },
  {
    id: 'strategy',
    trigger: '@策略方案',
    label: '策略方案',
    icon: <Target className="w-4 h-4" />,
    prompt: '请基于项目背景，生成完整的营销策略方案：\n1. 市场洞察与机会分析\n2. 品牌定位与核心策略主张\n3. 目标人群画像\n4. 传播主轴与创意方向\n5. 媒介渠道策略\n6. 执行节奏与预算分配建议',
    description: '生成完整的营销策略方案'
  },
  {
    id: 'brief',
    trigger: '@创意简报',
    label: '创意简报',
    icon: <FileText className="w-4 h-4" />,
    prompt: '请撰写一份创意简报，包含：\n1. 创意背景与挑战\n2. 核心创意概念\n3. 创意表现形式建议\n4. 视觉风格参考\n5. 传播渠道适配\n6. 效果预期与评估指标',
    description: '撰写专业的创意简报文档'
  }
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: number;
}

interface AIDialogProps {
  projectId?: string;
  projectName?: string;
  onAction?: (action: string, data?: any) => void;
}

const AIDialog: React.FC<AIDialogProps> = ({ projectId, projectName, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  
  // @指令相关状态
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<QuickCommand[]>(QUICK_COMMANDS);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const commandMenuRef = useRef<HTMLDivElement>(null);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 加载历史消息
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMessages(parsed);
      } catch (e) {
        console.error('Failed to load messages:', e);
      }
    } else {
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: '你好！我是灵思AI创意助手 ✨\n\n我可以帮你：\n• 生成需求确认单、竞品分析\n• 撰写策略方案、创意简报\n• 分析数据、撰写文案\n\n输入 @ 可以快速触发快捷指令，或直接描述你的需求~',
        timestamp: Date.now()
      }]);
    }
  }, []);

  // 保存消息到本地
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // 点击外部关闭命令菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (commandMenuRef.current && !commandMenuRef.current.contains(e.target as Node)) {
        setShowCommandMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 调整输入框高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  // 处理输入变化 - 检测@触发
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    adjustTextareaHeight();
    
    // 检测@触发
    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1);
      // 检查@后面是否为空或只包含字母数字
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        // 过滤匹配的指令
        const filtered = QUICK_COMMANDS.filter(cmd => 
          cmd.trigger.toLowerCase().includes(textAfterAt.toLowerCase()) ||
          cmd.label.includes(textAfterAt)
        );
        setFilteredCommands(filtered);
        setShowCommandMenu(true);
        
        // 计算菜单位置
        if (textareaRef.current) {
          const rect = textareaRef.current.getBoundingClientRect();
          setMenuPosition({
            top: rect.top - 10,
            left: rect.left + 20
          });
        }
        return;
      }
    }
    
    setShowCommandMenu(false);
  };

  // 选择快捷指令
  const selectCommand = (command: QuickCommand) => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = input.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    // 替换@及其后面的文字为指令提示
    const newInput = input.slice(0, atIndex) + command.prompt;
    setInput(newInput);
    setShowCommandMenu(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newInput.length;
      }
    }, 0);
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = '';
  };

  // 移除图片
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // 复制消息
  const copyMessage = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // 发送消息 - 支持流式响应
  const handleSend = async () => {
    if ((!input.trim() && images.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      images: images.length > 0 ? images : undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    const currentImages = [...images];
    setInput('');
    setImages([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);
    setStreamingContent('');
    setShowCommandMenu(false);

    // 创建AI消息占位符
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, assistantMessage]);

    // 创建 AbortController
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('stratomind_token')}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          message: currentInput,
          images: currentImages,
          projectId,
          projectName,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.content) {
                fullContent += parsed.content;
                setStreamingContent(fullContent);
                // 实时更新消息内容
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullContent }
                    : msg
                ));
              }
              
              if (parsed.done) {
                setIsLoading(false);
                if (parsed.data?.action && onAction) {
                  onAction(parsed.data.action, parsed.data.data);
                }
              }
              
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      // 确保消息内容完整
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: fullContent || '抱歉，我遇到了一些问题，请稍后再试。' }
          : msg
      ));

    } catch (error: any) {
      console.error('AI request failed:', error);
      
      // 如果是被用户取消，不显示错误
      if (error.name === 'AbortError') {
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
        return;
      }
      
      // 更新错误消息
      const errorContent = error.message || '网络错误，请检查网络连接后重试。';
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: errorContent.includes('API') || errorContent.includes('Key') 
              ? 'AI服务未配置或配置错误，请联系管理员配置 DEEPSEEK_API_KEY 或 DOUBAO_API_KEY' 
              : errorContent }
          : msg
      ));
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  // 停止生成
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // 语音输入
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音输入');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isRecording) {
      recognition.start();
      setIsRecording(true);
    } else {
      recognition.stop();
      setIsRecording(false);
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  // 键盘发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    
    // 命令菜单导航
    if (showCommandMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = filteredCommands.findIndex(c => c.id === filteredCommands[0]?.id);
        if (currentIndex < filteredCommands.length - 1) {
          setFilteredCommands([filteredCommands[currentIndex + 1]]);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = filteredCommands.findIndex(c => c.id === filteredCommands[0]?.id);
        if (currentIndex > 0) {
          setFilteredCommands([filteredCommands[currentIndex - 1]]);
        }
      } else if (e.key === 'Escape') {
        setShowCommandMenu(false);
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        if (filteredCommands.length > 0) {
          e.preventDefault();
          selectCommand(filteredCommands[0]);
        }
      }
    }
  };

  // 粘贴图片
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              setImages(prev => [...prev, result]);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // 清空对话
  const handleClear = () => {
    if (confirm('确定要清空当前对话吗？')) {
      localStorage.removeItem(STORAGE_KEY);
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: '对话已清空。有什么可以帮你的吗？\n\n输入 @ 可以快速触发快捷指令~',
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${isExpanded ? 'h-[70vh] sm:h-[60vh]' : 'h-auto'}`}>
      {/* 展开/收起按钮 - 模仿扣子风格 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute left-1/2 -translate-x-1/2 -top-12 w-28 h-10 bg-white rounded-t-xl shadow-lg flex items-center justify-center gap-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors border border-b-0 border-gray-200 rounded-b-lg"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-medium">文案助手</span>
        <ChevronUp className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* 主对话框 - 模仿扣子风格 */}
      <div className="bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] flex flex-col h-full rounded-t-2xl">
        {/* 展开时的头部 */}
        {isExpanded && (
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">灵思AI创意助手</h3>
                <p className="text-xs text-gray-500">{projectName || '当前项目'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="清空对话"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 消息区域 */}
        {isExpanded && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                  {/* 头像 */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-violet-100 text-violet-600' 
                      : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                  }`}>
                    {msg.role === 'user' ? (
                      <span className="text-xs font-bold">我</span>
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* 消息内容 */}
                  <div className="space-y-2">
                    {/* 图片预览 */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 max-w-[200px]">
                        {msg.images.map((img, idx) => (
                          <img key={idx} src={img} alt="参考图" className="w-20 h-20 object-cover rounded-xl shadow-sm" />
                        ))}
                      </div>
                    )}
                    
                    {/* 文字消息 */}
                    {msg.content && (
                      <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        {/* 光标闪烁效果（流式输出时） */}
                        {msg.role === 'assistant' && isLoading && msg.content === streamingContent && (
                          <span className="inline-block w-2 h-4 bg-violet-500 ml-1 animate-pulse" />
                        )}
                      </div>
                    )}
                    
                    {/* 操作按钮 */}
                    {msg.role === 'assistant' && msg.content && !isLoading && (
                      <div className="flex items-center gap-1 pl-1">
                        <button
                          onClick={() => copyMessage(msg.content, msg.id)}
                          className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
                          title="复制"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* 加载指示器 */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-gray-500">AI正在思考...</span>
                  {/* 停止按钮 */}
                  <button
                    onClick={handleStop}
                    className="ml-2 px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    停止
                  </button>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* 图片预览区域 */}
        {images.length > 0 && isExpanded && (
          <div className="px-4 py-2 border-t border-gray-100 flex gap-2 overflow-x-auto flex-shrink-0 bg-gray-50/50">
            {images.map((img, idx) => (
              <div key={idx} className="relative flex-shrink-0 group">
                <img src={img} alt="预览" className="w-14 h-14 object-cover rounded-xl shadow-sm" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 输入区域 - 模仿扣子风格 */}
        <div className={`px-4 py-3 flex-shrink-0 ${!isExpanded ? 'max-w-3xl mx-auto w-full' : ''}`}>
          <div className={`flex items-end gap-2 ${isExpanded ? 'bg-gray-100 rounded-2xl px-4 py-2' : ''}`}>
            {/* 上传图片按钮 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors flex-shrink-0 ${isRecording ? 'opacity-50' : ''}`}
              title="上传参考图"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* 输入框 */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题，或使用 @ 触发快捷指令..."
                rows={1}
                className="w-full bg-transparent resize-none outline-none text-gray-700 placeholder-gray-400 min-h-[24px] max-h-[120px] leading-relaxed"
              />
              
              {/* @快捷指令菜单 */}
              {showCommandMenu && filteredCommands.length > 0 && (
                <div 
                  ref={commandMenuRef}
                  className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  style={{ 
                    maxHeight: '280px',
                    overflowY: 'auto'
                  }}
                >
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">快捷指令</p>
                  </div>
                  {filteredCommands.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => selectCommand(cmd)}
                      className="w-full px-3 py-2.5 flex items-start gap-3 hover:bg-violet-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                        {cmd.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{cmd.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cmd.description}</p>
                      </div>
                      <span className="text-xs text-violet-600 font-medium flex-shrink-0">{cmd.trigger}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 语音输入按钮 */}
            {isMobile && (
              <button
                onClick={handleVoiceInput}
                className={`p-2 rounded-xl transition-colors flex-shrink-0 ${
                  isRecording
                    ? 'text-red-500 bg-red-50 animate-pulse'
                    : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50'
                }`}
                title="语音输入"
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            {/* 发送/停止按钮 */}
            {isLoading ? (
              <button
                onClick={handleStop}
                className="p-2.5 rounded-xl transition-all flex-shrink-0 bg-red-500 text-white hover:bg-red-600 shadow-sm"
                title="停止生成"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={(!input.trim() && images.length === 0) || isLoading}
                className={`p-2.5 rounded-xl transition-all flex-shrink-0 shadow-sm ${
                  input.trim() || images.length > 0
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:shadow-md'
                    : 'bg-gray-200 text-gray-400'
                } disabled:cursor-not-allowed disabled:shadow-none`}
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 快捷提示 */}
          {isExpanded && !input.trim() && images.length === 0 && !isLoading && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">试试：</span>
              {['@需求确认单', '@竞品分析', '@策略方案', '@创意简报'].map((tip) => (
                <button
                  key={tip}
                  onClick={() => {
                    const cmd = QUICK_COMMANDS.find(c => c.trigger === tip);
                    if (cmd) selectCommand(cmd);
                  }}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-violet-50 hover:text-violet-600 text-gray-600 rounded-full transition-colors"
                >
                  {tip}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDialog;
