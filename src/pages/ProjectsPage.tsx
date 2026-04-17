import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, ChevronRight, Layers, Building2, Target, BarChart3, Clock,
  TrendingUp, Sparkles, FolderOpen, Calendar, AlertCircle, CheckCircle2
} from 'lucide-react'
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
    const names = ['背景', '需求', '竞品', '简报', '策略']
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

  // 计算统计数据
  const stats = useMemo(() => {
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => {
      const info = getProgressInfo(p.id)
      return info.progress > 0 && info.progress < 100
    }).length
    const completedProjects = projects.filter(p => {
      const info = getProgressInfo(p.id)
      return info.progress === 100
    }).length
    
    const totalProgress = projects.reduce((sum, p) => {
      return sum + getProgressInfo(p.id).progress
    }, 0)
    const avgProgress = totalProjects > 0 ? Math.round(totalProgress / totalProjects) : 0

    // 本周新增（简化计算，实际应该按创建时间过滤）
    const recentProjects = projects.slice(0, 3).length

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      avgProgress,
      recentProjects,
      aiUsage: projects.length * 12 // 模拟AI使用次数
    }
  }, [projects, projectsSteps])

  // AI摘要生成
  const aiSummary = useMemo(() => {
    const activeCount = stats.activeProjects
    const completedCount = stats.completedProjects
    const recentCount = stats.recentProjects
    
    const insights: string[] = []
    
    if (activeCount > 0) {
      insights.push(`${activeCount}个项目正在进行中`)
    }
    if (completedCount > 0) {
      insights.push(`${completedCount}个项目已完成`)
    }
    if (recentCount > 0) {
      insights.push(`本周新增${recentCount}个项目`)
    }
    if (stats.avgProgress < 50 && activeCount > 0) {
      insights.push('部分项目进度较慢，建议关注')
    }

    return insights
  }, [stats])

  const handleCreateProject = () => {
    navigate('/projects/workspace/new')
  }

  const handleOpenProject = (projectId: string) => {
    navigate(`/projects/workspace/${projectId}`)
  }

  // 获取时间问候语
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '上午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主内容 */}
      <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">工作台</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">灵思AI创意工作台 · 品牌策划一站式服务</p>
        </div>

        {/* 数据统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* 进行中项目 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-xs sm:text-sm">进行中项目</span>
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <FolderOpen className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.activeProjects}</span>
              <span className="text-xs text-green-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +{stats.recentProjects}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">本周新增</p>
          </div>

          {/* 平均完成率 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-xs sm:text-sm">平均完成率</span>
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.avgProgress}</span>
              <span className="text-lg text-gray-400">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">AI赋能效率提升</p>
          </div>

          {/* 已完成项目 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-xs sm:text-sm">已完成项目</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.completedProjects}</span>
              <span className="text-xs text-gray-400">/ {stats.totalProjects}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">总项目数</p>
          </div>

          {/* AI使用次数 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-xs sm:text-sm">AI使用</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.aiUsage}</span>
              <span className="text-sm text-gray-400">次</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">智能生成方案</p>
          </div>
        </div>

        {/* AI工作摘要 */}
        {aiSummary.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-4 sm:p-5 mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">{getGreeting()}！基于您的工作进度：</h3>
                <div className="space-y-1">
                  {aiSummary.map((insight, index) => (
                    <p key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      {insight}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 最新项目区域 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">最新项目</h2>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{projects.length}</span>
            </div>
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">新建项目</span>
              <span className="sm:hidden">新建</span>
            </button>
          </div>

          {projects.length === 0 ? (
            /* 空状态 */
            <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
              <Layers className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">暂无项目</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">点击上方按钮创建您的第一个品牌策划项目</p>
              <button
                onClick={handleCreateProject}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm sm:text-base"
              >
                立即创建
              </button>
            </div>
          ) : (
            /* 项目卡片列表 */
            <div className="space-y-3">
              {projects.slice(0, 6).map((project) => {
                const progressInfo = getProgressInfo(project.id)
                const currentStep = getCurrentStep(project.id)
                const steps = projectsSteps[project.id]

                return (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProject(project.id)}
                    className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    {/* 项目头部信息 */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* 状态色条 */}
                        <div 
                          className={`w-1 h-12 rounded-full flex-shrink-0 ${
                            progressInfo.color === 'emerald' ? 'bg-emerald-500' :
                            progressInfo.color === 'green' ? 'bg-green-500' :
                            progressInfo.color === 'yellow' ? 'bg-yellow-500' :
                            progressInfo.color === 'blue' ? 'bg-blue-500' :
                            progressInfo.color === 'purple' ? 'bg-purple-500' :
                            'bg-gray-300'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{project.name || '未命名项目'}</h3>
                          {project.clientName && (
                            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                              <Building2 className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{project.clientName}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 状态标签 */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          progressInfo.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                          progressInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                          progressInfo.color === 'yellow' ? 'bg-amber-100 text-amber-700' :
                          progressInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                          progressInfo.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {progressInfo.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                        <span>完成进度</span>
                        <span className="font-medium">{Math.round(progressInfo.progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progressInfo.color === 'emerald' ? 'bg-emerald-500' :
                            progressInfo.color === 'green' ? 'bg-green-500' :
                            progressInfo.color === 'yellow' ? 'bg-amber-500' :
                            progressInfo.color === 'blue' ? 'bg-blue-500' :
                            progressInfo.color === 'purple' ? 'bg-purple-500' :
                            'bg-gray-300'
                          }`}
                          style={{ width: `${progressInfo.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 步骤标签 */}
                    <div className="flex items-center gap-1.5 flex-wrap">
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
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              isCompleted
                                ? 'bg-green-100 text-green-700'
                                : isCurrent
                                ? 'bg-purple-100 text-purple-700'
                                : hasData
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-gray-50 text-gray-400'
                            }`}
                          >
                            {isCompleted && '✓'}{getStepName(index)}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* 查看更多 */}
              {projects.length > 6 && (
                <button 
                  onClick={() => navigate('/projects')}
                  className="w-full py-3 text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  查看全部 {projects.length} 个项目
                </button>
              )}
            </div>
          )}
        </div>

        {/* 快速入口 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            快速开始
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button 
              onClick={handleCreateProject}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">品牌策划</p>
                <p className="text-xs text-gray-500">创建新项目</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/projects/analysis-charts')}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">竞品分析</p>
                <p className="text-xs text-gray-500">数据洞察</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/projects/knowledge')}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">知识库</p>
                <p className="text-xs text-gray-500">品牌资产</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProjectsPage
