import React from 'react';
import { Mail } from 'lucide-react';

const EmailPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="bg-blue-50 rounded-full p-6 mb-6">
        <Mail className="w-16 h-16 text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">邮箱管理</h2>
      <p className="text-gray-500 max-w-md">
        邮箱功能正在开发中，将支持邮件收发和管理。
      </p>
      <div className="mt-6 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm">
        🚧 功能开发中
      </div>
    </div>
  );
};

export default EmailPage;
