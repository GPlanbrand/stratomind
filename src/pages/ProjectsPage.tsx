import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, ChevronRight, Layers, Building2, Target, BarChart3,
  TrendingUp, Sparkles, FolderOpen, Clock, FileCheck,
  Zap, Users, Briefcase, Eye, Pause, Play, FileText,
  Megaphone, Search, Edit3, ClipboardList, Star,
  Calendar, Shield, FileEdit, Send, BriefcaseBusiness, Building, Landmark,
  CheckCircle, PlayCircle, ArrowRight, Filter, SortDesc, X,
  ClipboardCheck, BookOpen, Image, Settings, Download
} from 'lucide-react'
import { getProjects, getProjectSteps } from '../services/api'
import { Project, ProjectSteps } from '../types'
import { getUserRole, getCurrentUser } from '../services/auth'
import { RoleType, getRoleConfig, ROLE_CONFIGS } from '../config/roleConfig'

// 快捷指令类型
interface QuickCommand {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
  color: string;
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsSteps, setProjectsSteps] = useState<Record<string, ProjectSteps>>({})
  const [loading, setLoading] = useState(true)
  
  // 筛选状态
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updated')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // 获取用户信息
  const user = getCurrentUser()
  const userRole = getUserRole() as RoleType | null
  const roleConfig = userRole ? getRoleConfig(userRole) : null

  // 用户名
  const userName = user?.name || user?.phone?.slice(-4) || '用户'

  // 加载项目
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
      label = '审核中'
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
    
    // 计算本月新增
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthNew = projects.filter(p => {
      const createdAt = p.createdAt ? new Date(p.createdAt) : new Date()
      return createdAt >= thisMonthStart
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
      thisMonthNew
    }
  }, [projects, projectsSteps])

  // 问候语
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return '夜深了'
    if (hour < 9) return '早上好'
    if (hour < 12) return '上午好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    if (hour < 22) return '晚上好'
    return '夜深了'
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

  // 相对时间
  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '未知'
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 30) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  // 快捷操作
  const quickActions: QuickCommand[] = [
    { id: 'new', icon: <Plus className="w-5 h-5" />, title: '创建方案', description: '语音输入快速创建', path: '/simple/create', color: 'purple' },
    { id: 'requirement', icon: <ClipboardCheck className="w-5 h-5" />, title: '需求确认单', description: '快速发起需求确认', path: '/projects/requirements', color: 'blue' },
    { id: 'docs', icon: <BookOpen className="w-5 h-5" />, title: '文档中心', description: '查看使用指南', path: '/projects/docs', color: 'amber' },
    { id: 'assets', icon: <Image className="w-5 h-5" />, title: '素材库', description: '管理品牌素材', path: '/projects/assets', color: 'green' },
    { id: 'analytics', icon: <BarChart3 className="w-5 h-5" />, title: '数据分析', description: '查看项目统计', path: '/projects/analysis-charts', color: 'cyan' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, title: '偏好设置', description: '个性化配置', path: '/projects/settings', color: 'gray' },
  ]

  // 筛选后的项目
  const filteredProjects = useMemo(() => {
    let filtered = [...projects]
    
    // 状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => {
        const info = getProgressInfo(p.id)
        return info.status === statusFilter
      })
    }
    
    // 搜索筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) || 
        p.clientName?.toLowerCase().includes(query) ||
        p.industry?.toLowerCase().includes(query)
      )
    }
    
    // 排序
    filtered.sort((a, b) => {
      const aInfo = getProgressInfo(a.id)
      const bInfo = getProgressInfo(b.id)
      
      switch (sortBy) {
        case 'updated':
          const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
          const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
          return bTime - aTime
        case 'created':
          const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bCreated - aCreated
        case 'progress':
          return bInfo.progress - aInfo.progress
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        default:
          return 0
      }
    })
    
    return filtered
  }, [projects, statusFilter, sortBy, searchQuery, projectsSteps])

  // 最近项目（最多3个）
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return bTime - aTime
      })
      .slice(0, 3)
  }, [projects])

  const handleCreateProject = () => {
    navigate('/projects/workspace/new')
  }

  const handleOpenProject = (projectId: string) => {
    navigate(`/projects/workspace/${projectId}`)
  }

  const handleExport = () => {
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
  }

  // 环形进度图组件
  const RingProgress = ({ percentage, size = 100 }: { percentage: number, size?: number }) => {
    const strokeWidth = 10
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* 背景轨道 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* 进度环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
    )
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
        
        {/* ========== 顶部欢迎区 ========== */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {getGreeting()}，{userName} 👋
            </h1>
            <p className="text-gray-500 mt-1.5 text-base">
              {stats.activeProjects > 0 
                ? `您有 ${stats.activeProjects} 个项目正在进行中，继续加油！` 
                : '欢迎使用灵思创意工作台'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-purple-300 transition-all shadow-sm text-sm font-medium text-gray-700"
            >
              <Download className="w-4 h-4" />
              <span>导出备份</span>
            </button>
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 hover:shadow-lg transition-all shadow-purple-500/30"
            >
              <Plus className="w-5 h-5" />
              <span>创建方案</span>
            </button>
          </div>
        </div>

        {/* ========== 仪表盘区域 ========== */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* 总项目数 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm font-medium">总项目数</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.totalProjects}</span>
          </div>

          {/* 进行中 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm font-medium">进行中</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                <PlayCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.activeProjects}</span>
          </div>

          {/* 已完成 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm font-medium">已完成</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-sm">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.completedProjects}</span>
          </div>

          {/* 本月新增 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm font-medium">本月新增</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.thisMonthNew}</span>
          </div>

          {/* 完成率环形图 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
            <span className="text-gray-500 text-sm font-medium mb-2">总完成率</span>
            <RingProgress percentage={stats.avgProgress} size={90} />
          </div>
        </div>

        {/* ========== 快捷操作区 ========== */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  action.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                  action.color === 'green' ? 'bg-green-100 text-green-600' :
                  action.color === 'cyan' ? 'bg-cyan-100 text-cyan-600' :
                  'bg-gray-100 text-gray-600'
                } group-hover:scale-105 transition-transform`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ========== 项目清单区 ========== */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">我的项目</h2>
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors lg:hidden"
            >
              <Plus className="w-4 h-4" />
              <span>新建</span>
            </button>
          </div>

          {/* 筛选栏 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <div className="flex flex-wrap items-center gap-3">
              {/* 状态筛选 */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                >
                  <option value="all">全部状态</option>
                  <option value="designing">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="paused">已暂停</option>
                  <option value="pending">未开始</option>
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
              </div>

              {/* 排序 */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                >
                  <option value="updated">按最新更新</option>
                  <option value="created">按创建时间</option>
                  <option value="progress">按完成率</option>
                  <option value="name">按名称</option>
                </select>
                <SortDesc className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* 搜索框 */}
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索项目名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 筛选结果统计 */}
              <span className="text-sm text-gray-500 hidden sm:block">
                共 {filteredProjects.length} 个项目
              </span>
            </div>
          </div>

          {/* 项目卡片列表 */}
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' ? '未找到匹配的项目' : '暂无项目'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? '尝试调整筛选条件' 
                  : '点击下方按钮创建您的第一个方案'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <button
                  onClick={handleCreateProject}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>新建项目</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => {
                const progressInfo = getProgressInfo(project.id)
                const currentStep = getCurrentStep(project.id)
                const currentStepName = getStepName(currentStep)

                return (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProject(project.id)}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-purple-100 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex">
                      {/* 左侧状态色条 */}
                      <div className={`w-1.5 bg-gradient-to-b ${getStatusBarGradient(progressInfo.status)}`} />
                      
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-purple-600 transition-colors">
                                {project.name || '未命名项目'}
                              </h3>
                              <span className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap ${getStatusBadge(progressInfo.status)}`}>
                                {progressInfo.label}
                              </span>
                            </div>
                            
                            {project.clientName && (
                              <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span>{project.clientName}</span>
                                {project.industry && (
                                  <>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-gray-400">{project.industry}</span>
                                  </>
                                )}
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>更新于 {getRelativeTime(project.updatedAt)}</span>
                            </div>
                          </div>

                          {/* 右侧进度和跳转 */}
                          <div className="flex flex-col items-end gap-3">
                            <div className="text-right">
                              <span className="text-2xl font-bold text-gray-900">{Math.round(progressInfo.progress)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </div>

                        {/* 进度条 */}
                        <div className="mt-4">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
                        </div>

                        {/* 步骤标签 */}
                        <div className="flex items-center gap-2 mt-4 flex-wrap">
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
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProjectsPage
