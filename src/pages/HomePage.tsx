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
          <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white/80 text-lg font-medium">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative z-10">
      {/* 顶部导航 */}
      <header className="glass rounded-2xl mx-4 mt-4 sticky top-0 z-10 shadow-xl border border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg animate-float">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">品牌策划工作台</h1>
                <p className="text-sm text-white/60">Brand Strategy Studio</p>
              </div>
            </div>
            
            {/* 装饰元素 */}
            <div className="hidden md:flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-white/60 text-sm">在线</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* 新建项目按钮 */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={handleCreateProject}
            className="w-full py-5 px-6 glass hover:glass rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 group border-2 border-dashed border-white/30 hover:border-white/50 home-button"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Plus className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </div>
            <span className="text-xl text-white group-hover:text-white/90">创建新项目</span>
          </button>
        </div>

        {/* 项目列表 */}
        {projects.length === 0 ? (
          <div className="glass rounded-2xl p-12 shadow-xl border border-white/20 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur">
              <Layers className="w-12 h-12 text-white/70" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">暂无项目</h3>
            <p className="text-white/60 mb-8 text-lg">点击上方按钮创建您的第一个品牌策划项目</p>
            <button
              onClick={handleCreateProject}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto btn-press"
            >
              <Plus className="w-5 h-5" />
              立即创建
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3 animate-slide-in">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              项目总览 ({projects.length})
            </h2>

            <div className="grid gap-5">
              {projects.map((project, idx) => {
                const progressInfo = getProgressInfo(project.id)
                const currentStep = getCurrentStep(project.id)
                const steps = projectsSteps[project.id]

                return (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProject(project.id)}
                    className="glass rounded-2xl p-6 shadow-xl border border-white/20 hover:border-white/30 transition-all duration-300 cursor-pointer group card-hover animate-fade-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* 项目头部信息 */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-bold text-xl text-white truncate group-hover:text-white/90 transition-colors">
                            {project.name || '未命名项目'}
                          </h3>
                        </div>
                        
                        {project.clientName && (
                          <div className="flex items-center gap-2 text-sm text-white/70 mb-3 ml-13">
                            <Building2 className="w-4 h-4 text-white/50" />
                            <span>{project.clientName}</span>
                          </div>
                        )}

                        {steps?.clientInfo?.industry && (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-white/10 text-white/80 text-xs rounded-lg backdrop-blur">
                              {steps.clientInfo.industry}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur ${
                          progressInfo.color === 'emerald' ? 'bg-emerald-500/30 text-emerald-200' :
                          progressInfo.color === 'green' ? 'bg-green-500/30 text-green-200' :
                          progressInfo.color === 'yellow' ? 'bg-yellow-500/30 text-yellow-200' :
                          progressInfo.color === 'blue' ? 'bg-blue-500/30 text-blue-200' :
                          progressInfo.color === 'purple' ? 'bg-purple-500/30 text-purple-200' :
                          'bg-white/10 text-white/60'
                        }`}>
                          {progressInfo.label}
                        </span>
                        <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">完成进度</span>
                        <span className="text-white font-semibold">
                          {progressInfo.completedSteps || 0}/{progressInfo.totalSteps} 步骤
                        </span>
                      </div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden backdrop-blur">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progressInfo.color === 'emerald' ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' :
                            progressInfo.color === 'green' ? 'bg-gradient-to-r from-green-400 to-green-300' :
                            progressInfo.color === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-yellow-300' :
                            progressInfo.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-blue-300' :
                            progressInfo.color === 'purple' ? 'bg-gradient-to-r from-purple-400 to-pink-400' :
                            'bg-white/30'
                          }`}
                          style={{ width: `${progressInfo.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 步骤指示器 */}
                    <div className="mt-5 flex items-center gap-1 overflow-x-auto pb-1">
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
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap backdrop-blur transition-all ${
                                isCompleted
                                  ? 'bg-green-500/20 text-green-200'
                                  : isCurrent
                                  ? 'bg-purple-500/30 text-purple-200'
                                  : hasData
                                  ? 'bg-white/10 text-white/70'
                                  : 'bg-white/5 text-white/40'
                              }`}
                            >
                              {isCompleted ? (
                                <span className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center text-white text-[8px] font-bold">✓</span>
                              ) : isCurrent ? (
                                <span className="w-4 h-4 rounded-full bg-purple-400 flex items-center justify-center text-white text-[8px] font-bold">●</span>
                              ) : (
                                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white text-[8px]">○</span>
                              )}
                              <span>{getStepName(index)}</span>
                            </div>
                            {index < 4 && <span className="text-white/30 mx-1">›</span>}
                          </div>
                        )
                      })}
                    </div>

                    {/* 时间信息 */}
                    {project.createdAt && (
                      <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-5 text-xs text-white/50">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          创建于 {formatDate(project.createdAt)}
                        </div>
                        {project.updatedAt && project.updatedAt !== project.createdAt && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            更新于 {formatDate(project.updatedAt)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* 底部装饰 */}
      <div className="max-w-6xl mx-auto px-4 py-8 text-center relative z-10">
        <p className="text-sm text-white/40 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          智能品牌策划平台 · StratoMind
        </p>
      </div>
    </div>
  )
}

export default HomePage
