import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Download,
  Copy,
  Check,
  RefreshCw,
  Shield,
  Edit3,
  Eye,
  X,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import ComplianceChecker from '../components/ComplianceChecker'
import { getProject, getProjectSteps } from '../services/api'
import { Project, ClientInfo, Requirements, Competitor, Brief, Strategy } from '../types'

interface DocumentPreviewProps {
  projectId?: string
  content?: string
  onContentChange?: (content: string) => void
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ projectId, content: initialContent, onContentChange }) => {
  const { projectId: paramProjectId } = useParams()
  const navigate = useNavigate()
  const targetProjectId = projectId || paramProjectId

  const [project, setProject] = useState<Project | null>(null)
  const [clientInfo, setClientInfo] = useState<Partial<ClientInfo>>({})
  const [requirements, setRequirements] = useState<Partial<Requirements>>({})
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [brief, setBrief] = useState<Partial<Brief>>({})
  const [strategy, setStrategy] = useState<Partial<Strategy>>({})

  const [documentContent, setDocumentContent] = useState(initialContent || '')
  const [editedContent, setEditedContent] = useState(initialContent || '')
  const [isEditing, setIsEditing] = useState(false)
  const [complianceEnabled, setComplianceEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // 加载项目数据
  useEffect(() => {
    const loadProjectData = async () => {
      if (!targetProjectId || targetProjectId === 'new') return

      setLoading(true)
      try {
        const [projectData, stepsData] = await Promise.all([
          getProject(targetProjectId),
          getProjectSteps(targetProjectId)
        ])
        setProject(projectData)
        setClientInfo(stepsData.clientInfo || {})
        setRequirements(stepsData.requirements || {})
        setCompetitors(stepsData.competitors || [])
        setBrief(stepsData.brief || {})
        setStrategy(stepsData.strategy || {})

        // 生成完整文档内容
        const fullContent = generateDocumentContent(
          stepsData.clientInfo,
          stepsData.requirements,
          stepsData.competitors,
          stepsData.brief,
          stepsData.strategy
        )
        setDocumentContent(fullContent)
        setEditedContent(fullContent)
      } catch (error) {
        console.error('加载项目失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProjectData()
  }, [targetProjectId])

  // 生成文档内容
  const generateDocumentContent = (
    clientInfo: Partial<ClientInfo>,
    requirements: Partial<Requirements>,
    competitors: Competitor[],
    brief: Partial<Brief>,
    strategy: Partial<Strategy>
  ): string => {
    const brandName = clientInfo.companyName || requirements.projectName || '品牌'
    const industry = clientInfo.industry || requirements.industry || '行业'
    const targetAudience = brief.targetAudience || requirements.targetAudience || '目标人群'

    return `# ${brandName}品牌策划方案

## 一、项目概述

**品牌名称：** ${brandName}
**所属行业：** ${industry}
**目标人群：** ${targetAudience}

## 二、背景分析

### 品牌现状
- **品牌阶段：** ${brief.brandStage || '（待填写）'}
- **当前市场表现：** ${brief.currentPerformance || '（待填写）'}
- **核心挑战：** ${brief.coreChallenge || '（待填写）'}

### 目标人群画像
- **人口属性：** ${brief.targetDemographic || '（待填写）'}
- **消费行为：** ${brief.consumerBehavior || '（待填写）'}
- **核心痛点：** ${(brief.corePainPoints || []).join('、') || '（待填写）'}

### 竞争分析
${competitors.length > 0
  ? competitors.map((c, i) => `- **${c.name}：** ${c.advantages || '（待填写）'}（差异化：${c.differentiation || '（待填写）'}）`).join('\n')
  : '- **（待添加竞品）**'}

## 三、策略定位

### 核心主张
${strategy.overallStrategy || '（待填写）'}

### 差异化优势
${strategy.differentiation || '（待填写）'}

### 创意方向
${strategy.contentStrategy || '（待填写）'}

## 四、传播规划

### 传播主题
${brief.themeSlogan || '（待填写）'}

### 传播渠道
${(brief.channels || []).join('、') || '（待填写）'}

### 内容方向
${brief.contentDirection || '（待填写）'}

---

*文档生成时间：${new Date().toLocaleString('zh-CN')}*
`
  }

  // 处理内容变更
  const handleContentChange = useCallback((newContent: string) => {
    setEditedContent(newContent)
    onContentChange?.(newContent)
  }, [onContentChange])

  // 保存文档
  const handleSave = useCallback(() => {
    // 保存到 localStorage 作为草稿
    if (targetProjectId && targetProjectId !== 'new') {
      localStorage.setItem(`document_draft_${targetProjectId}`, editedContent)
    }
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }, [targetProjectId, editedContent])

  // 复制文档
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(isEditing ? editedContent : documentContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [isEditing, editedContent, documentContent])

  // 导出文档
  const handleExport = useCallback(() => {
    const content = isEditing ? editedContent : documentContent
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project?.name || '文档'}_${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [isEditing, editedContent, documentContent, project])

  const displayContent = isEditing ? editedContent : documentContent

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/projects/workspace/${targetProjectId}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                返回工作台
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">
                {project?.name || '文档预览'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* 编辑/预览切换 */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setIsEditing(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    !isEditing ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  预览
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isEditing ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  编辑
                </button>
              </div>

              {/* 操作按钮 */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? '已复制' : '复制'}
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {saveSuccess ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Save className="w-4 h-4" />}
                {saveSuccess ? '已保存' : '保存'}
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                <Download className="w-4 h-4" />
                导出
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 文档内容区 */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-[calc(100vh-200px)] p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                placeholder="在此编辑文档内容..."
              />
            ) : (
              <div className="p-6 prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {documentContent || '暂无文档内容'}
                </pre>
              </div>
            )}
          </div>

          {/* 合规检测面板 */}
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-[73px]">
              <ComplianceChecker
                text={isEditing ? editedContent : documentContent}
                onTextChange={handleContentChange}
                isEnabled={complianceEnabled}
                onEnabledChange={setComplianceEnabled}
                autoCheck={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentPreview
