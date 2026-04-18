import React from 'react';
import { X } from 'lucide-react';

interface VisitorBannerProps {
  onLoginClick: () => void;
  onDismiss?: () => void;
  visible?: boolean;
}

const VisitorBanner: React.FC<VisitorBannerProps> = ({ onLoginClick, onDismiss, visible = true }) => {
  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 px-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">
            <span className="font-medium">体验模式</span>
            <span className="opacity-90">，数据保留7天，</span>
            <button
              onClick={onLoginClick}
              className="underline hover:no-underline font-medium ml-1"
            >
              登录
            </button>
            <span className="opacity-90">后永久保存</span>
          </span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default VisitorBanner;
