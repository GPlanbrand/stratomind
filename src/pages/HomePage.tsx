import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, ChevronRight, Layers, Building2, Target, BarChart3, FileText, Lightbulb, Clock } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">品牌策划工作台</h1>
                <p className="text-xs text-gray-500">Brand Strategy Studio</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 新建项目按钮 */}
        <div className="mb-8">
          <button
            onClick={handleCreateProject}
            className="w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-800 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group border-2 border-dashed border-purple-300 hover:border-purple-500"
          >
            <Plus className="w-6 h-6 text-purple-500 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-lg">创建新项目</span>
          </button>
        </div>

        {/* 项目列表 */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Layers className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无项目</h3>
            <p className="text-gray-500 mb-6">点击上方按钮创建您的第一个品牌策划项目</p>
            <button
              onClick={handleCreateProject}
              className="px-6 py-3 bg-purple-100 text-purple-600 rounded-xl font-medium hover:bg-purple-200 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              立即创建
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              项目总览 ({projects.length})
            </h2>

            <div className="grid gap-4">
              {projects.map((project) => {
                const progressInfo = getProgressInfo(project.id)
                const currentStep = getCurrentStep(project.id)
                const steps = projectsSteps[project.id]

                return (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProject(project.id)}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all duration-300 cursor-pointer group"
                  >
                    {/* 项目头部信息 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-purple-500 flex-shrink-0" />
                          <h3 className="font-semibold text-gray-800 truncate">
                            {project.name || '未命名项目'}
                          </h3>
                        </div>
                        
                        {project.clientName && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span>{project.clientName}</span>
                          </div>
                        )}

                        {steps?.clientInfo?.industry && (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">
                              {steps.clientInfo.industry}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          progressInfo.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                          progressInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                          progressInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                          progressInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                          progressInfo.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {progressInfo.label}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">完成进度</span>
                        <span className="text-gray-700 font-medium">
                          {progressInfo.completedSteps || 0}/{progressInfo.totalSteps} 步骤
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progressInfo.color === 'emerald' ? 'bg-emerald-500' :
                            progressInfo.color === 'green' ? 'bg-green-500' :
                            progressInfo.color === 'yellow' ? 'bg-yellow-500' :
                            progressInfo.color === 'blue' ? 'bg-blue-500' :
                            progressInfo.color === 'purple' ? 'bg-purple-500' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${progressInfo.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 步骤指示器 */}
                    <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1">
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
                              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs whitespace-nowrap ${
                                isCompleted
                                  ? 'bg-green-100 text-green-700'
                                  : isCurrent
                                  ? 'bg-purple-100 text-purple-700'
                                  : hasData
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-gray-50 text-gray-400'
                              }`}
                            >
                              {isCompleted ? (
                                <span className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px]">✓</span>
                              ) : isCurrent ? (
                                <span className="w-3 h-3 rounded-full bg-purple-500 flex items-center justify-center text-white text-[8px]">●</span>
                              ) : (
                                <span className="w-3 h-3 rounded-full bg-gray-300 flex items-center justify-center text-white text-[8px]">○</span>
                              )}
                              <span>{getStepName(index)}</span>
                            </div>
                            {index < 4 && <span className="text-gray-300 mx-0.5">›</span>}
                          </div>
                        )
                      })}
                    </div>

                    {/* 时间信息 */}
                    {project.createdAt && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          创建于 {formatDate(project.createdAt)}
                        </div>
                        {project.updatedAt && project.updatedAt !== project.createdAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
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

      {/* 底部提示 */}
      <footer className="max-w-6xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-white/60 flex items-center justify-center gap-2">
          <Lightbulb className="w-4 h-4" />
          提示：点击项目卡片继续未完成的策划流程
        </p>
      </footer>
    </div>
  )
}

export default HomePage
