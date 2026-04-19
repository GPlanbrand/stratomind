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
  Mic,
  Coffee,
  Store,
  Gift,
  Briefcase,
  DollarSign,
  UsersRound,
  Timer
} from 'lucide-react'

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
              <span className="hidden sm:block text-xs text-gray-500">广告公司专用</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">能做什么</a>
            <a href="#cases" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">案例</a>
            <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">多少钱</a>
            <a href="#faq" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">常见问题</a>
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
              免费试用
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
              <a href="#features" className="text-gray-600 hover:text-purple-600 font-medium px-4">能做什么</a>
              <a href="#cases" className="text-gray-600 hover:text-purple-600 font-medium px-4">案例</a>
              <a href="#pricing" className="text-gray-600 hover:text-purple-600 font-medium px-4">多少钱</a>
              <a href="#faq" className="text-gray-600 hover:text-purple-600 font-medium px-4">常见问题</a>
              <div className="border-t border-gray-100 pt-4 px-4 flex flex-col gap-3">
                <Link to="/login" className="text-center text-gray-700 font-medium">登录</Link>
                <Link to="/register" className="text-center bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium">
                  免费试用
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
          <Briefcase className="w-4 h-4" />
          <span>帮广告公司多接单、快出方案</span>
        </div>
        
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
          客户催方案？
          <span className="relative inline-block mx-2 md:mx-4">
            <span className="relative z-10 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 bg-clip-text text-transparent">
              说话就搞定
            </span>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-purple-500/20 blur-lg -z-10 rounded-lg" />
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-purple-600 font-medium mb-4">
          县城火锅店 · 乡镇超市 · 健身房 · 培训班
        </p>
        
        <p className="text-base sm:text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          不用自己想，不用查资料。<br/>
          客户说需求，你说话，方案10秒出来。
          一个方案收500-2000元，比以前快100倍。
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/register"
            className="group bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 flex items-center gap-2 hover:-translate-y-1"
          >
            5分钟学会
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a 
            href="#cases"
            className="group flex items-center gap-2 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-purple-300 hover:text-purple-600 transition-all"
          >
            <Play className="w-5 h-5" />
            看别人怎么用
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>10秒出方案</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>直接发给客户</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>不满意随便改</span>
          </div>
        </div>

        {/* Hero Visual - 对话场景 */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
          <div className="bg-white rounded-2xl shadow-2xl shadow-purple-200 border border-purple-100 overflow-hidden max-w-2xl mx-auto">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 text-center text-sm text-gray-500">灵思AI · 帮广告公司出方案</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-white">
              {/* 用户输入 */}
              <div className="flex gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">你</span>
                </div>
                <div className="bg-white rounded-xl rounded-tl-none p-4 shadow-sm border border-purple-100 max-w-md">
                  <p className="text-gray-800">县城火锅店开业，200平，人均50，下周六开业，帮我想个活动方案</p>
                </div>
              </div>
              {/* AI输出 */}
              <div className="flex gap-3 justify-end">
                <div className="bg-purple-600 rounded-xl rounded-tr-none p-4 shadow-sm max-w-md text-left">
                  <p className="text-white text-sm leading-relaxed">
                    <span className="font-semibold">✅ 火锅店开业方案已生成</span><br/>
                    <span className="text-purple-200">📋 主题：辣爽开业·吃一送一</span><br/>
                    <span className="text-purple-200">💰 活动：6.8折+充值送</span><br/>
                    <span className="text-purple-200">📱 朋友圈文案已写好</span><br/>
                    <span className="text-purple-200">⏱️ 方案已保存，可直接使用</span>
                  </p>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="text-center mt-4">
                <span className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">🎤 说话就行，10秒出方案</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Value Section - 广告公司痛点
const ValueSection = () => {
  const pains = [
    {
      icon: Timer,
      title: '客户催得急',
      before: '自己想了2小时...',
      after: '说话10秒搞定'
    },
    {
      icon: DollarSign,
      title: '收费上不去',
      before: '一个方案才收300...',
      after: '用工具效率高，收500-2000'
    },
    {
      icon: UsersRound,
      title: '人手不够',
      before: '小公司就几个人...',
      after: '一个人顶10个人用'
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            广告公司的3个烦恼，灵思帮你解决
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pains.map((pain, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <pain.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{pain.title}</h3>
              <div className="space-y-2">
                <div className="text-red-300 text-sm">❌ {pain.before}</div>
                <div className="text-green-300 text-sm">✅ {pain.after}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Coffee,
      title: '餐饮开业',
      description: '火锅店、烧烤店、奶茶店...客户说什么，方案马上出来',
      tags: ['开业活动', '节日促销', '会员卡', '朋友圈文案']
    },
    {
      icon: Store,
      title: '商超零售',
      description: '超市、便利店、服装店...帮本地商家做促销方案',
      tags: ['打折活动', '引流方案', '会员营销', '换季清仓']
    },
    {
      icon: UsersRound,
      title: '服务行业',
      description: '健身房、培训班、美容院...帮服务业拉新、搞活动',
      tags: ['招生方案', '拓客引流', '老带新', '储值卡']
    },
    {
      icon: Gift,
      title: '本地服务',
      description: '开荒保洁、婚庆摄影、家政维修...帮本地服务做推广',
      tags: ['推广文案', '活动策划', '朋友圈', '优惠券']
    }
  ]

  return (
    <section id="features" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Layers className="w-4 h-4" />
            <span>能做什么</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            客户要什么，直接说
          </h2>
          <p className="text-lg text-gray-600">
            餐饮、商超、服务业...本地客户的方案，全都能出
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
              <p className="text-gray-600 mb-4 leading-relaxed text-sm">{feature.description}</p>
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
      title: '快！10秒出方案',
      description: '客户催得急？10秒出方案，不用自己想。发过去客户都说好',
      highlight: '10秒'
    },
    {
      icon: DollarSign,
      title: '多赚钱！',
      description: '以前一天做1个方案，现在能做10个。收费提高，效率翻倍',
      highlight: '多赚'
    },
    {
      icon: MessageSquare,
      title: '简单！说话就行',
      description: '不用学，不用研究。客户说什么你说什么，方案自动出来',
      highlight: '0门槛'
    },
    {
      icon: Shield,
      title: '免费试用！',
      description: '先试再买，不好用不收钱。觉得好再开会员，一个月才29',
      highlight: '先试后买'
    }
  ]

  return (
    <section id="advantages" className="py-20 md:py-32 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            <span>为什么用灵思</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            比你想的更简单、更赚钱
          </h2>
          <p className="text-lg text-gray-600">
            帮广告公司多接单、快出方案、收更多钱
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
              <p className="text-gray-600 leading-relaxed text-sm">{advantage.description}</p>
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
    { value: '50,000+', label: '个方案已生成', icon: FileText },
    { value: '3,000+', label: '广告公司在用', icon: Briefcase },
    { value: '10秒', label: '平均出方案时间', icon: Clock },
    { value: '500-2000', label: '单方案收费(元)', icon: DollarSign }
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

// Cases Section - 广告公司视角
const CasesSection = () => {
  const cases = [
    {
      company: '县城火锅店',
      type: '开业活动',
      result: '用灵思出了个方案，收了客户800。开业当天客户发朋友圈说效果很好',
      metrics: ['方案5分钟出', '收费800元', '客户很满意']
    },
    {
      company: '乡镇超市',
      type: '节日促销',
      result: '帮镇上超市想了个鸡蛋特价活动，收了500。老板说人比以前多一倍',
      metrics: ['活动方案快', '收费500元', '客户效果明显']
    },
    {
      company: '本地健身房',
      type: '招生方案',
      result: '出了个888元年卡方案，收了1200。一个月收了50个新会员',
      metrics: ['方案专业', '收费1200元', '帮客户赚钱']
    }
  ]

  return (
    <section id="cases" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <BarChart3 className="w-4 h-4" />
            <span>真实案例</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            广告公司都在用
          </h2>
          <p className="text-lg text-gray-600">
            帮本地客户出方案，收费500-2000元，10分钟搞定
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
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">{caseItem.company}</div>
                  <div className="text-sm text-purple-600 font-medium">{caseItem.type}</div>
                </div>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed text-sm">"{caseItem.result}"</p>
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
      name: '免费用',
      price: '0',
      period: '永久免费',
      description: '先试试，好用再买',
      features: [
        '每天 3 次免费',
        '基本方案模板',
        '开业活动方案',
        '促销文案',
        '朋友圈推广'
      ],
      cta: '先试试',
      popular: false
    },
    {
      name: '月卡',
      price: '29',
      period: '元/月',
      description: '接2单就回本',
      features: [
        '每天无限次用',
        '全部方案模板',
        '优先出方案',
        '方案保存无限',
        '专属客服'
      ],
      cta: '开月卡',
      popular: true
    },
    {
      name: '年卡',
      price: '199',
      period: '元/年',
      description: '一天不到6毛钱',
      features: [
        '月卡全部功能',
        '一年随便用',
        '送实体手册',
        '优先新功能',
        '专属顾问'
      ],
      cta: '买年卡',
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
            <span>多少钱</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            便宜到不敢相信
          </h2>
          <p className="text-lg text-gray-600">
            接一单就回本，用了再也离不开
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
                  大多数人选这个
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
          <p>先试再买，不好用不收钱 · 随时退 · 客服随时在</p>
        </div>
      </div>
    </section>
  )
}

// FAQ Section
const FAQSection = () => {
  const faqs = [
    {
      q: '我是小广告公司，能用吗？',
      a: '当然能！小公司最适合用灵思。老板就几个人，客户催得急，用灵思10秒出方案，一个人顶10个人用。'
    },
    {
      q: '方案质量怎么样？',
      a: '都是根据客户情况专门写的，不是套话。直接发给客户没问题。客户都说方案很专业。'
    },
    {
      q: '收费怎么定？',
      a: '看情况。开业方案500-1500，促销活动300-800，整体品牌方案2000-5000。用灵思效率高，成本低，赚得更多。'
    },
    {
      q: '客户要改怎么办？',
      a: '直接说哪里改，比如"换个主题"、"加点优惠"、"文案短一点"，10秒改好，客户满意为止。'
    },
    {
      q: '能帮客户开账号吗？',
      a: '不用开。你帮客户出方案，是你们之间的事。客户不需要知道你在用什么工具。'
    }
  ]

  return (
    <section id="faq" className="py-20 md:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            常见问题
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-purple-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Q: {faq.q}</h3>
              <p className="text-gray-600">A: {faq.a}</p>
            </div>
          ))}
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
        还在自己憋方案？
      </h2>
      <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
        说话就出方案，10秒搞定客户要的东西<br/>
        多接单、快出方案、多赚钱
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          to="/register"
          className="group bg-white text-purple-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all shadow-xl flex items-center justify-center gap-2 hover:-translate-y-1"
        >
          免费试用
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <a 
          href="#pricing"
          className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
        >
          先看价格
        </a>
      </div>

      <p className="mt-8 text-purple-300 text-sm">
        不用注册也能试 · 10秒出方案 · 不满意随便改
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
            帮广告公司多接单、快出方案、多赚钱
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-white font-semibold mb-4">功能</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-purple-400 transition-colors">能做什么</a></li>
            <li><a href="#pricing" className="hover:text-purple-400 transition-colors">多少钱</a></li>
            <li><a href="#cases" className="hover:text-purple-400 transition-colors">真实案例</a></li>
            <li><a href="#faq" className="hover:text-purple-400 transition-colors">常见问题</a></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold mb-4">帮助</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-purple-400 transition-colors">使用教程</a></li>
            <li><a href="#" className="hover:text-purple-400 transition-colors">联系客服</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-4">其他</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy" className="hover:text-purple-400 transition-colors">隐私政策</Link></li>
            <li><Link to="/terms" className="hover:text-purple-400 transition-colors">服务条款</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm">
          © 2024 灵思AI · 广告公司专用方案工具
        </p>
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
      <ValueSection />
      <FeaturesSection />
      <AdvantagesSection />
      <StatsSection />
      <CasesSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default LandingPage
