import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, ChevronRight, Layers, Building2, Target, BarChart3,
  TrendingUp, Sparkles, FolderOpen, Clock, FileCheck,
  Zap, Users, Briefcase, Eye, Pause, Play, FileText,
  Megaphone, Search, Edit3, ClipboardList, Star,
  Calendar, Shield, FileEdit, Send, BriefcaseBusiness, Building, Landmark
} from 'lucide-react'
import { getProjects, getProjectSteps } from '../services/api'
import { Project, ProjectSteps } from '../types'
import { getUserRole } from '../services/auth'
import { RoleType, getRoleConfig, ROLE_CONFIGS } from '../config/roleConfig'

// 场景类型
interface Scenario {
  id: string
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  tag: string
  gradient: string
  path: string
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsSteps, setProjectsSteps] = useState<Record<string, ProjectSteps>>({})
  const [loading, setLoading] = useState(true)
  const [activeScenario, setActiveScenario] = useState<string | null>(null)
  
  // 获取用户角色
  const userRole = getUserRole() as RoleType | null
  const roleConfig = userRole ? getRoleConfig(userRole) : null

  // 根据角色配置场景大厅数据
  const getScenariosForRole = (): Scenario[] => {
    if (!roleConfig) return scenarios;
    return roleConfig.quickActions.map((action, idx) => ({
      id: `role-action-${idx}`,
      icon: getIconForAction(action.icon),
      title: action.label,
      subtitle: roleConfig.features[idx]?.name || '',
      description: '',
      tag: roleConfig.name,
      gradient: action.color,
      path: action.path
    }));
  };
  
  // 获取场景图标
  const getIconForAction = (emoji: string): React.ReactNode => {
    const iconMap: Record<string, any> = {
      '📥': <FolderOpen className="w-8 h-8" />,
      '📝': <FileEdit className="w-8 h-8" />,
      '🔍': <Search className="w-8 h-8" />,
      '💰': <BarChart3 className="w-8 h-8" />,
      '✍️': <Edit3 className="w-8 h-8" />,
      '🎯': <Target className="w-8 h-8" />,
      '📈': <TrendingUp className="w-8 h-8" />,
      '📚': <FolderOpen className="w-8 h-8" />,
      '📋': <ClipboardList className="w-8 h-8" />,
      '📄': <FileText className="w-8 h-8" />,
      '📤': <Send className="w-8 h-8" />,
    };
    return iconMap[emoji] || <Sparkles className="w-8 h-8" />;
  };

  // 场景大厅数据 - 全案策划导向
  const scenarios: Scenario[] = [
    {
      id: 'brand',
      icon: <Sparkles className="w-8 h-8" />,
      title: '做一个品牌全案',
      subtitle: '品牌定位 · 视觉策略 · 传播规划',
      description: '从品牌诊断到传播策略，完整输出',
      tag: '全案策划',
      gradient: 'from-purple-500 to-pink-500',
      path: '/projects/workspace/new?type=brand'
    },
    {
      id: 'campaign',
      icon: <Megaphone className="w-8 h-8" />,
      title: '做一个活动全案',
      subtitle: '活动策划 · 执行方案 · 物料清单',
      description: '从创意发想到落地执行，一站搞定',
      tag: '活动策划',
      gradient: 'from-blue-500 to-cyan-500',
      path: '/projects/workspace/new?type=campaign'
    },
    {
      id: 'launch',
      icon: <Target className="w-8 h-8" />,
      title: '做一个新品上市',
      subtitle: '产品定位 · 传播策略 · 推广计划',
      description: '新品从0到1的完整营销方案',
      tag: '新品上市',
      gradient: 'from-orange-500 to-red-500',
      path: '/projects/workspace/new?type=launch'
    },
    {
      id: 'content',
      icon: <FileText className="w-8 h-8" />,
      title: '做一个内容全案',
      subtitle: '内容策略 · 素材产出 · 分发计划',
      description: '从内容规划到物料输出，闭环交付',
      tag: '内容营销',
      gradient: 'from-green-500 to-emerald-500',
      path: '/projects/workspace/new?type=content'
    }
  ]

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
    } else if (completedSteps <= 2) {
      label = '进行中'
      color = 'purple'
      status = 'designing'
    } else if (completedSteps <= 4) {
      label: '审核中'
      color = 'blue'
      status = 'reviewing'
    } else {
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

  // 统计数据
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

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      avgProgress,
      thisMonthNew: Math.floor(Math.random() * 5) + 2
    }
  }, [projects, projectsSteps])

  // 问候语
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '上午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  // 获取状态色条渐变（左侧）
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
        return 'bg-purple-100 text-purple-700'
      case 'reviewing':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'paused':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const handleCreateProject = () => {
    navigate('/projects/workspace/new')
  }

  const handleOpenProject = (projectId: string) => {
    navigate(`/projects/workspace/${projectId}`)
  }

  const handleScenarioClick = (scenario: Scenario) => {
    setActiveScenario(scenario.id)
    navigate(scenario.path)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-base">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto">
        {/* 角色欢迎横幅 */}
        {roleConfig && (
          <div className={`mb-8 p-6 rounded-2xl bg-gradient-to-r ${roleConfig.bgGradient} text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{roleConfig.icon}</span>
                  <span className="text-lg font-semibold opacity-90">{roleConfig.name}</span>
                </div>
                <p className="text-white/80 text-base">"{roleConfig.slogan}"</p>
              </div>
              <button
                onClick={() => navigate('/projects/member')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                切换角色
              </button>
            </div>
          </div>
        )}
        
        {/* 页面标题 */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{getGreeting()}！</h1>
            <p className="text-gray-500 mt-1.5 text-base">
              {roleConfig ? roleConfig.description : '您的全能文案库 · 格式校对秘书'}
            </p>
          </div>
          {/* 下载到本地备份按钮 - 醒目入口 */}
          <button
            onClick={() => {
              // 导出所有项目数据为JSON
              const exportData = {
                projects: projects,
                exportTime: new Date().toISOString(),
                version: '1.1.0'
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `灵思项目备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-purple-300 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-sm font-medium text-gray-700">下载本地备份</span>
          </button>
        </div>

        {/* ========== 角色专属功能入口 ========== */}
        {roleConfig && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-500" />
              {roleConfig.name} - 快捷入口
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {roleConfig.features.slice(0, 4).map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => navigate(feature.path)}
                  className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl ${
                    userRole === 'ad_agency' ? 'bg-purple-100' :
                    userRole === 'enterprise' ? 'bg-blue-100' :
                    userRole === 'government' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========== 场景大厅 ========== */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-500" />
            {roleConfig ? '更多功能' : '您今天想做什么？'}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {(roleConfig ? getScenariosForRole() : scenarios).map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleScenarioClick(scenario)}
                className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* 顶部图标 */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${scenario.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">{scenario.icon}</div>
                </div>
                
                {/* 标题 */}
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                  {scenario.title}
                </h3>
                
                {/* 副标题 */}
                <p className="text-sm text-gray-500 mb-3">{scenario.subtitle}</p>
                
                {/* 描述 */}
                <p className="text-sm text-gray-400 mb-4">{scenario.description}</p>
                
                {/* 标签 */}
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">
                  {scenario.tag}
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ========== 数据统计 ========== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* 进行中项目 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm font-medium">进行中项目</span>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.activeProjects}</span>
              <span className="text-sm text-green-600 font-medium flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full">
                +{stats.thisMonthNew} 本月
              </span>
            </div>
          </div>

          {/* 已完成项目 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm font-medium">已完成项目</span>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.completedProjects}</span>
              <span className="text-sm text-gray-400 font-medium mb-1.5">/ {stats.totalProjects}</span>
            </div>
          </div>

          {/* 平均进度 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm font-medium">平均完成率</span>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.avgProgress}</span>
              <span className="text-xl text-gray-400 font-medium mb-1">%</span>
            </div>
          </div>

          {/* 总项目数 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm font-medium">总项目数</span>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.totalProjects}</span>
          </div>
        </div>

        {/* ========== 最近项目 ========== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">最近项目</h2>
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>新建项目</span>
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无项目</h3>
              <p className="text-sm text-gray-500 mb-6">选择一个场景开始创建您的第一个项目</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
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
                    {/* 左侧状态色条 */}
                    <div className="flex">
                      <div className={`w-1.5 bg-gradient-to-b ${getStatusBarGradient(progressInfo.status)}`} />
                      
                      <div className="flex-1 p-5">
                        {/* 项目名称 + 状态标签 */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-purple-600 transition-colors">
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
                          <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ${getStatusBadge(progressInfo.status)}`}>
                            {progressInfo.label}
                          </span>
                        </div>

                        {/* 当前进度 */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">当前进度：</span>
                            <span className="font-semibold text-purple-600">
                              {progressInfo.progress === 0 ? '未开始' : 
                               progressInfo.progress === 100 ? '全部完成' : 
                               currentStepName}
                            </span>
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
                            <span className="text-sm text-gray-400">{progressInfo.completedSteps}/5 步骤</span>
                            <span className="text-base font-semibold text-gray-700">{Math.round(progressInfo.progress)}%</span>
                          </div>
                        </div>

                        {/* 步骤标签 */}
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          {[0, 1, 2, 3, 4].map((index) => {
                            const isCompleted = index < currentStep || (index === 4 && progressInfo.progress === 100)
                            const isCurrent = index === currentStep && progressInfo.progress > 0 && progressInfo.progress < 100

                            return (
                              <span
                                key={index}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                  isCompleted
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : isCurrent
                                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                    : 'bg-gray-50 text-gray-400 border border-gray-100'
                                }`}
                              >
                                {isCompleted && <span className="mr-1">✓</span>}{getStepName(index)}
                              </span>
                            )
                          })}
                        </div>

                        {/* 更新时间 */}
                        <div className="flex items-center gap-1.5 text-sm text-gray-400 pt-3 border-t border-gray-100">
                          <Clock className="w-4 h-4" />
                          <span>更新于 2小时前</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {projects.length > 6 && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate('/projects')}
                className="px-6 py-3 text-base text-purple-600 hover:text-purple-700 font-semibold hover:bg-purple-50 rounded-xl transition-all duration-200"
              >
                查看全部 {projects.length} 个项目
              </button>
            </div>
          )}
        </div>

        {/* ========== 快速入口 ========== */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2.5 text-lg">
            <Sparkles className="w-5 h-5 text-purple-500" />
            快捷入口
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <button 
              onClick={handleCreateProject}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all duration-200 text-left group min-h-[72px]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base group-hover:text-purple-600 transition-colors">新建项目</p>
                <p className="text-sm text-gray-500">开始策划</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/projects/analysis-charts')}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 text-left group min-h-[72px]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors">素材整理</p>
                <p className="text-sm text-gray-500">智能分类</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/projects/knowledge')}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition-all duration-200 text-left group min-h-[72px]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base group-hover:text-amber-600 transition-colors">文案模板</p>
                <p className="text-sm text-gray-500">格式参考</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/projects/assets')}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all duration-200 text-left group min-h-[72px]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base group-hover:text-green-600 transition-colors">方案资产</p>
                <p className="text-sm text-gray-500">历史文档</p>
              </div>
            </button>
          </div>
        </div>

        {/* ========== 底部价值主张 ========== */}
        <div className="mt-8 text-center">
          <p className="text-base text-gray-500">
            帮您少加班，把汇报材料写漂亮 💪
          </p>
        </div>
      </main>
    </div>
  )
}

export default ProjectsPage
