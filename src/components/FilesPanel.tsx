import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, X, Upload, FileText, Image, File, 
  Trash2, Download, Eye, Grid, List
} from 'lucide-react';

const API_BASE = '';

interface Asset {
  id: string;
  name: string;
  type: string;
  url?: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
}

interface FilesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

type TabType = 'all' | 'document' | 'image';
type ViewMode = 'grid' | 'list';

const FilesPanel: React.FC<FilesPanelProps> = ({ isOpen, onClose, userId }) => {
  const [files, setFiles] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [previewFile, setPreviewFile] = useState<Asset | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen, activeTab]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ userId });
      if (activeTab !== 'all') params.append('type', activeTab);
      
      const response = await fetch(`${API_BASE}/api/assets?${params}`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.data.assets);
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList) return;
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', getFileType(file.type));
      
      try {
        const response = await fetch(`${API_BASE}/api/assets/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });
        const data = await response.json();
        if (data.success) {
          setFiles(prev => [data.data, ...prev]);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个文件吗？')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/assets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setFiles(prev => prev.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    return 'document';
  };

  const getFileIcon = (type: string) => {
    if (type === 'image') return <Image className="w-8 h-8 text-green-500" />;
    return <FileText className="w-8 h-8 text-blue-500" />;
  };

  const getFileIconSmall = (type: string) => {
    if (type === 'image') return <Image className="w-4 h-4 text-green-500" />;
    return <FileText className="w-4 h-4 text-blue-500" />;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  // 拖拽上传
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  if (!isOpen) return null;

  const tabs = [
    { key: 'all', label: '全部', count: files.length },
    { key: 'document', label: '文档', count: files.filter(f => f.type === 'document').length },
    { key: 'image', label: '图片', count: files.filter(f => f.type === 'image').length }
  ];

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* 面板 */}
      <div className="fixed right-4 top-14 w-96 max-h-[calc(100vh-8rem)] bg-white rounded-xl shadow-2xl z-50 flex flex-col animate-slide-in-right border border-gray-200">
        {/* 头部 */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Folder className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="font-semibold text-gray-900">我的文件</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={viewMode === 'grid' ? '列表视图' : '网格视图'}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab切换 */}
        <div className="px-4 py-2 border-b border-gray-100 flex gap-1 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-violet-100 text-violet-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* 文件列表 */}
        <div 
          ref={dropRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 overflow-y-auto p-3 transition-colors ${
            dragOver ? 'bg-violet-50 border-2 border-dashed border-violet-300 rounded-lg' : ''
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-gray-400">加载中...</div>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <File className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">暂无文件</p>
              <p className="text-xs mt-1">点击下方按钮上传</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 gap-2">
              {files.map(file => (
                <div
                  key={file.id}
                  className="group relative bg-gray-50 hover:bg-gray-100 rounded-lg p-2 cursor-pointer transition-colors"
                  onClick={() => setPreviewFile(file)}
                >
                  {/* 文件图标/预览 */}
                  <div className="aspect-square rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-2 overflow-hidden">
                    {file.type === 'image' && file.url ? (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      getFileIcon(file.type)
                    )}
                    {/* 悬停遮罩 */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
                        className="p-1.5 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {file.url && (
                        <a
                          href={file.url}
                          download={file.name}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                        className="p-1.5 bg-white rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {files.map(file => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group transition-colors"
                  onClick={() => setPreviewFile(file)}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {file.type === 'image' && file.url ? (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      getFileIconSmall(file.type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatSize(file.size)} · {formatDate(file.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.url && (
                      <a
                        href={file.url}
                        download={file.name}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 拖拽提示 */}
          {dragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-violet-50/90 rounded-xl">
              <div className="text-center">
                <Upload className="w-12 h-12 text-violet-500 mx-auto mb-2" />
                <p className="text-violet-600 font-medium">松开以上传文件</p>
              </div>
            </div>
          )}
        </div>

        {/* 上传按钮 */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.doc,.docx,.pdf,.txt,.md"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-md transition-shadow flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            上传文件
          </button>
        </div>
      </div>

      {/* 预览弹窗 */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center p-8" onClick={() => setPreviewFile(null)}>
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            {previewFile.url && (
              <>
                <a
                  href={previewFile.url}
                  download={previewFile.name}
                  className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                  下载
                </a>
                <button
                  onClick={() => handleDelete(previewFile.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              </>
            )}
          </div>
          {previewFile.type === 'image' && previewFile.url ? (
            <img
              src={previewFile.url}
              alt={previewFile.name}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="bg-white rounded-xl p-8 text-center max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {getFileIcon(previewFile.type)}
              <h4 className="mt-4 font-medium text-gray-900">{previewFile.name}</h4>
              <p className="mt-1 text-sm text-gray-500">{formatSize(previewFile.size)}</p>
              <p className="mt-2 text-xs text-gray-400">{previewFile.mimeType}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FilesPanel;
