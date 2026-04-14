import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Save, Download, Home,
  Building2, Target, Users, FileText, Lightbulb,
  Check, ChevronRight, Share2, Sparkles, ArrowRight, RotateCcw, LayoutDashboard
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
  { key: 'clientInfo', name: '客户背景', icon: Building2, color: 'from-purple-500 to-pink-500' },
  { key: 'requirements', name: '项目需求', icon: Target, color: 'from-blue-500 to-cyan-500' },
  { key: 'competitors', name: '竞品分析', icon: Users, color: 'from-green-500 to-emerald-500' },
  { key: 'brief', name: '创意简报', icon: FileText, color: 'from-orange-500 to-yellow-500' },
  { key: 'strategy', name: '创意策略', icon: Lightbulb, color: 'from-red-500 to-rose-500' },
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

  return (
    <div className="min-h-screen relative z-10">
      {/* 顶部导航 */}
      <header className="glass rounded-2xl mx-4 mt-4 sticky top-0 z-20 shadow-xl border border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 返回首页按钮 */}
              <button
                onClick={() => navigate('/')}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all group"
                title="返回首页"
              >
                <Home className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
              
              <div className="w-px h-8 bg-white/20"></div>
              
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${STEPS[currentStep].color} flex items-center justify-center shadow-lg animate-pulse-soft`}>
                  {React.createElement(STEPS[currentStep].icon, { className: 'w-5 h-5 text-white' })}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">
                    {isNewProject ? '新建项目' : (project?.name || project?.clientName || '项目详情')}
                  </h1>
                  <p className="text-xs text-white/60">{STEPS[currentStep].name}</p>
                </div>
              </div>
            </div>

            {!isNewProject && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 btn-press"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            )}
          </div>

          {/* 步骤指示器 */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isCompleted = isStepCompleted(index)
              const isCurrent = index === currentStep

              return (
                <React.Fragment key={step.key}>
                  <button
                    onClick={() => !isNewProject && setCurrentStep(index)}
                    disabled={isNewProject}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                      isCurrent
                        ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                        : isCompleted
                        ? 'bg-green-500/20 text-green-200 hover:bg-green-500/30 backdrop-blur border border-green-500/20'
                        : 'bg-white/10 text-white/60 hover:bg-white/20 backdrop-blur border border-white/10'
                    } ${isNewProject ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span>{step.name}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </header>

      {/* 通知消息 */}
      {notification && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
          {notification.type === 'success' ? <Check className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="glass rounded-2xl shadow-xl border border-white/20 p-8 mb-6 animate-fade-in">
          {renderStepContent()}
        </div>

        {/* 底部导航 */}
        <div className="glass rounded-2xl shadow-xl border border-white/20 p-6 flex items-center justify-between animate-fade-in">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || isNewProject}
            className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors font-semibold flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur"
          >
            <ArrowLeft className="w-5 h-5" />
            上一步
          </button>

          <div className="text-sm text-white/50 backdrop-blur px-4 py-2 rounded-lg bg-white/5">
            步骤 {currentStep + 1} / {STEPS.length}
          </div>

          <button
            onClick={handleNext}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 btn-press"
          >
            {isNewProject ? '创建项目' : currentStep === STEPS.length - 1 ? '完成' : '下一步'}
            {!isNewProject && currentStep < STEPS.length - 1 && <ArrowRight className="w-5 h-5" />}
            {currentStep === STEPS.length - 1 && <Check className="w-5 h-5" />}
          </button>
        </div>
      </main>

      {/* 底部提示 */}
      <footer className="max-w-6xl mx-auto px-4 py-6 text-center relative z-10">
        <p className="text-sm text-white/40 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          每一步都会自动保存，您可以随时中断并继续
        </p>
      </footer>
    </div>
  )
}

export default WorkspacePage
