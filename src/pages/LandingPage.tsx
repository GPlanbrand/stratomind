import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Zap,
  Shield,
  Users,
  FileText,
  Target,
  Rocket,
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  CheckCircle,
  Play,
  ArrowRight,
  Layers,
  BarChart3,
  MessageSquare,
  Globe
} from 'lucide-react'

// Animation Hook
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])
  
  return isVisible
}

// Floating Animation
const FloatingAnimation = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <div
    className="animate-bounce"
    style={{ 
      animationDuration: '3s',
      animationDelay: `${delay}s`,
      animationIterationCount: 'infinite'
    }}
  >
    {children}
  </div>
)

// Navigation
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:shadow-xl group-hover:shadow-purple-300 transition-all">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">灵思AI</span>
              <span className="hidden sm:block text-xs text-gray-500">创意工作台</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">核心功能</a>
            <a href="#advantages" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">产品优势</a>
            <a href="#cases" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">客户案例</a>
            <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">价格方案</a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              登录
            </Link>
            <Link 
              to="/register"
              className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5"
            >
              立即体验
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 w-full bg-gray-600 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-full bg-gray-600 transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-full bg-gray-600 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-600 hover:text-purple-600 font-medium px-4">核心功能</a>
              <a href="#advantages" className="text-gray-600 hover:text-purple-600 font-medium px-4">产品优势</a>
              <a href="#cases" className="text-gray-600 hover:text-purple-600 font-medium px-4">客户案例</a>
              <a href="#pricing" className="text-gray-600 hover:text-purple-600 font-medium px-4">价格方案</a>
              <div className="border-t border-gray-100 pt-4 px-4 flex flex-col gap-3">
                <Link to="/login" className="text-center text-gray-700 font-medium">登录</Link>
                <Link to="/register" className="text-center bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium">
                  立即体验
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

