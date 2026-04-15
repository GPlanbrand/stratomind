import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Save, Home, Cloud,
  Building2, Target, Users, FileText, Lightbulb,
  Check, ChevronRight
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
  { key: 'clientInfo', name: '客户背景', icon: Building2 },
  { key: 'requirements', name: '项目需求', icon: Target },
  { key: 'competitors', name: '竞品分析', icon: Users },
  { key: 'brief', name: '创意简报', icon: FileText },
  { key: 'strategy', name: '创意策略', icon: Lightbulb },
]

// localStorage 草稿存储键
const DRAFT_KEY_PREFIX = 'workspace_draft_'

const WorkspacePage: React.FC = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const isNewProject = projectId === 'new'
  const currentProjectId = projectId === 'new' ? 'new' : projectId

  const [currentStep, setCurrentStep] = useState(0)
  const [project, setProject] = useState<Project | null>(null)
  const [clientInfo, setClientInfo] = useState<Partial<ClientInfo>>({})
  const [requirements, setRequirements] = useState<Partial<Requirements>>({})
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [brief, setBrief] = useState<Partial<Brief>>({})
  const [strategy, setStrategy] = useState<Partial<Strategy>>({})
  
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [draftRestored, setDraftRestored] = useState(false)

  // 防抖定时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  // 自动保存定时器引用
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 从localStorage读取草稿
  const loadDraft = useCallback(() => {
    if (isNewProject) {
      const draftKey = `${DRAFT_KEY_PREFIX}new`
      const savedDraft = localStorage.getItem(draftKey)
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft)
          if (draft.clientInfo?.companyName) {
            setClientInfo(draft.clientInfo || {})
            setRequirements(draft.requirements || {})
            setCompetitors(draft.competitors || [])
            setBrief(draft.brief || {})
            setStrategy(draft.strategy || {})
            setDraftRestored(true)
            return true
          }
        } catch (e) {
          console.error('读取草稿失败:', e)
        }
      }
    }
    return false
  }, [isNewProject])

  // 保存草稿到localStorage
  const saveDraft = useCallback(() => {
    const draftKey = `${DRAFT_KEY_PREFIX}${currentProjectId || 'new'}`
    const draft = {
      clientInfo,
      requirements,
      competitors,
      brief,
      strategy,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(draftKey, JSON.stringify(draft))
  }, [currentProjectId, clientInfo, requirements, competitors, brief, strategy])

  // 清除草稿
  const clearDraft = useCallback(() => {
    const draftKey = `${DRAFT_KEY_PREFIX}${currentProjectId || 'new'}`
    localStorage.removeItem(draftKey)
  }, [currentProjectId])

  // 静默自动保存（不显示通知）
  const autoSave = useCallback(async () => {
    if (!project?.id && !isNewProject) return
    if (isNewProject && !clientInfo.companyName) return

    setAutoSaving(true)
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
      setLastAutoSave(new Date())
    } catch (error) {
      console.error('自动保存失败:', error)
    } finally {
      setAutoSaving(false)
    }
  }, [project, clientInfo, requirements, competitors, brief, strategy, currentStep, isNewProject, navigate, clearDraft])

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
      loadDraft()
    }
  }, [isNewProject, loadDraft])

  useEffect(() => {
    // 表单内容变化时保存草稿
    if (isNewProject && (clientInfo.companyName || requirements.projectType || competitors.length > 0 || brief.projectOverview || strategy.overallStrategy)) {
      debouncedSaveDraft()
    }
  }, [clientInfo, requirements, competitors, brief, strategy, isNewProject, debouncedSaveDraft])

  useEffect(() => {
    // 30秒自动保存
    autoSaveTimerRef.current = setInterval(() => {
      if (project?.id || (isNewProject && clientInfo.companyName)) {
        autoSave()
      }
    }, 30000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [project, isNewProject, clientInfo, autoSave])

  useEffect(() => {
    // 切换步骤时自动保存
    if (project?.id) {
      autoSave()
    }
  }, [currentStep])

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
  }, [projectId])

  const loadProject = async () => {
    try {
      const [projectData, stepsData] = await Promise.all([
        getProject(projectId!),
        getProjectSteps(projectId!)
      ])
      setProject(projectData)
      setClientInfo(stepsData.clientInfo || {})
      setRequirements(stepsData.requirements || {})
      setCompetitors(stepsData.competitors || [])
      setBrief(stepsData.brief || {})
      setStrategy(stepsData.strategy || {})
    } catch (error) {
      console.error('加载项目失败:', error)
      showNotification('error', '加载项目失败')
    }
  }

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

      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">返回</span>
            </button>
            
            <div className="flex items-center gap-4">
              {/* 自动保存状态 */}
              {autoSaving && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Cloud className="w-4 h-4 animate-pulse" />
                  <span>保存中...</span>
                </div>
              )}
              {!autoSaving && lastAutoSave && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Cloud className="w-4 h-4" />
                  <span>已保存 {lastAutoSave.toLocaleTimeString()}</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">{saving ? '保存中...' : '保存'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 步骤指示器 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center overflow-x-auto py-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const completed = isStepCompleted(index)
              const active = index === currentStep
              
              return (
                <div key={step.key} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(index)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                      active ? 'bg-gray-900 text-white' : completed ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {completed ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    <span className="text-sm font-medium">{step.name}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {renderStep()}
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一步
            </button>
            
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={saving}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? '保存中...' : '下一步'}
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '完成'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkspacePage
