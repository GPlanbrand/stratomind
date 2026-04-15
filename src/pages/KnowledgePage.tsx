import React from 'react';
import { Book } from 'lucide-react';

const KnowledgePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="bg-indigo-50 rounded-full p-6 mb-6">
        <Book className="w-16 h-16 text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">知识库</h2>
      <p className="text-gray-500 max-w-md">
        知识库功能正在开发中，将支持文档管理和知识沉淀。
      </p>
      <div className="mt-6 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-full text-sm">
        🚧 功能开发中
      </div>
    </div>
  );
};

export default KnowledgePage;
