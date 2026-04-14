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
      {/* 顶部导航 - 玻璃态增强 */}
      <header className="glass-strong rounded-2xl mx-4 mt-4 sticky top-0 z-20 shadow-2xl border border-white/20 transition-all duration-300 animate-fade-in-down">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧区域 */}
            <div className="flex items-center gap-4">
              {/* 返回首页按钮 - 优化样式 */}
              <button
                onClick={() => navigate('/')}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all duration-300 group btn-glow"
                title="返回首页"
              >
                <Home className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
              </button>
              
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
              
              {/* 当前步骤信息 */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${STEPS[currentStep].color} flex items-center justify-center shadow-lg animate-pulse-glow relative`}>
                  {React.createElement(STEPS[currentStep].icon, { className: 'w-6 h-6 text-white' })}
                  {/* 步骤图标光晕 */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent opacity-0 animate-pulse"></div>
                </div>
                <div className="animate-fade-in">
                  <h1 className="text-lg font-bold text-white">
                    {isNewProject ? '新建项目' : (project?.name || project?.clientName || '项目详情')}
                  </h1>
                  <p className="text-xs text-white/60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"></span>
                    {STEPS[currentStep].name}
                  </p>
                </div>
              </div>
            </div>

            {/* 右侧操作区 */}
            {!isNewProject && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 btn-press btn-glow hover-glow relative overflow-hidden"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            )}
          </div>

          {/* 步骤指示器 - 增强样式 */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isCompleted = isStepCompleted(index)
              const isCurrent = index === currentStep

              return (
                <React.Fragment key={step.key}>
                  <button
                    onClick={() => !isNewProject && setCurrentStep(index)}
                    disabled={isNewProject}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap step-indicator ${
                      isCurrent
                        ? `bg-gradient-to-r ${step.color} text-white shadow-lg shadow-${step.color.split(' ')[1]}/30`
                        : isCompleted
                        ? 'bg-green-500/20 text-green-200 hover:bg-green-500/30 backdrop-blur border border-green-500/20'
                        : 'bg-white/10 text-white/60 hover:bg-white/20 backdrop-blur border border-white/10'
                    } ${isNewProject ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    {isCompleted ? (
                      <span className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </span>
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

      {/* 通知消息 - 动画增强 */}
      {notification && (
        <div className={`fixed top-28 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-bounce-in ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500/95 to-emerald-500/95 text-white border border-green-400/30' 
            : 'bg-gradient-to-r from-red-500/95 to-rose-500/95 text-white border border-red-400/30'
        }`}>
          {notification.type === 'success' ? (
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </span>
          ) : (
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </span>
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* 主内容 - 玻璃态卡片 */}
      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="glass-card rounded-2xl shadow-2xl border border-white/15 p-8 mb-6 animate-fade-in-up">
          {renderStepContent()}
        </div>

        {/* 底部导航 - 按钮优化 */}
        <div className="glass-strong rounded-2xl shadow-2xl border border-white/20 p-6 flex items-center justify-between animate-fade-in-up" style={{animationDelay: '100ms'}}>
          {/* 上一步按钮 */}
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || isNewProject}
            className="group px-6 py-3.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-300 font-semibold flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-md border border-white/10 hover:border-white/20 btn-press"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>上一步</span>
          </button>

          {/* 步骤进度指示 */}
          <div className="flex items-center gap-3 backdrop-blur px-5 py-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-sm text-white/60">步骤</span>
            <span className="text-white font-bold text-lg">{currentStep + 1}</span>
            <span className="text-sm text-white/40">/</span>
            <span className="text-white/60 text-sm">{STEPS.length}</span>
          </div>

          {/* 下一步/完成按钮 - 优化：不换行，增加宽度 */}
          <button
            onClick={handleNext}
            disabled={saving}
            className="group relative px-10 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl flex items-center gap-3 disabled:opacity-50 btn-press btn-shine overflow-hidden whitespace-nowrap animate-gradient"
            style={{
              backgroundSize: '200% 200%',
              animation: 'gradientShift 3s ease infinite'
            }}
          >
            {/* 按钮光效 */}
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
            
            <span className="relative z-10 flex items-center gap-2">
              {isNewProject ? (
                <>
                  <span className="text-base">创建项目</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              ) : currentStep === STEPS.length - 1 ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="text-base">完成</span>
                </>
              ) : (
                <>
                  <span className="text-base">下一步</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </span>
          </button>
        </div>
      </main>

      {/* 底部提示 - 美化 */}
      <footer className="max-w-6xl mx-auto px-4 py-6 text-center relative z-10">
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse"></div>
          <p className="text-sm text-white/50 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400/70" />
            每一步都会自动保存，您可以随时中断并继续
          </p>
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
      </footer>
    </div>
  )
}

export default WorkspacePage
