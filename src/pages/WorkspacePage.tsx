import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  ArrowLeft, Save, Home, Cloud, CloudOff,
  Building2, Target, Users, FileText, Lightbulb,
  Check, ChevronRight, Loader2, AlertCircle,
  Printer, Eye, Shield
} from 'lucide-react'
import ClientInfoStep from '../components/ClientInfoStep'
import RequirementsStep from '../components/RequirementsStep'
import CompetitorStep from '../components/CompetitorStep'
import BriefStep from '../components/BriefStep'
import StrategyStep from '../components/StrategyStep'
import { 
  getProject, getProjectSteps, createProject,
  saveClientInfo, saveRequirements, saveCompetitors, saveBrief, saveStrategy
} from '../services/api'
import { Project, ClientInfo, Requirements, Competitor, Brief, Strategy } from '../types'

const STEPS = [
  { key: 'clientInfo', name: '背景', icon: Building2 },
  { key: 'requirements', name: '需求', icon: Target },
  { key: 'competitors', name: '竞品', icon: Users },
  { key: 'brief', name: '简报', icon: FileText },
  { key: 'strategy', name: '策略', icon: Lightbulb },
]

// 自动保存数据接口
export interface AutoSaveData {
  projectId: string;
  lastSaved: string;
  clientInfo: Partial<ClientInfo>;
  requirements: Partial<Requirements>;
  competitors: Competitor[];
  brief: Partial<Brief>;
  strategy: Partial<Strategy>;
}

// localStorage 草稿存储键
const DRAFT_KEY_PREFIX = 'workspace_draft_'
const AUTO_SAVE_INTERVAL = 30000 // 30秒

