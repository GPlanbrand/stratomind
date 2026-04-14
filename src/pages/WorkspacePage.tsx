import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Save, Home,
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

const WorkspacePage: React.FC = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const isNewProject = projectId === 'new'

  const [currentStep, setCurrentStep] = useState(0)
  const [project, setProject] = useState<Project | null>(null)
  const [clientInfo, setClientInfo] = useState<Partial<ClientInfo>>({})
  const [requirements, setRequirements] = useState<Partial<Requirements>>({})
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [brief, setBrief] = useState<Partial<Brief>>({})
  const [strategy, setStrategy] = useState<Partial<Strategy>>({})
  
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

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
      return
    }

    try {
      setSaving(true)
      const newProject = await createProject({
        name: clientInfo.companyName + '品牌策划',
        clientName: clientInfo.companyName,
      })
      setProject(newProject)
      navigate(`/workspace/${newProject.id}`, { replace: true })
      showNotification('success', '项目创建成功')
    } catch (error) {
      console.error('创建项目失败:', error)
      showNotification('error', '创建项目失败')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!project?.id) return

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
    if (isNewProject) {
      await handleCreateProject()
      return
    }

    await handleSave()

    if (currentStep < STEPS.length - 1) {
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ClientInfoStep data={clientInfo} onChange={setClientInfo} />
      case 1:
        return <RequirementsStep data={requirements} onChange={setRequirements} />
      case 2:
        return <CompetitorStep data={{ competitors }} onChange={(data) => setCompetitors(data.competitors)} />
      case 3:
        return <BriefStep data={brief} onChange={setBrief} />
      case 4:
        return <StrategyStep data={strategy} onChange={setStrategy} />
      default:
        return null
    }
  }

  const stepColors = ['bg-purple-100 text-purple-600', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-orange-100 text-orange-600', 'bg-red-100 text-red-600']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧区域 */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                title="返回首页"
              >
                <Home className="w-5 h-5" />
              </button>
              
              <div className="w-px h-8 bg-gray-200"></div>
              
              {/* 当前步骤信息 */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stepColors[currentStep]} flex items-center justify-center`}>
                  {React.createElement(STEPS[currentStep].icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {isNewProject ? '新建项目' : (project?.name || project?.clientName || '项目详情')}
                  </h1>
                  <p className="text-sm text-gray-500">{STEPS[currentStep].name}</p>
                </div>
              </div>
            </div>

            {/* 右侧操作区 */}
            {!isNewProject && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            )}
          </div>

          {/* 步骤指示器 */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isCompleted = isStepCompleted(index)
              const isCurrent = index === currentStep

              return (
                <React.Fragment key={step.key}>
                  <button
                    onClick={() => !isNewProject && setCurrentStep(index)}
                    disabled={isNewProject}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      isCurrent
                        ? 'bg-gray-900 text-white'
                        : isCompleted
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${isNewProject ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    {isCompleted ? (
                      <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span>{step.name}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </header>

      {/* 通知消息 */}
      {notification && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
          notification.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* 底部导航 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || isNewProject}
            className="flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>上一步</span>
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{currentStep + 1}</span>
            <span>/</span>
            <span>{STEPS.length}</span>
          </div>

          <button
            onClick={handleNext}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <span>
              {isNewProject ? '创建项目' : currentStep === STEPS.length - 1 ? '完成' : '下一步'}
            </span>
            {!isNewProject && currentStep < STEPS.length - 1 && (
              <ArrowLeft className="w-4 h-4 rotate-180" />
            )}
          </button>
        </div>
      </main>

      {/* 底部提示 */}
      <footer className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
        填写完整信息以获得更精准的品牌策略建议
      </footer>
    </div>
  )
}

export default WorkspacePage
