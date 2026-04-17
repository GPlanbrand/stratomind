import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Star Icon Component
const StarIcon = () => (
  <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

// Navigation Component
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <StarIcon />
            <span className="text-xl font-bold text-gray-900">灵思</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">产品功能</a>
            <a href="#cases" className="text-gray-600 hover:text-purple-600 transition-colors">客户案例</a>
            <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">价格</a>
          </div>
          <Link 
            to="/login"
            className="bg-purple-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            立即体验
          </Link>
        </div>
      </div>
    </nav>
  )
}

// Hero Section
const HeroSection = () => (
  <section className="relative pt-32 pb-20 overflow-hidden">
    {/* Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-100" />
    <div className="absolute top-20 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30" />
    <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-20" />
    
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
        <StarIcon />
        <span>AI驱动的品牌策划工作台</span>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
        灵思，你的<span className="text-purple-600">AI创意合伙人</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-purple-600 mb-4">
        让灵感涌动，思如泉涌
      </p>
      
      <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
        一个人，一台电脑，也能做出专业级的品牌策划方案
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          to="/register"
          className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300"
        >
          免费开始使用
        </Link>
        <a 
          href="#features"
          className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-purple-300 hover:text-purple-600 transition-all"
        >
          了解更多
        </a>
      </div>
    </div>
  </section>
)

// Pain Points Section
const PainPointsSection = () => {
  const painPoints = [
    {
      title: '小微广告/设计公司',
      emoji: '🏢',
      problem: '人员少、时间紧、客户要求高',
      challenges: [
        '竞品调研耗时太长',
        '专业策划框架缺失',
        '人员有限难以为继',
        '提案质量参差不齐'
      ],
      solution: 'AI一键分析，30秒生成8维度报告'
    },
    {
      title: '企业品宣负责人',
      emoji: '💼',
      problem: '资源有限，任务繁重，还要样样专业',
      challenges: [
        '没有专业团队支持',
        '时间紧迫还要高质量',
        '不懂专业策划流程',
        '方案说服力不足'
      ],
      solution: '模板+辅助生成，快速出稿'
    },
    {
      title: '政府宣传人员',
      emoji: '🏛️',
      problem: '流程规范要求高，容不得半点差错',
      challenges: [
        '需要规范专业的流程',
        '品牌建设缺乏方法指导',
        '材料撰写耗时耗力',
        '多项目并行难管理'
      ],
      solution: '标准策划框架，符合政务规范'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            目标客户的痛点，我们懂
          </h2>
          <p className="text-lg text-gray-600">
            专为品牌策划从业者打造的AI智能工具
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {painPoints.map((point, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{point.emoji}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{point.title}</h3>
              <p className="text-purple-600 font-medium mb-4">"{point.problem}"</p>
              
              <div className="space-y-2 mb-6">
                {point.challenges.map((challenge, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>{challenge}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-purple-100 pt-4">
                <p className="text-sm text-gray-500 mb-2">灵思的解决方案</p>
                <p className="text-purple-600 font-medium">{point.solution}</p>
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
      icon: '🤖',
      title: 'AI双引擎',
      subtitle: 'DeepSeek + 豆包',
      description: '深度理解品牌定位与市场格局，提供专业的策略建议'
    },
    {
      icon: '📋',
      title: '专业框架',
      subtitle: '内置行业方法论',
      description: '内置经过大量实践验证的品牌策划方法论'
    },
    {
      icon: '⚡',
      title: '效率提升10倍',
      subtitle: '从调研到方案',
      description: '传统方式需要3-5天的竞品调研，智能分析仅需30秒'
    }
  ]

  const coreFeatures = [
    {
      icon: '📊',
      title: '客户背景分析',
      description: '系统化梳理品牌现状，建立项目认知基础'
    },
    {
      icon: '🎯',
      title: '项目需求规划',
      description: '清晰定义目标、时间节点与交付标准'
    },
    {
      icon: '🔍',
      title: '竞品分析8维度',
      description: '全面把握市场竞争格局，洞察机会点'
    },
    {
      icon: '🧠',
      title: 'AI智能分析',
      description: '从海量信息中自动提取关键洞察'
    },
    {
      icon: '📝',
      title: '创意简报生成',
      description: '输出结构化、可执行的简报文档'
    },
    {
      icon: '💡',
      title: '创意策略制定',
      description: '形成完整专业的策略方案'
    }
  ]

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            产品亮点
          </h2>
          <p className="text-lg text-gray-600">
            三大核心能力，让专业触手可及
          </p>
        </div>

        {/* Highlight Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-purple-50"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-purple-600 font-medium mb-3">{feature.subtitle}</p>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Core Functions */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">核心功能矩阵</h3>
          <p className="text-gray-600">六大核心模块，覆盖品牌策划全流程</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreFeatures.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{feature.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Value Comparison Section
const ValueSection = () => (
  <section className="py-20 bg-purple-600">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          用户价值
        </h2>
        <p className="text-lg text-purple-100">
          超高性价比，让专业更简单
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Time Cost */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-6">⏱️ 时间成本对比</h3>
          <div className="space-y-4">
            <div>
              <p className="text-purple-200 text-sm mb-1">竞品调研</p>
              <div className="flex items-center gap-2">
                <span className="text-red-300 line-through">3-5天</span>
                <span className="text-white">→</span>
                <span className="text-green-300 font-bold">30秒</span>
              </div>
            </div>
            <div>
              <p className="text-purple-200 text-sm mb-1">简报撰写</p>
              <div className="flex items-center gap-2">
                <span className="text-red-300 line-through">2-3天</span>
                <span className="text-white">→</span>
                <span className="text-green-300 font-bold">1小时</span>
              </div>
            </div>
          </div>
        </div>

        {/* Human Cost */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-6">👥 人力成本对比</h3>
          <div className="space-y-4">
            <div>
              <p className="text-purple-200 text-sm mb-1">策划团队</p>
              <div className="flex items-center gap-2">
                <span className="text-red-300 line-through">2-3人</span>
                <span className="text-white">→</span>
                <span className="text-green-300 font-bold">1人+AI</span>
              </div>
            </div>
            <div>
              <p className="text-purple-200 text-sm mb-1">月成本</p>
              <div className="flex items-center gap-2">
                <span className="text-red-300 line-through">3万+</span>
                <span className="text-white">→</span>
                <span className="text-green-300 font-bold">极低</span>
              </div>
            </div>
          </div>
        </div>

        {/* Professionalism */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-6">📈 专业度提升</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              <span className="text-white">方法论驱动</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              <span className="text-white">结构化输出</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              <span className="text-white">AI质量保障</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              <span className="text-white">持续迭代优化</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

// Cases Section
const CasesSection = () => {
  const cases = [
    {
      tag: '小微广告公司',
      title: '3人团队完成品牌全案',
      background: '王总经营一家10人以下的小型服务广告公司，接到一个餐饮品牌的年度品牌推广全案，客户要求两周内提交。',
      result: [
        '原本需要一周的竞品调研，缩短到2小时',
        '辅助生成的简报框架节省了大量时间',
        '准时提交方案，客户当场表示满意',
        '后续合作顺利，签约年度服务合同'
      ],
      quote: '"以前这种全案我们都不敢接，怕人手不够。现在有了灵思，3个人也能做出专业方案。"',
      author: '— 王总，某小型广告公司创始人'
    },
    {
      tag: '企业品宣',
      title: '一个人搞定全年品牌宣传',
      background: '张小姐是某中型制造企业的市场部负责人，公司只有她一个人负责品牌工作。要在有限预算内做好全年品牌宣传，压力很大。',
      result: [
        '品牌工作变得系统化，不再手忙脚乱',
        '辅助生成的文案质量得到领导认可',
        '全年品牌声量提升，工作成绩得到肯定',
        '年底获得晋升，负责更大的项目'
      ],
      quote: '"用灵思，每一项工作都有记录，方案也很专业，领导终于看到了品牌工作的价值。"',
      author: '— 张小姐，某制造企业市场负责人'
    },
    {
      tag: '政府宣传',
      title: '规范流程，提升效能',
      background: '某区政府宣传部需要梳理区级品牌形象，制作统一的宣传规范手册。工作人员小李非广告专业出身，对品牌策划了解有限。',
      result: [
        '按照标准流程操作，完成专业规范的品牌方案',
        '文档格式规范，得到办公室认可',
        '品牌建设工作有了系统化指导',
        '领导表扬工作专业、流程规范'
      ],
      quote: '"灵思的框架很清晰，让我这个外行也能做出专业的东西。再也不怕领导问"这个方案专业吗"了。"',
      author: '— 小李，某区政府宣传部'
    }
  ]

  return (
    <section id="cases" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            客户案例
          </h2>
          <p className="text-lg text-gray-600">
            来自不同行业用户的真实反馈
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {cases.map((caseItem, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3">
                <span className="text-white font-medium text-sm">{caseItem.tag}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{caseItem.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{caseItem.background}</p>
                
                <div className="space-y-2 mb-4">
                  {caseItem.result.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-gray-700 text-sm italic mb-2">{caseItem.quote}</p>
                  <p className="text-purple-600 text-sm font-medium">{caseItem.author}</p>
                </div>
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
      price: '¥0',
      period: '永久免费',
      description: '个人用户试用',
      features: ['3个项目限额', '基础AI功能', '移动端访问'],
      highlight: false
    },
    {
      name: '专业版',
      price: '¥99',
      period: '/月',
      description: '小微公司/个人创业者',
      features: ['无限项目', '高级AI功能', '多端同步', '优先客服', '7天免费试用'],
      highlight: true
    },
    {
      name: '企业版',
      price: '定制',
      period: '',
      description: '中大型企业/政府机构',
      features: ['私有部署', '专属客服', '定制服务', 'SLA保障'],
      highlight: false
    }
  ]

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            价格方案
          </h2>
          <p className="text-lg text-gray-600">
            选择适合您的方案，开始高效品牌策划
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`rounded-2xl p-6 ${
                plan.highlight 
                  ? 'bg-purple-600 text-white shadow-xl scale-105' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              {plan.highlight && (
                <div className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                  最受欢迎
                </div>
              )}
              <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-4 ${plan.highlight ? 'text-purple-100' : 'text-gray-500'}`}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </span>
                <span className={`${plan.highlight ? 'text-purple-100' : 'text-gray-500'}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className={plan.highlight ? 'text-green-300' : 'text-purple-600'}>✓</span>
                    <span className={`text-sm ${plan.highlight ? 'text-white' : 'text-gray-600'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`block text-center py-3 rounded-lg font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-white text-purple-600 hover:bg-purple-50'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                立即开始
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA Section
const CTASection = () => (
  <section className="py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
        开始你的专业策划之旅
      </h2>
      <p className="text-xl text-purple-100 mb-8">
        注册仅需1分钟，立即体验AI带来的效率提升
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Link 
          to="/register"
          className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-colors shadow-lg"
        >
          立即免费体验
        </Link>
      </div>
      <p className="text-purple-200">
        访问地址：<span className="font-semibold">stratomind.cn</span>
      </p>
    </div>
  </section>
)

// Footer Component
const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <StarIcon />
            <span className="text-xl font-bold text-white">灵思</span>
          </div>
          <p className="text-sm">
            灵思，你的AI创意合伙人<br />
            让专业更简单，让创意更高效
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">产品</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-white transition-colors">产品功能</a></li>
            <li><a href="#cases" className="hover:text-white transition-colors">客户案例</a></li>
            <li><a href="#pricing" className="hover:text-white transition-colors">价格方案</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">支持</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">帮助中心</a></li>
            <li><a href="#" className="hover:text-white transition-colors">使用文档</a></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">服务条款</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">隐私政策</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">联系我们</h4>
          <ul className="space-y-2 text-sm">
            <li>客服邮箱：support@stratomind.cn</li>
            <li>商务合作：business@stratomind.cn</li>
            <li>官方网站：stratomind.cn</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-8 text-center text-sm">
        <p>© 2024 灵思AI创意工作台 | stratomind.cn</p>
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
      <PainPointsSection />
      <FeaturesSection />
      <ValueSection />
      <CasesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default LandingPage