const WorkspacePage: React.FC = () => {
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const isNewProject = projectId === 'new'
  const currentProjectId = isNewProject ? 'new' : projectId || 'new'

  // 从 URL 读取步骤，默认为 0
  const stepFromUrl = parseInt(searchParams.get('step') || '0', 10)
  const [currentStep, setCurrentStepState] = useState(Math.max(0, Math.min(stepFromUrl, STEPS.length - 1)))
  
  // 设置步骤并更新 URL
  const setCurrentStep = useCallback((step: number) => {
    setCurrentStepState(step)
    setSearchParams({ step: String(step) })
  }, [setSearchParams])
  
  // 监听 URL 参数变化，同步步骤
  useEffect(() => {
    const newStep = Math.max(0, Math.min(stepFromUrl, STEPS.length - 1))
    if (newStep !== currentStep) {
      setCurrentStepState(newStep)
    }
  }, [stepFromUrl])
  
  const [project, setProject] = useState<Project | null>(null)
  const [clientInfo, setClientInfo] = useState<Partial<ClientInfo>>({})
  const [requirements, setRequirements] = useState<Partial<Requirements>>({})
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [brief, setBrief] = useState<Partial<Brief>>({})
  const [strategy, setStrategy] = useState<Partial<Strategy>>({})
  
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null)
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [draftRestored, setDraftRestored] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 防抖定时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  // 自动保存定时器引用
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  // 用于追踪数据是否变化
  const lastSavedDataRef = useRef<string>('')

  // 深度比较两个对象是否相等
  const deepEqual = (a: unknown, b: unknown): boolean => {
    if (a === b) return true
    if (a == null || b == null) return false
    if (typeof a !== typeof b) return false
    if (typeof a !== 'object') return false
    
    const keysA = Object.keys(a as object)
    const keysB = Object.keys(b as object)
    
    if (keysA.length !== keysB.length) return false
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false
      const valA = (a as Record<string, unknown>)[key]
      const valB = (b as Record<string, unknown>)[key]
      
      if (Array.isArray(valA) && Array.isArray(valB)) {
        if (valA.length !== valB.length) return false
        for (let i = 0; i < valA.length; i++) {
          if (JSON.stringify(valA[i]) !== JSON.stringify(valB[i])) return false
        }
      } else if (!deepEqual(valA, valB)) {
        return false
      }
    }
    return true
  }

  // 获取当前数据的快照
  const getCurrentDataSnapshot = useCallback(() => {
    return JSON.stringify({
      clientInfo,
      requirements,
      competitors,
      brief,
      strategy
    })
  }, [clientInfo, requirements, competitors, brief, strategy])

  // 检查是否有未保存的更改
  const checkForChanges = useCallback(() => {
    const currentData = getCurrentDataSnapshot()
    return currentData !== lastSavedDataRef.current
  }, [getCurrentDataSnapshot])

  // 获取草稿键名
  const getDraftKey = useCallback((pid: string) => {
    return `${DRAFT_KEY_PREFIX}${pid}`
  }, [])

  // 从localStorage读取草稿
  const loadDraft = useCallback((pid: string): boolean => {
    const draftKey = getDraftKey(pid)
    const savedDraft = localStorage.getItem(draftKey)
    if (savedDraft) {
      try {
        const draft: AutoSaveData = JSON.parse(savedDraft)
        // 检查草稿是否有实质内容
        if (draft.clientInfo?.companyName || draft.requirements?.projectType || 
            (draft.competitors && draft.competitors.length > 0) || 
            draft.brief?.projectOverview || draft.strategy?.overallStrategy) {
          setClientInfo(draft.clientInfo || {})
          setRequirements(draft.requirements || {})
          setCompetitors(draft.competitors || [])
          setBrief(draft.brief || {})
          setStrategy(draft.strategy || {})
          
          // 更新最后保存的数据引用
          lastSavedDataRef.current = JSON.stringify({
            clientInfo: draft.clientInfo,
            requirements: draft.requirements,
            competitors: draft.competitors,
            brief: draft.brief,
            strategy: draft.strategy
          })
          
          return true
        }
      } catch (e) {
        console.error('读取草稿失败:', e)
      }
    }
    return false
  }, [getDraftKey])

  // 保存草稿到localStorage
  const saveDraft = useCallback(() => {
    const draft: AutoSaveData = {
      projectId: currentProjectId,
      lastSaved: new Date().toISOString(),
      clientInfo,
      requirements,
      competitors,
      brief,
      strategy
    }
    localStorage.setItem(getDraftKey(currentProjectId), JSON.stringify(draft))
  }, [currentProjectId, clientInfo, requirements, competitors, brief, strategy, getDraftKey])

  // 清除草稿
  const clearDraft = useCallback((pid?: string) => {
    const targetId = pid || currentProjectId
    localStorage.removeItem(getDraftKey(targetId))
  }, [currentProjectId, getDraftKey])

  // 获取草稿的最后保存时间
  const getDraftLastSavedTime = useCallback((pid: string): Date | null => {
    const draftKey = getDraftKey(pid)
    const savedDraft = localStorage.getItem(draftKey)
    if (savedDraft) {
      try {
        const draft: AutoSaveData = JSON.parse(savedDraft)
        return new Date(draft.lastSaved)
      } catch {
        return null
      }
    }
    return null
  }, [getDraftKey])

  // 静默自动保存（不显示通知，只更新最后保存时间）
  const performAutoSaveToLocal = useCallback(() => {
    // 只有数据有变化时才保存
    if (!checkForChanges()) {
      return false
    }
    
    saveDraft()
    lastSavedDataRef.current = getCurrentDataSnapshot()
    setHasUnsavedChanges(false)
    return true
  }, [checkForChanges, saveDraft, getCurrentDataSnapshot])

  // 30秒自动保存到服务器
  const autoSave = useCallback(async () => {
    // 只有数据有变化时才保存
    if (!checkForChanges()) {
      return
    }
    
    if (!project?.id && !isNewProject) return
    if (isNewProject && !clientInfo.companyName) return

    setAutoSaving(true)
    setAutoSaveError(null)
    try {
      if (isNewProject && !project?.id) {
        // 新项目且未创建，先创建项目
        const newProject = await createProject({
          name: clientInfo.companyName + '品牌策划',
          clientName: clientInfo.companyName,
        })
        setProject(newProject)
        await saveClientInfo(newProject.id, clientInfo)
        // 更新URL
        navigate(`/projects/workspace/${newProject.id}`, { replace: true })
        // 清除草稿
        clearDraft()
      } else if (project?.id) {
        // 已创建的项目，保存当前步骤
        switch (currentStep) {
          case 0:
            await saveClientInfo(project.id, clientInfo)
            break
          case 1:
            await saveRequirements(project.id, requirements)
            break
          case 2:
            await saveCompetitors(project.id, competitors)
            break
          case 3:
            await saveBrief(project.id, brief)
            break
          case 4:
            await saveStrategy(project.id, strategy)
            break
        }
        // 清除草稿
        clearDraft()
      }
      
      // 更新最后保存的数据引用
      lastSavedDataRef.current = getCurrentDataSnapshot()
      setLastAutoSave(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('自动保存失败:', error)
      setAutoSaveError('自动保存失败')
    } finally {
      setAutoSaving(false)
    }
  }, [project, clientInfo, requirements, competitors, brief, strategy, currentStep, isNewProject, navigate, clearDraft, checkForChanges, getCurrentDataSnapshot])

  // 防抖保存草稿（表单变化时）
  const debouncedSaveDraft = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      saveDraft()
    }, 1000) // 1秒后保存草稿
  }, [saveDraft])

  useEffect(() => {
    // 页面加载时尝试恢复草稿
    if (isNewProject) {
      const restored = loadDraft('new')
      if (restored) {
        setDraftRestored(true)
        setTimeout(() => setDraftRestored(false), 5000)
      }
    }
  }, [isNewProject, loadDraft])

  useEffect(() => {
    // 表单内容变化时标记为未保存
    const currentData = getCurrentDataSnapshot()
    if (currentData !== lastSavedDataRef.current) {
      setHasUnsavedChanges(true)
    }
  }, [clientInfo, requirements, competitors, brief, strategy, getCurrentDataSnapshot])

  useEffect(() => {
    // 表单内容变化时保存草稿（防抖）
    if (isNewProject && (clientInfo.companyName || requirements.projectType || competitors.length > 0 || brief.projectOverview || strategy.overallStrategy)) {
      debouncedSaveDraft()
    }
  }, [clientInfo, requirements, competitors, brief, strategy, isNewProject, debouncedSaveDraft])

  useEffect(() => {
    // 30秒自动保存定时器
    autoSaveTimerRef.current = setInterval(() => {
      if (project?.id || (isNewProject && clientInfo.companyName)) {
        // 先保存到本地草稿
        performAutoSaveToLocal()
        // 再尝试保存到服务器
        autoSave()
      }
    }, AUTO_SAVE_INTERVAL)

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [project, isNewProject, clientInfo, autoSave, performAutoSaveToLocal])

  useEffect(() => {
    // 切换步骤时自动保存
    if (project?.id) {
      autoSave()
    }
  }, [currentStep])

  // 加载项目数据
  const loadProject = useCallback(async () => {
    if (!projectId) {
      // 没有项目ID，跳转到新建项目
      navigate('/projects/workspace/new', { replace: true })
      return
    }
    
    try {
      const [projectData, stepsData] = await Promise.all([
        getProject(projectId),
        getProjectSteps(projectId)
      ])
      setProject(projectData)
      setClientInfo(stepsData.clientInfo || {})
      setRequirements(stepsData.requirements || {})
      setCompetitors(stepsData.competitors || [])
      setBrief(stepsData.brief || {})
      setStrategy(stepsData.strategy || {})
      
      // 更新最后保存的数据引用
      lastSavedDataRef.current = JSON.stringify({
        clientInfo: stepsData.clientInfo,
        requirements: stepsData.requirements,
        competitors: stepsData.competitors,
        brief: stepsData.brief,
        strategy: stepsData.strategy
      })
      setLastAutoSave(new Date(projectData.updatedAt))
      
      // 检查是否有本地草稿，如果有且比服务器新，提示用户
      const localDraftTime = getDraftLastSavedTime(projectId)
      if (localDraftTime && localDraftTime > new Date(projectData.updatedAt)) {
        // 本地草稿比服务器新，询问用户是否恢复
        const shouldRestore = window.confirm('检测到本地有未同步的草稿，是否恢复？')
        if (shouldRestore) {
          loadDraft(projectId)
          setDraftRestored(true)
          setTimeout(() => setDraftRestored(false), 5000)
        }
      }
    } catch (error) {
      console.error('加载项目失败:', error)
      // 项目不存在，跳转到项目列表
      navigate('/projects', { replace: true })
    }
  }, [projectId, getDraftLastSavedTime, loadDraft, navigate])

  useEffect(() => {
    // 清理防抖定时器
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isNewProject && projectId) {
      loadProject()
    }
  }, [projectId, loadProject])

  // 设置AI上下文数据到全局变量，供AI组件使用
  useEffect(() => {
    const contextData = {
      __workspaceClientInfo: clientInfo,
      __workspaceRequirements: requirements,
      __workspaceCompetitors: competitors,
      __workspaceBrief: brief,
      __workspaceStrategy: strategy,
    }
    // 设置到全局
    Object.assign(window, contextData)
  }, [clientInfo, requirements, competitors, brief, strategy])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCreateProject = async () => {
    if (!clientInfo.companyName) {
      showNotification('error', '请填写公司名称')
      return false
    }

    try {
      setSaving(true)
      const newProject = await createProject({
        name: clientInfo.companyName + '品牌策划',
        clientName: clientInfo.companyName,
      })
      setProject(newProject)
      // 保存客户信息
      await saveClientInfo(newProject.id, clientInfo)
      // 清除草稿
      clearDraft()
      navigate(`/projects/workspace/${newProject.id}`, { replace: true })
      showNotification('success', '项目创建成功')
      return true
    } catch (error) {
      console.error('创建项目失败:', error)
      showNotification('error', '创建项目失败')
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!project?.id) {
      // 如果项目不存在，先创建
      const created = await handleCreateProject()
      if (created && currentStep > 0) {
        // 创建后自动进入下一步
        if (currentStep < STEPS.length - 1) {
          setCurrentStep(currentStep + 1)
        }
      }
      return
    }

    try {
      setSaving(true)
      switch (currentStep) {
        case 0:
          await saveClientInfo(project.id, clientInfo)
          break
        case 1:
          await saveRequirements(project.id, requirements)
          break
        case 2:
          await saveCompetitors(project.id, competitors)
          break
        case 3:
          await saveBrief(project.id, brief)
          break
        case 4:
          await saveStrategy(project.id, strategy)
          break
      }
      showNotification('success', '保存成功')
    } catch (error) {
      console.error('保存失败:', error)
      showNotification('error', '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    // 保存当前步骤
    await handleSave()
    
    // 如果是新建项目且当前是第一步，创建项目
    if (isNewProject && currentStep === 0) {
      // handleSave已经处理了创建
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepCompleted = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: return !!clientInfo.companyName
      case 1: return !!requirements.projectType
      case 2: return competitors.length > 0
      case 3: return !!brief.projectOverview
      case 4: return !!strategy.overallStrategy
      default: return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ClientInfoStep data={clientInfo} onChange={setClientInfo} />
      case 1:
        return <RequirementsStep data={requirements} onChange={setRequirements} />
      case 2:
        return <CompetitorStep data={competitors} onChange={setCompetitors} />
      case 3:
        return <BriefStep data={brief} onChange={setBrief} />
      case 4:
        return <StrategyStep data={strategy} onChange={setStrategy} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 草稿恢复提示 */}
      {draftRestored && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg text-sm">
          已自动恢复上次未提交的草稿
        </div>
      )}

      {/* 通知提示 */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* 顶部导航 - 移动端适配 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 text-sm"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">返回</span>
              </button>
              {/* 项目名称 */}
              <span className="text-sm sm:text-base font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[300px]">
                {isNewProject 
                  ? (clientInfo.companyName || '新建项目')
                  : project?.name}
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {/* 自动保存状态 */}
              {autoSaving && (
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-blue-500">
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden sm:inline">自动保存中...</span>
                </div>
              )}
              {!autoSaving && autoSaveError && (
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-red-500">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{autoSaveError}</span>
                </div>
              )}
              {!autoSaving && !autoSaveError && lastAutoSave && (
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-400">
                  <Cloud className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span className="hidden sm:inline">已保存 {lastAutoSave.toLocaleTimeString()}</span>
                </div>
              )}
              {!autoSaving && !autoSaveError && !lastAutoSave && (
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-400">
                  <CloudOff className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">未保存</span>
                </div>
              )}
              {hasUnsavedChanges && (
                <span className="text-xs text-amber-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"></span>
                  <span className="hidden sm:inline">有未保存的更改</span>
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{saving ? '保存中...' : '保存'}</span>
                <span className="sm:hidden">{saving ? '...' : '保存'}</span>
              </button>
              {!isNewProject && projectId && (
                <>
                  <button
                    onClick={() => navigate(`/projects/preview/${projectId}`)}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-blue-200 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                    title="文档预览与合规检测"
                  >
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">合规检测</span>
                    <span className="sm:hidden">检测</span>
                  </button>
                  <button
                    onClick={() => navigate(`/projects/report/${projectId}`)}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                  >
                    <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">导出报告</span>
                    <span className="sm:hidden">报告</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 步骤指示器 - 移动端适配 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="flex items-center -mx-1 py-2 sm:py-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const completed = isStepCompleted(index)
              const active = index === currentStep
              
              return (
                <div key={step.key} className="flex items-center flex-1 min-w-0 px-0.5 sm:px-1">
                  <button
                    onClick={() => setCurrentStep(index)}
                    className={`flex flex-col items-center justify-center w-full py-1.5 rounded-lg transition-all min-w-0 ${
                      active ? 'bg-gray-900 text-white' : completed ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {completed ? <Check className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> : <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />}
                      <span className="text-[10px] xs:text-xs sm:text-sm font-medium truncate max-w-[40px] xs:max-w-[50px] sm:max-w-none">{step.name}</span>
                    </div>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={`w-1.5 sm:w-3 flex-shrink-0 ${active ? 'text-white' : 'text-gray-300'}`}>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 内容区域 - 移动端适配 */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-28 sm:pb-24">
        {renderStep()}
      </div>

      {/* 底部操作栏 - 移动端适配 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">上一步</span>
              <span className="sm:hidden">← 上一步</span>
            </button>
            
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={saving}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? '保存中...' : '下一步 →'}
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '完成 ✓'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkspacePage
