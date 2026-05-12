/**
 * 语音驱动的简化表单系统 - 简化版新建项目页面
 * 专为县域广告公司设计：接地气、大按钮、30秒出方案
 */

import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic, Upload, Sparkles, Check, ChevronRight, ChevronLeft,
  AlertCircle, Loader2, Plus, Trash2, X, Zap, FileText
} from 'lucide-react'
import VoiceInput from '../components/VoiceInput'
import {
  parseRequirement,
  ParsedRequirement,
  RequirementType,
  BudgetRange
} from '../services/aiParser'

// ============ 类型定义 ============

type Step = 'voice' | 'confirm' | 'generate'

interface UploadedFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'document'
}

// ============ 常量 ============

// 需求类型 - 接地气版本
const REQUIREMENT_TYPES: { value: RequirementType; label: string; emoji: string; example: string }[] = [
  { value: '品牌设计', label: '品牌设计', emoji: '🎨', example: 'LOGO、VI、海报' },
  { value: '产品包装', label: '包装设计', emoji: '📦', example: '包装盒、手提袋' },
  { value: '广告投放', label: '广告投放', emoji: '📢', example: '抖音、朋友圈' },
  { value: '活动策划', label: '活动策划', emoji: '🎉', example: '开业、促销' },
  { value: '宣传物料', label: '宣传物料', emoji: '📄', example: '单页、名片' },
  { value: '新媒体运营', label: '新媒体', emoji: '📱', example: '抖音、小红书' },
]

const BUDGET_OPTIONS: { value: BudgetRange; label: string; tip: string }[] = [
  { value: '1万以下', label: '1万以下', tip: '小活儿' },
  { value: '1-5万', label: '1-5万', tip: '够用' },
  { value: '5-10万', label: '5-10万', tip: '可以' },
  { value: '10-30万', label: '10-30万', tip: '大单' },
  { value: '待定', label: '待定', tip: '先聊' },
]

const INDUSTRY_OPTIONS = [
  '餐饮', '服装', '超市/便利店', '母婴/儿童', '建材/家居',
  '美容/美发', '手机/数码', '教育/培训', '房产/中介',
  '汽修/洗车', '药店', 'KTV/娱乐', '其他'
]

// ============ 组件 ============

