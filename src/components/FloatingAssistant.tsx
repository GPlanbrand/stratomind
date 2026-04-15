import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';

const FloatingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: '你好！我是灵思AI助手，有什么可以帮你的吗？' }
  ]);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && 
          containerRef.current && 
          buttonRef.current &&
          !containerRef.current.contains(e.target as Node) &&
          !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    
    // 模拟AI回复
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '我已收到你的问题，正在思考中...' 
      }]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 浮动按钮 */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-4 w-12 h-12 sm:right-6 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 ${
          isOpen 
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl hover:scale-105'
        }`}
        style={{ bottom: isOpen ? '6rem' : '5.5rem' }}
      >
        {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Bot className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {/* 对话框 */}
      {isOpen && (
        <div 
          ref={containerRef}
          className="fixed right-6 bottom-24 w-80 h-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-slide-up border border-gray-100">
          {/* 头部 */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">灵思AI助手</span>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
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
                placeholder="输入问题..."
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

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default FloatingAssistant;