// Hero Section
const HeroSection = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-100" />
      <div 
        className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-300 rounded-full blur-[120px] opacity-20 transition-transform duration-1000"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      />
      <div 
        className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-400 rounded-full blur-[100px] opacity-15 transition-transform duration-1000"
        style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}
      />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-lg">
          <Sparkles className="w-4 h-4" />
          <span>新一代 AI 品牌策划工作台</span>
        </div>
        
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
          灵思，你的
          <span className="relative inline-block mx-2 md:mx-4">
            <span className="relative z-10 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 bg-clip-text text-transparent">
              AI创意合伙人
            </span>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-purple-500/20 blur-lg -z-10 rounded-lg" />
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-purple-600 font-medium mb-4">
          品牌全案 · 活动策划 · 新品上市 · 内容营销
        </p>
        
        <p className="text-base sm:text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          为广告公司和企业品宣量身打造，一站式完成从需求分析到方案输出的全流程
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/register"
            className="group bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 flex items-center gap-2 hover:-translate-y-1"
          >
            免费开始使用
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a 
            href="#features"
            className="group flex items-center gap-2 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-purple-300 hover:text-purple-600 transition-all"
          >
            <Play className="w-5 h-5" />
            了解更多
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>免费注册</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>无需信用卡</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>3分钟上手</span>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
          <div className="bg-white rounded-2xl shadow-2xl shadow-purple-200 border border-purple-100 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 text-center text-sm text-gray-500">灵思AI创意工作台</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">品牌策略</h3>
                  <p className="text-sm text-gray-500">竞品分析 · 品牌定位 · 目标人群</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <Rocket className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">创意输出</h3>
                  <p className="text-sm text-gray-500">创意简报 · Slogan · 视觉方向</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">方案文档</h3>
                  <p className="text-sm text-gray-500">品牌手册 · 策划方案 · 执行计划</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Target,
      title: '品牌全案策划',
      description: '从市场调研到品牌定位，从视觉规范到传播策略，提供完整的品牌全案解决方案',
      tags: ['品牌定位', '视觉规范', '传播策略', '品牌手册']
    },
    {
      icon: Rocket,
      title: '活动策划',
      description: '线上线下活动全流程策划，包括主题创意、流程设计、物料清单、执行手册',
      tags: ['主题创意', '流程设计', '物料清单', '执行手册']
    },
    {
      icon: Sparkles,
      title: '新品上市',
      description: '从产品卖点挖掘到上市推广方案，快速输出专业级的新品营销全套资料',
      tags: ['卖点挖掘', '定价策略', '推广方案', '上市物料']
    },
    {
      icon: MessageSquare,
      title: '内容营销',
      description: '社交媒体内容规划、种草文案撰写、KOL合作方案，让内容营销更高效',
      tags: ['内容规划', '种草文案', 'KOL方案', '传播节奏']
    }
  ]

  return (
    <section id="features" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Layers className="w-4 h-4" />
            <span>核心功能</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            一站式品牌策划工作台
          </h2>
          <p className="text-lg text-gray-600">
            覆盖品牌全生命周期的四大核心场景，让创意工作更高效
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-purple-200 group-hover:shadow-xl group-hover:shadow-purple-300 transition-all">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
              <div className="flex flex-wrap gap-2">
                {feature.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex}
                    className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Advantages Section
const AdvantagesSection = () => {
  const advantages = [
    {
      icon: Zap,
      title: '效率提升 10倍',
      description: '传统方式需要数天完成的工作，灵思AI可在几分钟内输出初稿',
      highlight: '10x'
    },
    {
      icon: Award,
      title: '专业级输出',
      description: '基于大量4A广告公司和行业案例训练，输出方案符合专业标准',
      highlight: '4A'
    },
    {
      icon: Users,
      title: '智能协作',
      description: '支持多人在线协作，版本管理、批注评论，让团队配合更顺畅',
      highlight: 'Team'
    },
    {
      icon: Shield,
      title: '数据安全保障',
      description: '企业级数据加密，隐私保护，让您安心使用无后顾之忧',
      highlight: '安全'
    }
  ]

  return (
    <section id="advantages" className="py-20 md:py-32 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            <span>产品优势</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            为什么选择灵思AI
          </h2>
          <p className="text-lg text-gray-600">
            专业、高效、安全，让您的创意工作如虎添翼
          </p>
        </div>

        {/* Advantage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => (
            <div key={index} className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-lg shadow-purple-100 flex items-center justify-center group-hover:shadow-xl group-hover:shadow-purple-200 transition-all group-hover:-translate-y-1">
                  <advantage.icon className="w-10 h-10 text-purple-600" />
                </div>
                <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {advantage.highlight}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{advantage.title}</h3>
              <p className="text-gray-600 leading-relaxed">{advantage.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Stats Section
const StatsSection = () => {
  const stats = [
    { value: '50,000+', label: '品牌策划方案生成', icon: FileText },
    { value: '2,000+', label: '企业和团队用户', icon: Users },
    { value: '98%', label: '用户满意度', icon: Award },
    { value: '10min', label: '平均方案生成时间', icon: Clock }
  ]

  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-purple-200 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Cases Section
const CasesSection = () => {
  const cases = [
    {
      company: '某知名消费品牌',
      type: '新品上市',
      result: '2周完成全套新品上市方案，获得管理层一致认可',
      metrics: ['上市周期缩短60%', '方案通过率95%', '节省人力成本40%']
    },
    {
      company: '连锁餐饮企业',
      type: '品牌升级',
      result: '完成品牌全案策划，新形象获得消费者好评',
      metrics: ['品牌认知度提升35%', '门店客流增长20%', '社交媒体曝光量翻倍']
    },
    {
      company: '科技创业公司',
      type: '活动策划',
      result: '产品发布会策划执行，活动效果超出预期',
      metrics: ['活动参与人数1000+', '媒体曝光量50万+', '直播观看人数10万+']
    }
  ]

  return (
    <section id="cases" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <BarChart3 className="w-4 h-4" />
            <span>客户案例</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            真实案例，验证效果
          </h2>
          <p className="text-lg text-gray-600">
            各行业客户都在使用灵思AI提升品牌策划效率
          </p>
        </div>

        {/* Case Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.map((caseItem, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">{caseItem.company}</div>
                  <div className="text-sm text-purple-600 font-medium">{caseItem.type}</div>
                </div>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">{caseItem.result}</p>
              <div className="space-y-2">
                {caseItem.metrics.map((metric, metricIndex) => (
                  <div key={metricIndex} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{metric}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Pricing Section
const PricingSection = () => {
  const plans = [
    {
      name: '免费版',
      price: '0',
      period: '永久免费',
      description: '适合个人用户和轻度使用',
      features: [
        '每天 5 次方案生成',
        '基础品牌策划模板',
        '社区支持',
        '1 个项目空间'
      ],
      cta: '免费开始',
      popular: false
    },
    {
      name: '专业版',
      price: '99',
      period: '/月',
      description: '适合自由职业者和小型团队',
      features: [
        '无限方案生成',
        '全部品牌策划模板',
        '优先客户支持',
        '10 个项目空间',
        '团队协作功能',
        '高级数据分析'
      ],
      cta: '立即升级',
      popular: true
    },
    {
      name: '企业版',
      price: '399',
      period: '/月',
      description: '适合中大型企业和代理商',
      features: [
        '专业版全部功能',
        '无限项目空间',
        '专属客户成功经理',
        'API 接口接入',
        '私有化部署选项',
        'SLA 服务保障'
      ],
      cta: '联系销售',
      popular: false
    }
  ]

  return (
    <section id="pricing" className="py-20 md:py-32 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>价格方案</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            简单透明的定价
          </h2>
          <p className="text-lg text-gray-600">
            根据您的需求选择合适的方案，随时升级或降级
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative rounded-2xl p-8 ${
                plan.popular 
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-2xl shadow-purple-300 scale-105' 
                  : 'bg-white border border-gray-200 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-4 py-1 rounded-full">
                  最受欢迎
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    ¥{plan.price}
                  </span>
                  <span className={plan.popular ? 'text-purple-200' : 'text-gray-500'}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${plan.popular ? 'text-purple-200' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-green-300' : 'text-green-500'}`} />
                    <span className={plan.popular ? 'text-purple-100' : 'text-gray-600'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                  plan.popular
                    ? 'bg-white text-purple-600 hover:bg-purple-50'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise Note */}
        <div className="text-center mt-12 text-gray-500">
          <p>所有方案均含 14 天全额退款保证 · 企业版支持定制需求</p>
        </div>
      </div>
    </section>
  )
}

// CTA Section
const CTASection = () => (
  <section className="py-20 md:py-32 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 relative overflow-hidden">
    {/* Background Effects */}
    <div className="absolute inset-0">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full blur-[120px] opacity-30" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full blur-[120px] opacity-20" />
    </div>

    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
        准备好提升您的创意效率了吗？
      </h2>
      <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
        加入数千个品牌策划团队，让灵思AI成为您的创意合伙人
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          to="/register"
          className="group bg-white text-purple-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all shadow-xl flex items-center justify-center gap-2 hover:-translate-y-1"
        >
          免费开始使用
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <a 
          href="#features"
          className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
        >
          了解更多
        </a>
      </div>

      <p className="mt-8 text-purple-300 text-sm">
        无需信用卡 · 3分钟上手 · 永久免费基础版
      </p>
    </div>
  </section>
)

// Footer
const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">灵思AI</span>
          </div>
          <p className="text-sm leading-relaxed">
            灵思AI创意工作台 · 你的AI创意合伙人
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-white font-semibold mb-4">产品</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-purple-400 transition-colors">核心功能</a></li>
            <li><a href="#pricing" className="hover:text-purple-400 transition-colors">价格方案</a></li>
            <li><a href="#" className="hover:text-purple-400 transition-colors">更新日志</a></li>
            <li><a href="#" className="hover:text-purple-400 transition-colors">帮助文档</a></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold mb-4">公司</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-purple-400 transition-colors">关于我们</a></li>
            <li><a href="#" className="hover:text-purple-400 transition-colors">联系方式</a></li>
            <li><a href="#" className="hover:text-purple-400 transition-colors">加入团队</a></li>
            <li><a href="#" className="hover:text-purple-400 transition-colors">新闻动态</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-4">法律</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy" className="hover:text-purple-400 transition-colors">隐私政策</Link></li>
            <li><Link to="/terms" className="hover:text-purple-400 transition-colors">服务条款</Link></li>
            <li><a href="#" className="hover:text-purple-400 transition-colors">Cookie 政策</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm">
          © 2024 灵思AI创意工作台. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-purple-400 transition-colors" aria-label="微信">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.87c-.135-.004-.27-.018-.406-.012zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
            </svg>
          </a>
          <a href="#" className="hover:text-purple-400 transition-colors" aria-label="微博">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.573h.014zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.578-.172-.401-.649.387-1.034.428-1.896.007-2.532-.808-1.217-2.854-1.304-5.013-.727-1.856.494-3.301 1.527-3.562 2.53-.329 1.264.765 2.084 2.078 2.435 1.543.413 3.579.164 5.14-.455 1.542-.612 2.296-1.63 2.07-2.227-.103-.27-.377-.371-.766-.296-.186.038-.273.097-.339.165.346.1.59.218.642.507.08.441-.39 1.066-1.33 1.553-1.206.622-2.867.826-4.33.566-1.377-.245-2.526-1.073-2.106-2.106.26-.64 1.072-1.034 2.23-1.316 2.188-.533 4.752-.177 5.956 1.16.623.692.904 1.568.573 2.313-.18.403-.523.596-.866.6-.116-.002-.187-.02-.25-.059l.006-.001c-.001 0-.003-.001-.005-.001l-.004-.01z"/>
            </svg>
          </a>
          <a href="#" className="hover:text-purple-400 transition-colors" aria-label="GitHub">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
)

// Main Landing Page Component
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <AdvantagesSection />
      <StatsSection />
      <CasesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default LandingPage