const SimpleCreatePage: React.FC = () => {
  const navigate = useNavigate()
  
  // 当前步骤
  const [currentStep, setCurrentStep] = useState<Step>('voice')
  
  // AI解析结果
  const [parsedRequirement, setParsedRequirement] = useState<ParsedRequirement | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parsingError, setParsingError] = useState<string | null>(null)
  
  // 用户表单
  const [formData, setFormData] = useState({
    brandName: '',
    companyName: '',
    industry: '',
    requirementTypes: [] as RequirementType[],
    budget: '' as BudgetRange | '',
    targetAudience: '',
  })
  
  // 上传的文件
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 生成状态
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedProjectId, setGeneratedProjectId] = useState<string | null>(null)

  // ============ 语音输入处理 ============
  
  const handleVoiceComplete = useCallback(async (text: string) => {
    if (!text.trim()) return
    
    setParsing(true)
    setParsingError(null)
    
    try {
      const result = await parseRequirement({ text })
      
      if (result.success && result.data) {
        setParsedRequirement(result.data)
        
        // 填充表单
        setFormData({
          brandName: result.data.brandName || '',
          companyName: result.data.companyName || '',
          industry: result.data.industry || '',
          requirementTypes: result.data.requirementTypes || [],
          budget: (result.data.budget as BudgetRange) || '',
          targetAudience: result.data.targetAudience?.description || '',
        })
        
        // 直接跳到确认页
        setCurrentStep('confirm')
      } else {
        // 解析失败，跳到确认页让用户手动填
        setParsingError('没听太清，您手动补充一下吧')
        setCurrentStep('confirm')
      }
    } catch (error: any) {
      setParsingError('网络有点问题，先手动填吧')
      setCurrentStep('confirm')
    } finally {
      setParsing(false)
    }
  }, [])

  // ============ 表单处理 ============
  
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])
  
  const toggleRequirementType = useCallback((type: RequirementType) => {
    setFormData(prev => ({
      ...prev,
      requirementTypes: prev.requirementTypes.includes(type)
        ? prev.requirementTypes.filter(t => t !== type)
        : [...prev.requirementTypes, type]
    }))
  }, [])

  // ============ 文件上传 ============
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/')
      const reader = new FileReader()
      
      reader.onload = (ev) => {
        const newFile: UploadedFile = {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          file,
          preview: ev.target?.result as string,
          type: isImage ? 'image' : 'document'
        }
        setUploadedFiles(prev => [...prev, newFile])
      }
      
      reader.readAsDataURL(file)
    })
    
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])
  
  const handleRemoveFile = useCallback((id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  // ============ 生成项目 ============
  
  const handleGenerate = useCallback(async () => {
    // 简单验证
    if (!formData.brandName.trim()) {
      alert('请填写品牌名称')
      return
    }
    if (formData.requirementTypes.length === 0) {
      alert('请选择需求类型')
      return
    }
    
    setGenerating(true)
    setProgress(0)
    
    try {
      // 模拟生成进度
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setProgress(i)
      }
      
      // 生成项目ID
      const projectId = 'proj_' + Date.now().toString(36)
      setGeneratedProjectId(projectId)
      
      // 跳转到工作台
      setTimeout(() => {
        navigate(`/projects/workspace/${projectId}`)
      }, 1000)
      
    } catch (error) {
      alert('生成失败了，重试一下吧')
      setGenerating(false)
    }
  }, [formData, navigate])

  // ============ 渲染步骤 ============
  
  const renderVoiceStep = () => (
    <div className="flex flex-col items-center gap-8 py-12">
      {/* 标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          🎙️ 说说您的需求
        </h1>
        <p className="text-gray-500 text-lg">
          直接说话就行，不用填表
        </p>
      </div>
      
      {/* 语音输入 - 核心组件 */}
      <div className="w-full max-w-md">
        <VoiceInput
          onTranscriptComplete={handleVoiceComplete}
          className="voice-input"
        />
      </div>
      
      {/* 解析状态 */}
      {parsing && (
        <div className="flex items-center gap-3 text-purple-600 bg-purple-50 px-6 py-3 rounded-full">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-lg">智能分析中...</span>
        </div>
      )}
      
      {/* 跳过 */}
      <button
        onClick={() => setCurrentStep('confirm')}
        className="text-purple-600 hover:text-purple-700 text-base"
      >
        跳过，直接手动填 →
      </button>
    </div>
  )

  const renderConfirmStep = () => (
    <div className="flex flex-col gap-6 py-6">
      {/* 标题 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          确认一下信息
        </h2>
        <p className="text-gray-500">有不对的地方改一下</p>
      </div>
      
      {/* 表单 */}
      <div className="space-y-5">
        {/* 品牌名称 */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            品牌/店名 *
          </label>
          <input
            type="text"
            value={formData.brandName}
            onChange={(e) => handleFieldChange('brandName', e.target.value)}
            placeholder="比如：老王火锅、张姐超市"
            className="w-full px-4 py-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none transition-colors text-lg"
          />
        </div>
        
        {/* 公司名称 */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            公司名（没有就空着）
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleFieldChange('companyName', e.target.value)}
            placeholder="某某广告有限公司"
            className="w-full px-4 py-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none transition-colors text-lg"
          />
        </div>
        
        {/* 行业 */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            客户行业 *
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleFieldChange('industry', e.target.value)}
            className="w-full px-4 py-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none transition-colors text-lg bg-white"
          >
            <option value="">选择行业</option>
            {INDUSTRY_OPTIONS.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
        
        {/* 需求类型 */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            需要什么服务？ *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {REQUIREMENT_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => toggleRequirementType(type.value)}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all
                  ${formData.requirementTypes.includes(type.value)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white'
                  }
                `}
              >
                <span className="text-2xl mr-2">{type.emoji}</span>
                <span className="font-medium text-gray-800">{type.label}</span>
                <p className="text-xs text-gray-400 mt-1">{type.example}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* 预算 */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            预算大概多少？ *
          </label>
          <div className="flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleFieldChange('budget', opt.value)}
                className={`
                  px-5 py-3 rounded-full border-2 transition-all text-base
                  ${formData.budget === opt.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                    : 'border-gray-200 bg-white text-gray-700'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 目标人群 */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            主要给谁看？（可以不填）
          </label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
            placeholder="比如：县城里的年轻人、宝妈"
            className="w-full px-4 py-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none transition-colors text-lg"
          />
        </div>
      </div>
      
      {/* 资料上传（可选） */}
      <div className="mt-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-4 rounded-xl border-2 border-dashed border-purple-300 text-purple-600 flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          <span>上传参考图（可选）</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* 已上传 */}
        {uploadedFiles.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {uploadedFiles.map(file => (
              <div key={file.id} className="relative">
                <img src={file.preview} alt="预览" className="w-16 h-16 object-cover rounded-lg" />
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 生成按钮 */}
      <button
        onClick={handleGenerate}
        disabled={!formData.brandName || formData.requirementTypes.length === 0}
        className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6"
      >
        <Zap className="w-6 h-6" />
        <span>🚀 一键生成方案</span>
      </button>
    </div>
  )

  const renderGenerateStep = () => (
    <div className="flex flex-col items-center gap-8 py-12">
      {/* 生成中 */}
      {generating && (
        <>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center animate-pulse">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              正在生成方案...
            </h2>
            <p className="text-gray-500">稍等一下，马上就好</p>
          </div>
          
          {/* 进度条 */}
          <div className="w-full max-w-xs">
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-violet-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-gray-500 mt-2">{progress}%</p>
          </div>
        </>
      )}
      
      {/* 生成完成 */}
      {!generating && generatedProjectId && (
        <>
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-12 h-12 text-white" />
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ✅ 方案生成完成！
            </h2>
            <p className="text-gray-500">正在跳转到您的工作台...</p>
          </div>
        </>
      )}
    </div>
  )

  // ============ 主渲染 ============
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* 顶部 */}
      {currentStep !== 'generate' && (
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-purple-100 z-10">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => currentStep === 'confirm' && setCurrentStep('voice')}
              className="p-2"
            >
              {currentStep === 'confirm' && <ChevronLeft className="w-6 h-6 text-gray-600" />}
            </button>
            
            <h1 className="text-lg font-bold text-gray-800">新建方案</h1>
            
            <div className="w-10" />
          </div>
          
          {/* 专业模式切换入口 */}
          <div className="max-w-lg mx-auto px-4 pb-2 text-center">
            <button
              onClick={() => navigate('/projects/workspace/new')}
              className="text-sm text-gray-400 hover:text-purple-600 transition-colors"
            >
              需要专业模式？切换到4A标准流程 →
            </button>
          </div>
        </div>
      )}
      
      {/* 内容 */}
      <div className="max-w-lg mx-auto px-4">
        {currentStep === 'voice' && renderVoiceStep()}
        {currentStep === 'confirm' && renderConfirmStep()}
        {currentStep === 'generate' && renderGenerateStep()}
      </div>
    </div>
  )
}

export default SimpleCreatePage
