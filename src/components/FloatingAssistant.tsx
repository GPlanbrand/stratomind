/**
 * 灵思AI助手 - 浮动机器人
 * 版本: V1.0
 * 定位: 品牌策划副驾驶
 * 功能: 场景感知、主动引导、任务串联
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, Send, Sparkles, Lightbulb, Search, FileText, Target, Zap } from 'lucide-react';

// ==================== 类型定义 ====================

type AssistantState = 'silent' | 'guide' | 'dialog';

interface GuideBubble {
  id: string;
  icon: React.ReactNode;
  text: string;
  action: string;
  autoTrigger?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SceneContext {
  page: string;
  projectId?: string;
  selectedText?: string;
  focusedField?: string;
  idleTime?: number;
}

// ==================== 场景配置 ====================

const SCENE_TRIGGERS: Record<string, {
  condition: (ctx: SceneContext) => boolean;
  bubble: GuideBubble;
}> = {
  // 01 项目启动 - 停留30秒未操作
  projectStart: {
    condition: (ctx) => ctx.page === 'workspace' && ctx.idleTime && ctx.idleTime > 30000,
    bubble: {
      id: 'project-start',
      icon: <Target className="w-4 h-4" />,
      text: '需要我帮你梳理项目背景框架吗？',
      action: 'guide-brief'
    }
  },
  // 02 市场扫描 - 选中竞品数据
  competitorSelected: {
    condition: (ctx) => ctx.page === 'competitor' && !!ctx.selectedText,
    bubble: {
      id: 'competitor-analyze',
      icon: <Search className="w-4 h-4" />,
      text: '深度分析此竞品的营销策略？',
      action: 'analyze-competitor'
    }
  },
  // 03 策略中心 - 光标停在价值主张
  strategyFocus: {
    condition: (ctx) => ctx.page === 'strategy' && ctx.focusedField === 'valueProposition',
    bubble: {
      id: 'value-proposition',
      icon: <Lightbulb className="w-4 h-4" />,
      text: '提供3个价值主张草案？',
      action: 'generate-value'
    }
  },
  // 05 方案资产 - 进入页面
  assetsPage: {
    condition: (ctx) => ctx.page === 'assets',
    bubble: {
      id: 'export-ppt',
      icon: <FileText className="w-4 h-4" />,
      text: '一键生成PPT大纲？',
      action: 'export-ppt',
      autoTrigger: true
    }
  }
};

// 快捷指令映射
const QUICK_COMMANDS: Record<string, { description: string; action: string }> = {
  '@生成定位': { description: '快速跳转策略中心', action: 'goto-strategy' },
  '@分析竞品': { description: '分析指定竞品', action: 'analyze-competitor' },
  '@输出简报': { description: '一键汇总项目简报', action: 'export-brief' },
  '@对比方案': { description: '对比两个版本策略', action: 'compare-versions' }
};

// ==================== 主组件 ====================

const FloatingAssistant: React.FC = () => {
  const location = useLocation();
  
  // 状态
  const [state, setState] = useState<AssistantState>('silent');
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '你好！我是灵思AI助手，你的品牌策划副驾驶。有什么可以帮你的吗？', timestamp: new Date() }
  ]);
  const [currentBubble, setCurrentBubble] = useState<GuideBubble | null>(null);
  const [sceneContext, setSceneContext] = useState<SceneContext>({ page: '' });
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // ==================== 场景感知 ====================

  // 检测当前页面
  useEffect(() => {
    const path = location.pathname;
    let page = 'unknown';
    
    if (path.includes('/workspace')) {
      const step = new URLSearchParams(location.search).get('step');
      page = step === '0' ? 'client-info' :
             step === '1' ? 'requirements' :
             step === '2' ? 'competitor' :
             step === '3' ? 'brief' :
             step === '4' ? 'strategy' : 'workspace';
    } else if (path.includes('/assets')) {
      page = 'assets';
    } else if (path.includes('/knowledge')) {
      page = 'knowledge';
    }
    
    setSceneContext(prev => ({ ...prev, page }));
  }, [location]);

  // 检测用户活动（用于idle检测）
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // 每5秒检查一次idle状态
    idleTimerRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      setSceneContext(prev => ({ ...prev, idleTime }));
    }, 5000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
      }
    };
  }, []);

  // 检测选中文本
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim() || '';
      setSceneContext(prev => ({ ...prev, selectedText }));
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  // 根据场景触发引导气泡
  useEffect(() => {
    if (state === 'dialog') return; // 对话中不触发引导

    const trigger = Object.values(SCENE_TRIGGERS).find(t => t.condition(sceneContext));
    
    if (trigger && trigger.bubble.id !== currentBubble?.id) {
      setCurrentBubble(trigger.bubble);
      setState('guide');
    }
  }, [sceneContext, state, currentBubble]);

  // ==================== 交互逻辑 ====================

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && 
          containerRef.current && 
          buttonRef.current &&
          !containerRef.current.contains(e.target as Node) &&
          !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setState('silent');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 打开对话框
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setState('dialog');
    setCurrentBubble(null);
  }, []);

  // 点击引导气泡
  const handleBubbleClick = useCallback((bubble: GuideBubble) => {
    handleOpen();
    
    // 执行对应动作
    executeAction(bubble.action, bubble.text);
  }, [handleOpen]);

  // 执行动作
  const executeAction = useCallback((action: string, context?: string) => {
    let response = '';
    
    switch (action) {
      case 'guide-brief':
        response = '好的，我们来梳理项目背景。请告诉我：\n1. 这是什么行业的项目？\n2. 品牌的核心特点是什么？';
        break;
      case 'analyze-competitor':
        response = `正在分析"${sceneContext.selectedText || '竞品'}"的营销策略...\n\n主要发现：\n• 品牌定位清晰\n• 目标人群精准\n• 传播渠道多样化`;
        break;
      case 'generate-value':
        response = '基于项目信息，为你生成3个价值主张草案：\n\n1. "让每一口都是新鲜体验"\n2. "品质生活，从这一刻开始"\n3. "专注细节，成就卓越"';
        break;
      case 'export-ppt':
        response = '已为你生成PPT大纲：\n\n1. 项目背景\n2. 市场分析\n3. 竞品洞察\n4. 策略定位\n5. 创意方案\n6. 执行规划';
        break;
      case 'goto-strategy':
        response = '正在跳转到策略中心...';
        // window.location.href = '/projects/workspace?step=4';
        break;
      case 'export-brief':
        response = '正在汇总项目简报...\n\n已完成！简报包含：\n• 客户背景\n• 项目需求\n• 竞品分析\n• 策略定位';
        break;
      default:
        response = `收到指令：${action}`;
    }
    
    if (context) {
      setMessages(prev => [...prev, 
        { role: 'user', content: context, timestamp: new Date() }
      ]);
    }
    
    setTimeout(() => {
      setMessages(prev => [...prev, 
        { role: 'assistant', content: response, timestamp: new Date() }
      ]);
    }, 500);
  }, [sceneContext]);

  // 发送消息
  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    
    const userInput = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userInput, timestamp: new Date() }]);
    setInput('');
    
    // 检查快捷指令
    const quickCommand = Object.keys(QUICK_COMMANDS).find(cmd => userInput.startsWith(cmd));
    if (quickCommand) {
      const param = userInput.replace(quickCommand, '').trim();
      executeAction(QUICK_COMMANDS[quickCommand].action + (param ? ` ${param}` : ''));
      return;
    }
    
    // 普通对话
    setTimeout(() => {
      let response = '我理解你的问题。作为品牌策划副驾驶，我可以：\n\n• 帮你梳理项目框架\n• 分析竞品策略\n• 生成创意方案\n• 导出项目文档\n\n试试输入快捷指令，如 @生成定位 或 @输出简报';
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response,
        timestamp: new Date()
      }]);
    }, 800);
  }, [input, executeAction]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ==================== 渲染 ====================

  return (
    <>
      {/* 引导气泡 */}
      {state === 'guide' && currentBubble && !isOpen && (
        <div 
          className="fixed right-20 bottom-24 max-w-xs bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-50 animate-fade-in cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleBubbleClick(currentBubble)}
        >
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
              {currentBubble.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">{currentBubble.text}</p>
              <p className="text-xs text-purple-600 mt-1">点击执行 →</p>
            </div>
          </div>
        </div>
      )}

      {/* 浮动按钮 */}
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className={`fixed right-4 w-12 h-12 sm:right-6 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 ${
          isOpen 
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl hover:scale-105'
        }`}
        style={{ bottom: isOpen ? '24.5rem' : '5.5rem' }}
      >
        {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Bot className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {/* 对话框 */}
      {isOpen && (
        <div 
          ref={containerRef}
          className="fixed right-4 sm:right-6 bottom-28 w-[calc(100%-2rem)] sm:w-96 h-[22rem] sm:h-[24rem] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-slide-up border border-gray-100"
        >
          {/* 头部 */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">灵思AI助手</span>
            <span className="text-xs opacity-80 ml-auto">品牌策划副驾驶</span>
          </div>

          {/* 快捷指令提示 */}
          <div className="px-3 py-2 bg-purple-50 border-b border-purple-100">
            <p className="text-xs text-purple-700">
              <Zap className="w-3 h-3 inline mr-1" />
              快捷指令: @生成定位 @分析竞品 @输出简报 @对比方案
            </p>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-br-md' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* 输入区域 */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入问题或快捷指令..."
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 样式 */}
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default FloatingAssistant;
