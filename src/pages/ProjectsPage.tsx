import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, ChevronRight, Layers, Building2, Target, BarChart3,
  TrendingUp, Sparkles, FolderOpen, Clock, FileCheck,
  Zap, Users, Briefcase, Eye, Pause, Play
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
    if (!steps) return { progress: 0, label: '未开始', color: 'gray', status: 'pending' as const }

    const hasClientInfo = !!steps.clientInfo
    const hasRequirements = !!steps.requirements
    const hasCompetitors = steps.competitors && steps.competitors.length > 0
    const hasBrief = !!steps.brief
    const hasStrategy = !!steps.strategy

    const completedSteps = [hasClientInfo, hasRequirements, hasCompetitors, hasBrief, hasStrategy].filter(Boolean).length
    const progress = (completedSteps / 5) * 100

    let label = '未开始'
    let color = 'gray'
    let status: 'pending' | 'designing' | 'reviewing' | 'completed' | 'paused' = 'pending'
    
    if (completedSteps === 0) {
      label = '未开始'
      color = 'gray'
      status = 'pending'
    } else if (completedSteps === 1) {
      label = '进行中'
      color = 'purple'
      status = 'designing'
    } else if (completedSteps === 2) {
      label = '进行中'
      color = 'purple'
      status = 'designing'
    } else if (completedSteps === 3) {
      label = '审核中'
      color = 'blue'
      status = 'reviewing'
    } else if (completedSteps === 4) {
      label = '审核中'
      color = 'blue'
      status = 'reviewing'
    } else if (completedSteps === 5) {
      label = '已完成'
      color = 'emerald'
      status = 'completed'
    }

    return { progress, completedSteps, totalSteps: 5, label, color, status }
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

    // 模拟数据
    const thisMonthNew = Math.floor(Math.random() * 5) + 2
    const efficiencyBoost = 85 + Math.floor(Math.random() * 15)
    const totalNodes = 5
    const serviceClients = completedProjects + Math.floor(Math.random() * 10)

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      avgProgress,
      thisMonthNew,
      efficiencyBoost,
      totalNodes,
      serviceClients,
      thisQuarterNew: Math.floor(Math.random() * 8) + 3
    }
  }, [projects, projectsSteps])

  // AI摘要生成
  const aiSummary = useMemo(() => {
    const activeCount = stats.activeProjects
    const completedCount = stats.completedProjects
    
    const insights: string[] = []
    
    if (activeCount > 0) {
      insights.push(`${activeCount}个项目正在进行中`)
    }
    if (completedCount > 0) {
      insights.push(`${completedCount}个项目已完成`)
    }
    if (stats.thisMonthNew > 0) {
      insights.push(`本月新增${stats.thisMonthNew}个项目`)
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

  // 获取状态渐变色条
  const getStatusBarGradient = (status: string) => {
    switch (status) {
      case 'designing':
        return 'from-purple-500 to-indigo-500'
      case 'reviewing':
        return 'from-blue-500 to-cyan-500'
      case 'completed':
        return 'from-green-500 to-emerald-500'
      case 'paused':
        return 'from-amber-500 to-orange-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  // 获取状态标签样式
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'designing':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
      case 'reviewing':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'completed':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      case 'paused':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
      default:
        return 'bg-gray-200 text-gray-600'
    }
  }

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'designing':
        return <Play className="w-4 h-4" />
      case 'reviewing':
        return <Eye className="w-4 h-4" />
      case 'completed':
        return <FileCheck className="w-4 h-4" />
      case 'paused':
        return <Pause className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-base">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主内容 */}
      <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">工作台</h1>
          <p className="text-gray-500 mt-1.5 text-sm sm:text-base">灵思AI创意工作台 · 品牌策划一站式服务</p>
        </div>

        {/* 数据统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* 进行中项目 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm font-medium">进行中项目</span>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.activeProjects}</span>
              </div>
              <span className="text-sm text-green-600 font-medium flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                +{stats.thisMonthNew} 本月
              </span>
            </div>
          </div>

          {/* 平均效率提升 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm font-medium">平均效率提升</span>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.efficiencyBoost}</span>
              <span className="text-xl text-gray-400 font-medium mb-1">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">AI赋能效率提升</p>
          </div>

          {/* 管理节点 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm font-medium">管理节点</span>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Layers className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.totalNodes}</span>
              <span className="text-sm text-gray-400 font-medium mb-1.5">阶段归类</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">5步流程</p>
          </div>

          {/* 服务客户数 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm font-medium">服务客户数</span>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.serviceClients}</span>
              <span className="text-sm text-green-600 font-medium flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full">
                +{stats.thisQuarterNew} 本季
              </span>
            </div>
          </div>
        </div>

        {/* AI工作摘要 */}
        {aiSummary.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{getGreeting()}！基于您的工作进度</h3>
                <div className="space-y-1.5">
                  {aiSummary.map((insight, index) => (
                    <p key={index} className="text-sm text-gray-600 flex items-center gap-2.5">
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">最新项目</h2>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">{projects.length}</span>
            </div>
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>新建项目</span>
            </button>
          </div>

          {projects.length === 0 ? (
            /* 空状态 */
            <div className="bg-white rounded-2xl border border-gray-100 p-12 sm:p-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无项目</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">点击上方按钮创建您的第一个品牌策划项目，开启智能创意之旅</p>
              <button
                onClick={handleCreateProject}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 hover:shadow-lg transition-all text-sm"
              >
                立即创建
              </button>
            </div>
          ) : (
            /* 项目卡片列表 - 基于实际数据设计 */
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {projects.slice(0, 6).map((project) => {
                const progressInfo = getProgressInfo(project.id)
                const currentStep = getCurrentStep(project.id)
                const steps = projectsSteps[project.id]
                const currentStepName = getStepName(currentStep)

                return (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProject(project.id)}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-purple-100 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                  >
                    {/* 顶部渐变色条 */}
                    <div className={`h-1.5 bg-gradient-to-r ${getStatusBarGradient(progressInfo.status)}`} />
                    
                    <div className="p-5">
                      {/* 项目名称 + 状态标签 */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg truncate group-hover:text-purple-600 transition-colors">
                            {project.name || '未命名项目'}
                          </h3>
                          {project.clientName && (
                            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="truncate">{project.clientName}</span>
                              {project.industry && (
                                <>
                                  <span className="text-gray-300">·</span>
                                  <span className="text-gray-400 truncate">{project.industry}</span>
                                </>
                              )}
                            </p>
                          )}
                        </div>

                        {/* 状态标签 */}
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap ${getStatusBadge(progressInfo.status)}`}>
                          {getStatusIcon(progressInfo.status)}
                          {progressInfo.label}
                        </span>
                      </div>

                      {/* 当前步骤 */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">当前步骤：</span>
                          <span className="font-semibold text-purple-600">
                            {progressInfo.progress === 0 ? '未开始' : 
                             progressInfo.progress === 100 ? '全部完成' : 
                             currentStepName}
                          </span>
                          <span className="text-gray-300">·</span>
                          <span className="text-gray-400 text-xs">2小时前更新</span>
                        </div>
                      </div>

                      {/* 进度条 */}
                      <div className="mb-4">
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              progressInfo.status === 'designing' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
                              progressInfo.status === 'reviewing' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              progressInfo.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              progressInfo.status === 'paused' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${progressInfo.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-gray-400">{progressInfo.completedSteps}/5 步骤完成</span>
                          <span className="text-sm font-semibold text-gray-700">{Math.round(progressInfo.progress)}%</span>
                        </div>
                      </div>

                      {/* 步骤标签 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {[0, 1, 2, 3, 4].map((index) => {
                          const isCompleted = index < currentStep || (index === 4 && progressInfo.progress === 100)
                          const isCurrent = index === currentStep && progressInfo.progress > 0 && progressInfo.progress < 100
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
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                isCompleted
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : isCurrent
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : hasData
                                  ? 'bg-gray-100 text-gray-600 border border-gray-200'
                                  : 'bg-gray-50 text-gray-400 border border-gray-100'
                              }`}
                            >
                              {isCompleted && <span className="mr-1">✓</span>}{getStepName(index)}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 查看更多 */}
          {projects.length > 6 && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate('/projects')}
                className="px-6 py-2.5 text-sm text-purple-600 hover:text-purple-700 font-semibold hover:bg-purple-50 rounded-xl transition-all duration-200"
              >
                查看全部 {projects.length} 个项目
              </button>
            </div>
          )}
        </div>

        {/* 快速入口 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-purple-500" />
            快速开始
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={handleCreateProject}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all duration-200 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-purple-600 transition-colors">品牌策划</p>
                <p className="text-xs text-gray-500 mt-0.5">创建新项目</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/projects/analysis-charts')}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">竞品分析</p>
                <p className="text-xs text-gray-500 mt-0.5">数据洞察</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/projects/knowledge')}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition-all duration-200 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-amber-600 transition-colors">知识库</p>
                <p className="text-xs text-gray-500 mt-0.5">品牌资产</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProjectsPage
