import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { LINGSI_DEFAULT_PROFILE } from '../config/lingsiProfile';

interface ContactLingsiProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'button' | 'modal' | 'floating';
  className?: string;
}

const ContactLingsi: React.FC<ContactLingsiProps> = ({
  isOpen: controlledIsOpen,
  onClose,
  variant = 'button',
  className = '',
}) => {
  const navigate = useNavigate();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const isOpen = controlledIsOpen ?? internalIsOpen;
  const handleClose = onClose ?? (() => setInternalIsOpen(false));

  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      // 模拟发送消息
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 跳转到AI对话页面并带上消息
      navigate('/ai', { state: { initialMessage: message } });
      handleClose();
      setMessage('');
      setSent(true);
      
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      console.error('发送失败:', error);
    } finally {
      setSending(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new_project':
        navigate('/projects/new');
        handleClose();
        break;
      case 'ai_chat':
        navigate('/ai');
        handleClose();
        break;
      case 'help':
        navigate('/help');
        handleClose();
        break;
      default:
        break;
    }
  };

  // 按钮变体
  if (variant === 'button') {
    return (
      <button
        onClick={() => navigate('/ai')}
        className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all ${className}`}
      >
        <Sparkles className="w-4 h-4" />
        <span>联系灵思</span>
      </button>
    );
  }

  // 浮动变体
  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={() => setInternalIsOpen(true)}
          className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 ${className}`}
        >
          <Sparkles className="w-6 h-6" />
        </button>

        {isOpen && (
          <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
            <ContactModalContent
              message={message}
              setMessage={setMessage}
              sending={sending}
              sent={sent}
              onSend={handleSend}
              onClose={handleClose}
              onQuickAction={handleQuickAction}
            />
          </div>
        )}
      </>
    );
  }

  // 模态框变体
  return (
    <>
      <button
        onClick={() => setInternalIsOpen(true)}
        className={`flex items-center gap-3 w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-colors ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-gray-900">
            联系 {LINGSI_DEFAULT_PROFILE.name}
          </h3>
          <p className="text-sm text-gray-500">
            {LINGSI_DEFAULT_PROFILE.greeting}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <ContactModalContent
              message={message}
              setMessage={setMessage}
              sending={sending}
              sent={sent}
              onSend={handleSend}
              onClose={handleClose}
              onQuickAction={handleQuickAction}
            />
          </div>
        </div>
      )}
    </>
  );
};

// 模态框内容组件
interface ContactModalContentProps {
  message: string;
  setMessage: (msg: string) => void;
  sending: boolean;
  sent: boolean;
  onSend: () => void;
  onClose: () => void;
  onQuickAction: (action: string) => void;
}

const ContactModalContent: React.FC<ContactModalContentProps> = ({
  message,
  setMessage,
  sending,
  sent,
  onSend,
  onClose,
  onQuickAction,
}) => {
  return (
    <>
      {/* 头部 */}
      <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-purple-500 to-pink-500">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="text-white">
            <h2 className="text-xl font-bold">{LINGSI_DEFAULT_PROFILE.name}</h2>
            <p className="text-white/80 text-sm">{LINGSI_DEFAULT_PROFILE.title}</p>
          </div>
        </div>
      </div>

      {/* 欢迎语 */}
      <div className="px-6 py-4 bg-purple-50">
        <p className="text-sm text-purple-700">
          {LINGSI_DEFAULT_PROFILE.greeting}
        </p>
      </div>

      {/* 快捷操作 */}
      <div className="px-6 py-3 border-b border-gray-100">
        <div className="flex gap-2">
          {LINGSI_DEFAULT_PROFILE.quickActions.slice(0, 3).map(action => (
            <button
              key={action.id}
              onClick={() => onQuickAction(action.id)}
              className="flex-1 px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* 消息输入 */}
      <div className="p-4">
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入你想咨询的内容..."
            rows={3}
            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <button
            onClick={onSend}
            disabled={!message.trim() || sending}
            className="absolute right-2 bottom-2 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : sent ? (
              <span className="text-lg">✓</span>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-400 text-center">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>

      {/* 底部链接 */}
      <div className="px-6 pb-6">
        <button
          onClick={() => onQuickAction('ai_chat')}
          className="w-full flex items-center justify-center gap-2 py-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">打开完整对话窗口</span>
        </button>
      </div>
    </>
  );
};

export default ContactLingsi;
