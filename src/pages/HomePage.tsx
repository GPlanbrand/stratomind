import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, ChevronRight, Layers, Building2, Target, BarChart3, FileText, Lightbulb, Clock, Home } from 'lucide-react'
import { getProjects, getProjectSteps } from '../services/api'
import { Project, ProjectSteps } from '../types'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsSteps, setProjectsSteps] = useState<Record<string, ProjectSteps>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const projectsData = await getProjects()
      setProjects(projectsData)

      const stepsMap: Record<string, ProjectSteps> = {}
      for (const project of projectsData) {
        try {
          const steps = await getProjectSteps(project.id)
          stepsMap[project.id] = steps
        } catch (error) {
          console.error(`加载项目 ${project.id} 步骤失败:`, error)
        }
      }
      setProjectsSteps(stepsMap)
    } catch (error) {
      console.error('加载项目失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressInfo = (projectId: string) => {
    const steps = projectsSteps[projectId]
    if (!steps) return { progress: 0, label: '未开始', color: 'gray' }

    const hasClientInfo = !!steps.clientInfo
    const hasRequirements = !!steps.requirements
    const hasCompetitors = steps.competitors && steps.competitors.length > 0
    const hasBrief = !!steps.brief
    const hasStrategy = !!steps.strategy

    const completedSteps = [hasClientInfo, hasRequirements, hasCompetitors, hasBrief, hasStrategy].filter(Boolean).length
    const progress = (completedSteps / 5) * 100

    let label = '未开始'
    let color = 'gray'
    if (completedSteps === 0) {
      label = '未开始'
      color = 'gray'
    } else if (completedSteps === 1) {
      label = '刚启动'
      color = 'purple'
    } else if (completedSteps === 2) {
      label = '进行中'
      color = 'blue'
    } else if (completedSteps === 3) {
      label = '大半程'
      color = 'yellow'
    } else if (completedSteps === 4) {
      label = '即将完成'
      color = 'green'
    } else if (completedSteps === 5) {
      label = '已完成'
      color = 'emerald'
    }

    return { progress, completedSteps, totalSteps: 5, label, color }
  }

  const getStepName = (index: number) => {
    const names = ['客户背景', '项目需求', '竞品分析', '创意简报', '创意策略']
    return names[index] || ''
  }

  const getCurrentStep = (projectId: string) => {
    const steps = projectsSteps[projectId]
    if (!steps) return 0
    
    if (!steps.clientInfo) return 0
    if (!steps.requirements) return 1
    if (!steps.competitors || steps.competitors.length === 0) return 2
    if (!steps.brief) return 3
    if (!steps.strategy) return 4
    return 4
  }

  const handleCreateProject = () => {
    navigate('/workspace/new')
  }

  const handleOpenProject = (projectId: string) => {
    navigate(`/workspace/${projectId}`)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-white/10 border-t-purple-400 rounded-full animate-spin mx-auto mb-8"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-pulse opacity-50"></div>
            </div>
          </div>
          <p className="text-white/80 text-lg font-medium animate-pulse">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative z-10">
      {/* 顶部导航 - 玻璃态增强 */}
      <header className="glass-strong rounded-2xl mx-4 mt-4 sticky top-0 z-10 shadow-2xl border border-white/20 transition-all duration-300 animate-fade-in-down">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Logo区域 */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-xl animate-float relative overflow-hidden">
                  <Layers className="w-8 h-8 text-white relative z-10" />
                  {/* 光效 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                </div>
                {/* 背景光晕 */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/50 to-pink-500/50 blur-xl -z-10 animate-pulse"></div>
              </div>
              <div className="animate-fade-in">
                <h1 className="text-2xl font-bold text-white">品牌策划工作台</h1>
                <p className="text-sm text-white/60">Brand Strategy Studio</p>
              </div>
            </div>
            
            {/* 状态指示器 */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur border border-white/10">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></div>
                <span className="text-white/80 text-sm font-medium">在线服务</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* 新建项目按钮 - 动画增强 */}
        <div className="mb-8 animate-fade-in-up">
          <button
            onClick={handleCreateProject}
            className="w-full py-6 px-8 glass-strong hover:glass-strong rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 flex items-center justify-center gap-4 group border-2 border-dashed border-white/25 hover:border-white/40 home-button relative overflow-hidden"
          >
            {/* 背景渐变 */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
            
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg group-hover:shadow-xl">
                <Plus className="w-7 h-7 text-white group-hover:rotate-90 transition-transform duration-500" />
              </div>
              <div className="text-left">
                <span className="text-2xl text-white group-hover:text-white/90 transition-colors">创建新项目</span>
                <p className="text-sm text-white/50 mt-1">开始您的品牌策划之旅</p>
              </div>
            </div>
          </button>
        </div>

        {/* 项目列表 */}
        {projects.length === 0 ? (
          <div className="glass-strong rounded-2xl p-16 shadow-2xl border border-white/20 text-center animate-fade-in-up">
            <div className="relative inline-block mb-8">
              <div className="w-28 h-28 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20">
                <Layers className="w-14 h-14 text-white/70" />
              </div>
              {/* 装饰光晕 */}
              <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl -z-10"></div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">暂无项目</h3>
            <p className="text-white/60 mb-10 text-lg">点击上方按钮创建您的第一个品牌策划项目</p>
            <button
              onClick={handleCreateProject}
              className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 mx-auto btn-press btn-shine"
            >
              <Plus className="w-5 h-5" />
              <span className="text-lg">立即创建</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* 标题区域 */}
            <h2 className="text-xl font-semibold text-white flex items-center gap-3 animate-slide-in-left">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur border border-white/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span>项目总览</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-sm text-white/70 backdrop-blur">({projects.length})</span>
            </h2>

            {/* 项目卡片列表 */}
            <div className="grid gap-5">
              {projects.map((project, idx) => {
                const progressInfo = getProgressInfo(project.id)
                const currentStep = getCurrentStep(project.id)
                const steps = projectsSteps[project.id]

                return (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProject(project.id)}
                    className="glass-card rounded-2xl p-6 shadow-xl border border-white/15 hover:border-white/25 transition-all duration-500 cursor-pointer group card-hover animate-fade-in-up"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* 项目头部信息 */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all border border-white/10">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-white truncate group-hover:text-white/90 transition-colors">
                              {project.name || '未命名项目'}
                            </h3>
                            {project.clientName && (
                              <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                                <Building2 className="w-4 h-4 text-white/40" />
                                <span>{project.clientName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* 行业标签 */}
                        {steps?.clientInfo?.industry && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white/90 text-xs rounded-lg backdrop-blur border border-white/10 font-medium">
                              {steps.clientInfo.industry}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 状态和操作 */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className={`px-5 py-2 rounded-full text-xs font-bold backdrop-blur transition-all ${
                          progressInfo.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-emerald-200 border border-emerald-400/30' :
                          progressInfo.color === 'green' ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-200 border border-green-400/30' :
                          progressInfo.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-200 border border-yellow-400/30' :
                          progressInfo.color === 'blue' ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-200 border border-blue-400/30' :
                          progressInfo.color === 'purple' ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 border border-purple-400/30' :
                          'bg-white/10 text-white/60 border border-white/10'
                        }`}>
                          {progressInfo.label}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                          <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* 进度条 - 增强样式 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          完成进度
                        </span>
                        <span className="text-white font-bold">
                          {progressInfo.completedSteps || 0}/{progressInfo.totalSteps} 步骤
                        </span>
                      </div>
                      <div className="relative h-3 bg-white/5 rounded-full overflow-hidden backdrop-blur border border-white/10">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                            progressInfo.color === 'emerald' ? 'bg-gradient-to-r from-emerald-400 to-green-300' :
                            progressInfo.color === 'green' ? 'bg-gradient-to-r from-green-400 to-emerald-300' :
                            progressInfo.color === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-amber-300' :
                            progressInfo.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-cyan-300' :
                            progressInfo.color === 'purple' ? 'bg-gradient-to-r from-purple-400 to-pink-400' :
                            'bg-white/20'
                          }`}
                          style={{ width: `${progressInfo.progress}%` }}
                        >
                          {/* 进度条光效 */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>

                    {/* 步骤指示器 - 美化 */}
                    <div className="mt-6 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
                      {[0, 1, 2, 3, 4].map((index) => {
                        const isCompleted = index < currentStep || (index === 4 && progressInfo.progress === 100)
                        const isCurrent = index === currentStep
                        const hasData = [
                          steps?.clientInfo,
                          steps?.requirements,
                          steps?.competitors?.length,
                          steps?.brief,
                          steps?.strategy
                        ][index]

                        return (
                          <div key={index} className="flex items-center">
                            <div
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap backdrop-blur transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-200 border border-green-500/20'
                                  : isCurrent
                                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 border border-purple-500/30 shadow-lg shadow-purple-500/20'
                                  : hasData
                                  ? 'bg-white/10 text-white/70 border border-white/10'
                                  : 'bg-white/5 text-white/40 border border-white/5'
                              }`}
                            >
                              {isCompleted ? (
                                <span className="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">✓</span>
                              ) : isCurrent ? (
                                <span className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-bold animate-pulse">●</span>
                              ) : (
                                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px]">○</span>
                              )}
                              <span>{getStepName(index)}</span>
                            </div>
                            {index < 4 && <span className="text-white/30 mx-1.5">›</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* 底部装饰 */}
      <div className="max-w-6xl mx-auto px-4 py-8 text-center relative z-10">
        <div className="inline-flex items-center gap-3 text-white/40 text-sm">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-white/20"></div>
          <p>由 StratoMind 驱动 · 让创意更简单</p>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-white/20"></div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
