import React, { useState, useRef, useCallback } from 'react'
import {
  Upload, Mic, Image, FileText, Sparkles, Check, X, AlertCircle,
  ChevronDown, ChevronUp, Clock, Zap, MessageSquare, LayoutGrid,
  Download, Copy, RefreshCw, Loader2, CheckCircle2, Lightbulb
} from 'lucide-react'
import {
  parseImageRequirement,
  parseVoiceRequirement,
  generateVersionComparison,
  ParsedRequirement,
  ExplicitInstruction,
  ImplicitIntent,
  VersionComparisonResult
} from '../services/aiParser'

// ============ 类型定义 ============

type TabType = 'upload' | 'voice' | 'versions'
type ActionType = 'confirm' | 'modify' | 'ignore' | null

interface RequirementCardProps {
  requirement: ParsedRequirement
  onAction?: (action: ActionType) => void
  onClose?: () => void
}

// ============ 主组件 ============

const RequirementParser: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('upload')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 图片上传相关
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 语音转文字相关
  const [voiceText, setVoiceText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  
  // 解析结果
  const [parsedResult, setParsedResult] = useState<ParsedRequirement | null>(null)
  const [versionResult, setVersionResult] = useState<VersionComparisonResult | null>(null)
  
  // 版本比稿相关
  const [versionRequest, setVersionRequest] = useState('')
  
  // 处理动作
  const [selectedAction, setSelectedAction] = useState<ActionType>(null)

  // 处理图片上传
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string)
        setImageFile(file)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // 拖拽上传
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string)
        setImageFile(file)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // 解析图片需求
  const handleParseImage = async () => {
    if (!uploadedImage) return
    
    setLoading(true)
    setError(null)
    setParsedResult(null)
    
    try {
      const result = await parseImageRequirement(uploadedImage)
      setParsedResult(result)
    } catch (err: any) {
      setError(err.message || '解析失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 解析语音需求
  const handleParseVoice = async () => {
    if (!voiceText.trim()) {
      setError('请输入语音转文字的内容')
      return
    }
    
    setLoading(true)
    setError(null)
    setParsedResult(null)
    
    try {
      const result = await parseVoiceRequirement(voiceText)
      setParsedResult(result)
    } catch (err: any) {
      setError(err.message || '解析失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 生成版本比稿
  const handleGenerateVersions = async () => {
    if (!versionRequest.trim()) {
      setError('请输入需求内容')
      return
    }
    
    setLoading(true)
    setError(null)
    setVersionResult(null)
    
    try {
      const result = await generateVersionComparison(versionRequest)
      setVersionResult(result)
    } catch (err: any) {
      setError(err.message || '生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // 重置状态
  const handleReset = () => {
    setUploadedImage(null)
    setImageFile(null)
    setVoiceText('')
    setParsedResult(null)
    setVersionResult(null)
    setSelectedAction(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">甲方沟通翻译器</h1>
              <p className="text-sm text-gray-500">AI智能解析甲方的图片、语音和模糊需求</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tab切换 */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <TabButton
            active={activeTab === 'upload'}
            onClick={() => { setActiveTab('upload'); handleReset() }}
            icon={<Image className="w-4 h-4" />}
          >
            图片解析
          </TabButton>
          <TabButton
            active={activeTab === 'voice'}
            onClick={() => { setActiveTab('voice'); handleReset() }}
            icon={<Mic className="w-4 h-4" />}
          >
            语音转文字
          </TabButton>
          <TabButton
            active={activeTab === 'versions'}
            onClick={() => { setActiveTab('versions'); handleReset() }}
            icon={<LayoutGrid className="w-4 h-4" />}
          >
            多版本比稿
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

        {/* 图片上传Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* 上传区域 */}
            <div
              className={`relative border-2 border-dashed rounded-2xl transition-all ${
                uploadedImage
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !uploadedImage && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {uploadedImage ? (
                <div className="p-4">
                  <img
                    src={uploadedImage}
                    alt="上传的图片"
                    className="max-h-64 mx-auto rounded-xl object-contain"
                  />
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      重新上传
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">拖拽图片到这里，或点击上传</p>
                  <p className="text-sm text-gray-400">支持 JPG、PNG、WebP 格式</p>
                </div>
              )}
            </div>

            {/* 解析按钮 */}
            {uploadedImage && !parsedResult && (
              <button
                onClick={handleParseImage}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
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

        {/* 语音转文字Tab */}
        {activeTab === 'voice' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                粘贴语音转文字内容
              </label>
              <textarea
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                placeholder="将甲方发送的60秒语音或其他沟通记录粘贴到这里，AI将自动识别需求..."
                className="w-full h-40 p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 提示：支持粘贴微信语音转文字、录音转写等各类文字内容
              </p>
            </div>

            {!parsedResult && (
              <button
                onClick={handleParseVoice}
                disabled={loading || !voiceText.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
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

        {/* 多版本比稿Tab */}
        {activeTab === 'versions' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入需求描述
              </label>
              <textarea
                value={versionRequest}
                onChange={(e) => setVersionRequest(e.target.value)}
                placeholder="描述甲方想要的创意方向，例如：'为XX品牌设计一套母亲节海报，突出温暖和感恩的主题'"
                className="w-full h-32 p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              onClick={handleGenerateVersions}
              disabled={loading || !versionRequest.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI正在生成方案...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>生成ABC三版方案</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 解析结果展示 */}
        {parsedResult && (
          <RequirementCard
            requirement={parsedResult}
            onAction={setSelectedAction}
            onClose={handleReset}
          />
        )}

        {/* 版本比稿结果 */}
        {versionResult && (
          <VersionComparisonCard
            result={versionResult}
            onClose={handleReset}
          />
        )}
      </div>
    </div>
  )
}

// ============ 子组件 ============

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
        ? 'bg-white text-blue-600 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    {icon}
    {children}
  </button>
)

/** 需求卡片组件 */
const RequirementCard: React.FC<RequirementCardProps> = ({ requirement, onAction, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    explicit: true,
    implicit: true,
  })

  const priorityConfig = {
    high: { color: 'bg-red-100 text-red-700', label: '高优', icon: <Zap className="w-3 h-3" /> },
    medium: { color: 'bg-yellow-100 text-yellow-700', label: '中优', icon: <Clock className="w-3 h-3" /> },
    low: { color: 'bg-gray-100 text-gray-600', label: '低优', icon: <Check className="w-3 h-3" /> },
  }

  const categoryConfig: Record<string, { icon: React.ReactNode; label: string }> = {
    visual: { icon: <Image className="w-4 h-4" />, label: '视觉' },
    content: { icon: <FileText className="w-4 h-4" />, label: '内容' },
    layout: { icon: <LayoutGrid className="w-4 h-4" />, label: '布局' },
    style: { icon: <Sparkles className="w-4 h-4" />, label: '风格' },
    deadline: { icon: <Clock className="w-4 h-4" />, label: '截止' },
    other: { icon: <MessageSquare className="w-4 h-4" />, label: '其他' },
  }

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
      {/* 卡片头部 */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">需求变更确认单</h3>
              <p className="text-xs text-gray-500">
                {new Date(requirement.timestamp).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        {/* 总结 */}
        <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-blue-600">📋 摘要：</span>
            {requirement.summary}
          </p>
        </div>
      </div>

      {/* 显性指令 */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => setExpandedSections(prev => ({ ...prev, explicit: !prev.explicit }))}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <span className="font-medium text-gray-800">
              显性指令 ({requirement.explicitInstructions.length})
            </span>
          </div>
          {expandedSections.explicit ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.explicit && (
          <div className="px-4 pb-4 space-y-3">
            {requirement.explicitInstructions.map((item, index) => {
              const priority = priorityConfig[item.priority]
              const category = categoryConfig[item.category] || categoryConfig.other
              
              return (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {item.content}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-7">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priority.color}`}>
                          {priority.icon}
                          {priority.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">
                          {category.icon}
                          {category.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 隐性意图 */}
      {requirement.implicitIntents.length > 0 && (
        <div className="border-b border-gray-100">
          <button
            onClick={() => setExpandedSections(prev => ({ ...prev, implicit: !prev.implicit }))}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-800">
                隐性意图 ({requirement.implicitIntents.length})
              </span>
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                AI推测
              </span>
            </div>
            {expandedSections.implicit ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {expandedSections.implicit && (
            <div className="px-4 pb-4 space-y-3">
              {requirement.implicitIntents.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-purple-50 rounded-xl border border-purple-100"
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-800">
                        {item.content}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        💭 {item.reasoning}
                      </p>
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs text-purple-500">置信度：</span>
                        <div className="w-16 h-1.5 bg-purple-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${item.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-purple-600 font-medium">
                          {Math.round(item.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="p-4 bg-gray-50">
        <p className="text-sm text-gray-600 mb-3 text-center">
          是否需要将此项变更同步至项目待办？
        </p>
        <div className="flex gap-3">
          <button
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Check className="w-4 h-4" />
            确认同步
          </button>
          <button
            className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            修改后同步
          </button>
          <button
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <X className="w-4 h-4" />
            暂不处理
          </button>
        </div>
      </div>
    </div>
  )
}

/** 版本对比卡片组件 */
const VersionComparisonCard: React.FC<{ result: VersionComparisonResult; onClose: () => void }> = ({
  result,
  onClose
}) => {
  const versionColors = {
    A: { bg: 'bg-blue-50 border-blue-200', header: 'bg-blue-500', text: 'text-blue-600' },
    B: { bg: 'bg-purple-50 border-purple-200', header: 'bg-purple-500', text: 'text-purple-600' },
    C: { bg: 'bg-green-50 border-green-200', header: 'bg-green-500', text: 'text-green-600' },
  }

  const versionLabels = {
    A: '保守稳健型',
    B: '创新突破型',
    C: '融合平衡型',
  }

  return (
    <div className="mt-6 space-y-6 animate-fadeIn">
      {/* 原始需求 */}
      <div className="p-4 bg-gray-100 rounded-xl">
        <p className="text-sm text-gray-600">
          <span className="font-medium">原始需求：</span>
          {result.originalRequest}
        </p>
      </div>

      {/* 三个版本 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {result.versions.map((v) => {
          const colors = versionColors[v.version]
          return (
            <div
              key={v.version}
              className={`rounded-2xl border-2 ${colors.bg} overflow-hidden`}
            >
              <div className={`${colors.header} px-4 py-3 text-white`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold">方案{v.version}</span>
                  <span className="text-xs opacity-80">{versionLabels[v.version]}</span>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{v.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{v.description}</p>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500">关键特点：</p>
                  {v.keyFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className={`w-3.5 h-3.5 ${colors.text} flex-shrink-0 mt-0.5`} />
                      <span className="text-xs text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">风格方向：</span>
                    {v.styleDirection}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 推荐意见 */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">💡 AI推荐</p>
            <p className="text-sm text-amber-700">{result.recommendation}</p>
          </div>
        </div>
      </div>

      {/* 操作 */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重新生成
        </button>
        <button
          className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" />
          导出对比图
        </button>
      </div>
    </div>
  )
}

export default RequirementParser
