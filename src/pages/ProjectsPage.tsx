import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, Layers, Building2, Target, BarChart3, Clock } from 'lucide-react'
import { getProjects, getProjectSteps } from '../services/api'
import { Project, ProjectSteps } from '../types'

const ProjectsPage: React.FC = () => {
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
    navigate('/projects/workspace/new')
  }

  const handleOpenProject = (projectId: string) => {
    navigate(`/projects/workspace/${projectId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主内容 */}
      <main className="px-4 py-6 sm:py-8 max-w-6xl mx-auto">
        {/* 标题区域 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-0.5 sm:mb-2">AI 创意工作台</h1>
          <p className="text-xs sm:text-sm text-gray-500">Brand Strategy Studio</p>
        </div>

        {/* 新建项目按钮 */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={handleCreateProject}
            className="w-full py-4 sm:py-6 px-4 sm:px-6 bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl font-medium transition-all flex items-center justify-center gap-3 sm:gap-4 group min-h-[80px] sm:min-h-[96px]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </div>
            <div className="text-left">
              <span className="text-base sm:text-lg text-gray-900 block">创建新项目</span>
              <span className="text-xs sm:text-sm text-gray-500 hidden sm:block">开始您的品牌策划之旅</span>
            </div>
          </button>
        </div>

        {/* 项目列表 */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 sm:p-16 text-center">
            <Layers className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">暂无项目</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">点击上方按钮创建您的第一个品牌策划项目</p>
            <button
              onClick={handleCreateProject}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base min-h-[44px]"
            >
              立即创建
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* 标题区域 */}
            <div className="flex items-center gap-2 sm:gap-3 px-1">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <h2 className="text-sm sm:text-lg font-medium text-gray-900">项目总览 ({projects.length})</h2>
            </div>

            {/* 项目卡片列表 */}
            <div className="grid gap-3 sm:gap-4">
              {projects.map((project) => {
                const progressInfo = getProgressInfo(project.id)
                const currentStep = getCurrentStep(project.id)
                const steps = projectsSteps[project.id]

                return (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProject(project.id)}
                    className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer min-h-[100px] sm:min-h-[120px]"
                  >
                    {/* 项目头部信息 - 移动端优化 */}
                    <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{project.name || '未命名项目'}</h3>
                          {project.clientName && (
                            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                              <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                              <span className="truncate">{project.clientName}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 状态和操作 */}
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          progressInfo.color === 'emerald' ? 'bg-green-100 text-green-700' :
                          progressInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                          progressInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                          progressInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                          progressInfo.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {progressInfo.label}
                        </span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                    </div>

                    {/* 进度信息 */}
                    <div className="flex items-center justify-between text-xs sm:text-sm mb-2 sm:mb-3">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{progressInfo.completedSteps || 0}/{progressInfo.totalSteps} 步骤</span>
                          <span className="sm:hidden">{progressInfo.completedSteps || 0}/{progressInfo.totalSteps}</span>
                        </span>
                        {steps?.clientInfo?.industry && (
                          <span className="px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded hidden sm:inline">
                            {steps.clientInfo.industry}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="mb-2 sm:mb-3">
                      <div className="h-1 sm:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progressInfo.color === 'emerald' ? 'bg-green-500' :
                            progressInfo.color === 'green' ? 'bg-green-500' :
                            progressInfo.color === 'yellow' ? 'bg-yellow-500' :
                            progressInfo.color === 'blue' ? 'bg-blue-500' :
                            progressInfo.color === 'purple' ? 'bg-purple-500' :
                            'bg-gray-300'
                          }`}
                          style={{ width: `${progressInfo.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 步骤标签 - 移动端横向滚动 */}
                    <div className="flex items-center gap-1 flex-wrap">
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
                          <span
                            key={index}
                            className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded text-xs font-medium whitespace-nowrap ${
                              isCompleted
                                ? 'bg-green-100 text-green-700'
                                : isCurrent
                                ? 'bg-blue-100 text-blue-700'
                                : hasData
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-gray-50 text-gray-400'
                            }`}
                          >
                            {isCompleted ? '✓ ' : isCurrent ? '● ' : ''}{getStepName(index)}
                          </span>
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
    </div>
  )
}

export default ProjectsPage
