import React from 'react';
import { Bot } from 'lucide-react';

const AssistantPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="bg-violet-50 rounded-full p-6 mb-6">
        <Bot className="w-16 h-16 text-violet-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">📝 写作秘书</h2>
      <p className="text-gray-500 max-w-md">
        您的格式助手，帮助检查文案规范、排除敏感词、转换公文格式。
      </p>
      <div className="mt-6 px-4 py-2 bg-violet-100 text-violet-600 rounded-full text-sm">
        🚧 功能开发中
      </div>
    </div>
  );
};

export default AssistantPage;
