import React, { useState, useRef, useCallback } from 'react'
import {
  Upload, Mic, Image, FileAudio, Sparkles, AlertCircle,
  ChevronDown, ChevronUp, Zap, Clock, Check, X,
  Download, RefreshCw, Loader2, FileText, Copy, CheckCircle2,
  Play, Pause, Trash2, Plus, ExternalLink, FileDown
} from 'lucide-react'
import {
  parseImageRequirement,
  parseAudioRequirement,
  parseTextRequirement,
  exportToExcelData
} from '../services/requirementParser'
import { ParsedRequirement, RequirementItem } from '../types/requirementParser'
import {
  SUPPORTED_AUDIO_FORMATS,
  SUPPORTED_IMAGE_FORMATS,
  MAX_AUDIO_SIZE,
  MAX_IMAGE_SIZE
} from '../types/requirementParser'

// ============ 主组件 ============

const ClientRequirementParser: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 文件上传相关
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null)
  const [fileType, setFileType] = useState<'audio' | 'image' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 文本输入相关
  const [inputText, setInputText] = useState('')
  
  // 解析结果
  const [parsedResult, setParsedResult] = useState<ParsedRequirement | null>(null)
  
  // 选中要导出的条目
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // 处理文件上传
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [])

  const processFile = (file: File) => {
    // 检查文件类型
    const isAudio = SUPPORTED_AUDIO_FORMATS.includes(file.type) || file.name.endsWith('.mp3')
    const isImage = SUPPORTED_IMAGE_FORMATS.includes(file.type)
    
    if (!isAudio && !isImage) {
      setError('不支持的文件格式，请上传 .mp3、.jpg 或 .png 文件')
      return
    }
    
    // 检查文件大小
    const maxSize = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE
    if (file.size > maxSize) {
      const maxSizeMB = isAudio ? 50 : 10
      setError(`文件大小超过限制，最大支持 ${maxSizeMB}MB`)
      return
    }
    
    setFileType(isAudio ? 'audio' : 'image')
    setUploadedFile(file)
    setError(null)
    
    // 生成预览
    if (isImage) {
      const reader = new FileReader()
      reader.onload = (ev) => setUploadedPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setUploadedPreview(null)
    }
  }

  // 拖拽上传
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [])

  // 解析图片
  const handleParseImage = async () => {
    if (!uploadedPreview) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await parseImageRequirement(uploadedPreview)
      setParsedResult(result)
      setSelectedItems(new Set(result.keyPoints.map(item => item.id)))
    } catch (err: any) {
      setError(err.message || '解析失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 解析音频/文本
  const handleParseAudioOrText = async () => {
    if (!inputText.trim() && !uploadedFile) {
      setError('请输入需求内容或上传文件')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      let result: ParsedRequirement
      
      if (uploadedFile && fileType === 'audio') {
        // 音频文件需要用户手动转文字提示
        setError('提示：音频文件需要先使用微信或其他工具转文字，然后粘贴到文本框中解析')
        setLoading(false)
        setActiveTab('text')
        return
      } else if (inputText.trim()) {
        result = await parseTextRequirement(inputText.trim())
      } else {
        setError('请输入需求内容')
        setLoading(false)
        return
      }
      
      setParsedResult(result)
      setSelectedItems(new Set(result.keyPoints.map(item => item.id)))
    } catch (err: any) {
      setError(err.message || '解析失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 切换选中状态
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedItems)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedItems(newSet)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (!parsedResult) return
    if (selectedItems.size === parsedResult.keyPoints.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(parsedResult.keyPoints.map(item => item.id)))
    }
  }

  // 导出为CSV
  const handleExportCSV = () => {
    if (!parsedResult) return
    
    const data = exportToExcelData(parsedResult)
    const csv = data.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n')
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `甲方需求解析_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  // 导出为Word (HTML格式)
  const handleExportWord = () => {
    if (!parsedResult) return
    
    const rows = parsedResult.keyPoints.map((item, index) => `
      <tr>
        <td style="border:1px solid #ddd;padding:8px;">${index + 1}</td>
        <td style="border:1px solid #ddd;padding:8px;">${item.originalPoint}</td>
        <td style="border:1px solid #ddd;padding:8px;">${item.inferredIntent}</td>
        <td style="border:1px solid #ddd;padding:8px;">${item.action}</td>
        <td style="border:1px solid #ddd;padding:8px;">${getPriorityLabel(item.priority)}</td>
      </tr>
    `).join('')
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>甲方需求解析</title>
        <style>
          body { font-family: '微软雅黑', Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #4F46E5; color: white; padding: 12px 8px; text-align: left; }
          tr:nth-child(even) { background: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>📋 甲方需求解析结果</h1>
        <p><strong>解析时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
        <p><strong>摘要：</strong>${parsedResult.summary}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>甲方原文/原图关键点</th>
              <th>推测意图</th>
              <th>执行动作</th>
              <th>优先级</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `
    
    const blob = new Blob([html], { type: 'application/msword' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `甲方需求解析_${new Date().toISOString().slice(0, 10)}.doc`
    link.click()
  }

  // 重置
  const handleReset = () => {
    setUploadedFile(null)
    setUploadedPreview(null)
    setFileType(null)
    setInputText('')
    setParsedResult(null)
    setSelectedItems(new Set())
    setError(null)
  }

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">甲乙方传译闭环</h1>
              <p className="text-sm text-gray-500">AI智能解析甲方语音/图片需求，生成可执行的动作清单</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tab切换 */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <TabButton
            active={activeTab === 'upload'}
            onClick={() => setActiveTab('upload')}
            icon={<Upload className="w-4 h-4" />}
          >
            文件上传
          </TabButton>
          <TabButton
            active={activeTab === 'text'}
            onClick={() => setActiveTab('text')}
            icon={<FileText className="w-4 h-4" />}
          >
            文本输入
          </TabButton>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* 文件上传Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* 上传区域 */}
            <div
              className={`relative border-2 border-dashed rounded-2xl transition-all ${
                uploadedFile
                  ? fileType === 'audio' ? 'border-purple-300 bg-purple-50' : 'border-blue-300 bg-blue-50'
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !uploadedFile && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.m4a,.jpg,.jpeg,.png,.webp,audio/*,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {uploadedFile ? (
                <div className="p-6">
                  <div className="flex items-center justify-center gap-4">
                    {fileType === 'audio' ? (
                      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                        <FileAudio className="w-8 h-8 text-purple-500" />
                      </div>
                    ) : (
                      <img
                        src={uploadedPreview!}
                        alt="上传的文件"
                        className="max-h-48 rounded-xl object-contain"
                      />
                    )}
                    <div className="text-left">
                      <p className="font-medium text-gray-800">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-center flex gap-3 justify-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                      className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      重新上传
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReset() }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      删除
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">拖拽文件到这里，或点击上传</p>
                  <p className="text-sm text-gray-400">
                    支持 .mp3（音频50MB）、.jpg/.png（图片10MB）
                  </p>
                </div>
              )}
            </div>

            {/* 解析按钮 */}
            {uploadedFile && (
              <button
                onClick={fileType === 'image' ? handleParseImage : handleParseAudioOrText}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>AI正在解析中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>开始智能解析</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* 文本输入Tab */}
        {activeTab === 'text' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入甲方需求（支持粘贴语音转文字内容）
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`例如：甲方的语音转文字内容、聊天记录截图中的文字等\n\n示例：\n"Logo要大气一点，别放那么小"\n"背景颜色换成我们品牌蓝"\n"优惠信息要显眼，让用户一眼就能看到"\n"整体风格要年轻化一些"\n"明天下午之前必须搞定"`}
                className="w-full h-48 p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 提示：支持粘贴微信语音转文字、录音转写、手绘草图中的文字等
              </p>
            </div>

            <button
              onClick={handleParseAudioOrText}
              disabled={loading || !inputText.trim()}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI正在解析中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>开始智能解析</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 解析结果 - 三列表格 */}
        {parsedResult && (
          <ResultTable
            result={parsedResult}
            selectedItems={selectedItems}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onExportCSV={handleExportCSV}
            onExportWord={handleExportWord}
            onReset={handleReset}
            onCopy={copyToClipboard}
          />
        )}
      </div>
    </div>
  )
}

// ============ 子组件 ============

const MessageSquare: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

/** Tab按钮 */
const TabButton: React.FC<{
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}> = ({ active, onClick, icon, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
      active
        ? 'bg-white text-indigo-600 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    {icon}
    {children}
  </button>
)

/** 结果表格组件 */
const ResultTable: React.FC<{
  result: ParsedRequirement
  selectedItems: Set<string>
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onExportCSV: () => void
  onExportWord: () => void
  onReset: () => void
  onCopy: (text: string) => void
}> = ({ result, selectedItems, onToggleSelect, onToggleSelectAll, onExportCSV, onExportWord, onReset, onCopy }) => {
  const priorityConfig = {
    high: { color: 'bg-red-100 text-red-700 border-red-200', label: '高优', icon: <Zap className="w-3 h-3" /> },
    medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: '中优', icon: <Clock className="w-3 h-3" /> },
    low: { color: 'bg-gray-100 text-gray-600 border-gray-200', label: '低优', icon: <Check className="w-3 h-3" /> },
  }

  const categoryLabels: Record<string, string> = {
    visual: '视觉',
    content: '内容',
    layout: '布局',
    style: '风格',
    deadline: '截止',
    other: '其他'
  }

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-900">需求解析完成</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              共识别 {result.keyPoints.length} 项需求 · {new Date(result.timestamp).toLocaleString('zh-CN')}
            </p>
          </div>
          <button
            onClick={onReset}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        {/* 摘要 */}
        <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-100">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-indigo-600">📋 摘要：</span>
            {result.summary}
          </p>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedItems.size === result.keyPoints.length}
            onChange={onToggleSelectAll}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-600">
            全选 ({selectedItems.size}/{result.keyPoints.length})
          </span>
        </label>
        <div className="flex gap-2">
          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
          >
            <FileDown className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={onExportWord}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
          >
            <FileDown className="w-4 h-4" />
            Word
          </button>
        </div>
      </div>

      {/* 三列表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-10 px-4 py-3"></th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                甲方原文/原图关键点
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-purple-700 border-b border-gray-200">
                推测意图 💭
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-700 border-b border-gray-200">
                执行动作 ✅
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                优先级
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {result.keyPoints.map((item, index) => {
              const priority = priorityConfig[item.priority]
              const isSelected = selectedItems.has(item.id)
              
              return (
                <tr
                  key={item.id}
                  className={`${isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-800">{item.originalPoint}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-purple-700 bg-purple-50 rounded-lg px-3 py-2">
                      {item.inferredIntent}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2">
                      {item.action}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${priority.color}`}>
                      {priority.icon}
                      {priority.label}
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      {categoryLabels[item.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onCopy(item.action)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="复制执行动作"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 底部操作 */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            已选择 {selectedItems.size} 项需求
          </p>
          <div className="flex gap-3">
            <button
              onClick={onReset}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              重新解析
            </button>
            <button
              disabled={selectedItems.size === 0}
              className="px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              创建任务 ({selectedItems.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 辅助函数
function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    high: '高优',
    medium: '中优',
    low: '低优'
  }
  return labels[priority] || priority
}

export default ClientRequirementParser
