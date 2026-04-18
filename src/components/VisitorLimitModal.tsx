import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface VisitorLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  currentCount: number;
  limit: number;
}

const VisitorLimitModal: React.FC<VisitorLimitModalProps> = ({ 
  isOpen, 
  onClose, 
  onLoginClick,
  currentCount,
  limit 
}) => {
  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    onLoginClick();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">已达到体验上限</h2>
          </div>
        </div>

        {/* 内容 */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 text-center mb-4">
            您当前以访客身份体验，已创建 <span className="font-semibold text-purple-600">{currentCount}</span> 个需求确认单。
          </p>
          
          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <p className="text-purple-800 text-sm">
              <span className="font-semibold">体验限制：</span>访客模式最多创建 {limit} 个需求单，数据保留7天。
            </p>
            <p className="text-purple-700 text-sm mt-2">
              <span className="font-semibold">登录后：</span>无限制创建，数据永久保存，还能解锁更多高级功能。
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              继续浏览
            </button>
            <button
              onClick={handleLogin}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
            >
              登录解锁
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorLimitModal;
