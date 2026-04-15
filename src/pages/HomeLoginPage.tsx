import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';

const HomeLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loginMethod, setLoginMethod] = useState<'account' | 'phone' | 'qrcode'>('account');
  
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 手机登录引导状态
  const [showPhoneGuide, setShowPhoneGuide] = useState(false);
  
  // App推广栏状态
  const [showAppBanner, setShowAppBanner] = useState(true);

  // 优化后的淡雅配色Banner
  const banners = [
    { 
      gradient: 'from-slate-100 via-blue-50 to-indigo-100',
      accent: 'text-indigo-600',
      title: '智能品牌分析',
      desc: '深度洞察市场与竞品'
    },
    { 
      gradient: 'from-violet-50 via-purple-50 to-fuchsia-50',
      accent: 'text-purple-600',
      title: '创意策略生成',
      desc: '一键产出完整方案'
    },
    { 
      gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
      accent: 'text-teal-600',
      title: '可视化报告',
      desc: '多维度图表展示'
    },
    { 
      gradient: 'from-amber-50 via-orange-50 to-yellow-50',
      accent: 'text-orange-600',
      title: '团队协作',
      desc: '高效协同项目推进'
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 监听手机登录方式切换，显示引导页
  useEffect(() => {
    if (loginMethod === 'phone') {
      setShowPhoneGuide(true);
    }
  }, [loginMethod]);

  const handleDemoLogin = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const result = login('demo', 'demo123');
      setLoading(false);
      if (result.success) {
        navigate('/projects');
      } else {
        setError(result.message);
      }
    }, 500);
  };

  const handleAccountLogin = () => {
    if (!agreeTerms) {
      setError('请先阅读并同意服务条款');
      return;
    }
    if (!account) {
      setError('请输入用户名或邮箱');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      const result = login(account, password);
      setLoading(false);
      if (result.success) {
        navigate('/projects');
      } else {
        setError(result.message);
      }
    }, 500);
  };

  const handleSendCode = () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      setCountdown(60);
      setLoading(false);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 500);
  };

  const handlePhoneLogin = () => {
    if (!agreeTerms) {
      setError('请先阅读并同意服务条款');
      return;
    }
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    if (code === '123456') {
      setLoading(true);
      setError('');
      setTimeout(() => {
        const result = login(phone, '123456');
        setLoading(false);
        if (result.success) {
          navigate('/projects');
        } else {
          setError(result.message);
        }
      }, 500);
      return;
    }
    if (!code || code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }
    setError('验证码错误（演示模式请输入123456）');
  };

  const handleEnterPhoneLogin = () => {
    setShowPhoneGuide(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端顶部 - Logo */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="AI 创意工作台" className="h-7 w-auto" />
            <span className="text-base font-medium text-gray-900">AI 创意工作台</span>
          </div>
        </div>
      </div>

      {/* App下载推广栏 - 手机版 */}
      <div className="lg:hidden">
        <div 
          className={`fixed top-14 left-0 right-0 z-30 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 flex items-center justify-between shadow-lg transition-all duration-300 ${
            showAppBanner ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
          style={{ display: 'block' }}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
              <img src="/logo.svg" alt="App Logo" className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium leading-tight">AI 创意工作台</div>
              <div className="text-xs opacity-80 leading-tight">智能品牌策划</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.open('#', '_blank')}
              className="px-4 py-1.5 bg-white text-indigo-600 text-sm font-medium rounded-full hover:bg-indigo-50 transition-colors"
            >
              获取
            </button>
            <button 
              onClick={() => setShowAppBanner(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              aria-label="关闭"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 移动端内容区 - 126邮箱风格，白色背景 */}
      <div className="lg:hidden min-h-screen pt-14 bg-white" style={{ paddingTop: showAppBanner ? 'calc(3.5rem + 56px)' : '56px' }}>
        {/* 登录表单 - 简洁风格 */}
        <div className="px-5 py-8">
          <div className="bg-white">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">欢迎回来</h2>
            <p className="text-sm text-gray-500 mb-6">登录后开启品牌策划之旅</p>

            {/* 登录方式切换 - 更精致的Tab样式 */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
              <button
                onClick={() => { setLoginMethod('account'); setShowPhoneGuide(false); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  loginMethod === 'account' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                账号密码
              </button>
              <button
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  loginMethod === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                手机验证
              </button>
              <button
                onClick={() => { setLoginMethod('qrcode'); setShowPhoneGuide(false); }}
                className={`hidden md:flex flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 items-center justify-center gap-1 ${
                  loginMethod === 'qrcode' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m10 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                扫码
              </button>
            </div>

            {/* 账号登录表单 */}
            {loginMethod === 'account' && (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => { setAccount(e.target.value); setError(''); }}
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="用户名 / 邮箱"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="密码"
                  />
                </div>

                {/* 服务条款 */}
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="agreeTermsMobile"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="agreeTermsMobile" className="text-xs text-gray-500">
                    阅读并接受 <a href="/terms" className="text-indigo-600 hover:underline">《服务条款》</a> 和 <a href="/privacy" className="text-indigo-600 hover:underline">《隐私政策》</a>
                  </label>
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center py-2.5 bg-red-50 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleAccountLogin}
                  disabled={loading}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium text-base hover:bg-gray-800 transition-colors disabled:opacity-50 min-h-[48px] active:scale-[0.98]"
                >
                  {loading ? '登录中...' : '登 录'}
                </button>

                {/* 注册和忘记密码并排 */}
                <div className="flex items-center justify-center gap-4 text-sm">
                  <a href="/register" className="text-indigo-600 hover:text-indigo-700">注册新账号</a>
                  <span className="text-gray-300">|</span>
                  <a href="/forgot-password" className="text-indigo-600 hover:text-indigo-700">忘记密码?</a>
                </div>

                <div className="pt-2 text-center">
                  <p className="text-xs text-gray-400">
                    演示：demo / demo123
                  </p>
                </div>
              </div>
            )}

            {/* 手机登录引导页 */}
            {loginMethod === 'phone' && showPhoneGuide && (
              <div className="py-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">使用App登录更便捷</h3>
                <p className="text-sm text-gray-500 mb-8 px-4 leading-relaxed">
                  AI 创意工作台已全新升级<br/>
                  请下载官方App享受完整服务
                </p>
                <div className="space-y-3 px-4">
                  <button
                    onClick={() => window.open('#', '_blank')}
                    className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium text-base hover:bg-gray-800 transition-colors min-h-[48px] active:scale-[0.98]"
                  >
                    立即下载App
                  </button>
                  <button
                    onClick={handleEnterPhoneLogin}
                    className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-base hover:bg-gray-50 transition-colors min-h-[48px]"
                  >
                    先进入网页版
                  </button>
                </div>
              </div>
            )}

            {/* 手机登录表单 - 引导后显示 */}
            {loginMethod === 'phone' && !showPhoneGuide && (
              <div className="space-y-4">
                <div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(''); }}
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="手机号"
                    maxLength={11}
                  />
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                    className="flex-1 px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="验证码"
                    maxLength={6}
                  />
                  <button
                    onClick={handleSendCode}
                    disabled={countdown > 0 || loading}
                    className="px-5 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 min-w-[110px] min-h-[48px] transition-colors"
                  >
                    {countdown > 0 ? `${countdown}秒` : '获取验证码'}
                  </button>
                </div>

                {/* 服务条款 */}
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="agreeTermsPhoneMobile"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="agreeTermsPhoneMobile" className="text-xs text-gray-500">
                    阅读并接受 <a href="/terms" className="text-indigo-600 hover:underline">《服务条款》</a> 和 <a href="/privacy" className="text-indigo-600 hover:underline">《隐私政策》</a>
                  </label>
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center py-2.5 bg-red-50 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePhoneLogin}
                  disabled={loading}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium text-base hover:bg-gray-800 transition-colors disabled:opacity-50 min-h-[48px] active:scale-[0.98]"
                >
                  {loading ? '登录中...' : '登 录'}
                </button>

                {/* 注册和忘记密码并排 */}
                <div className="flex items-center justify-center gap-4 text-sm">
                  <a href="/register" className="text-indigo-600 hover:text-indigo-700">注册新账号</a>
                  <span className="text-gray-300">|</span>
                  <a href="/forgot-password" className="text-indigo-600 hover:text-indigo-700">忘记密码?</a>
                </div>

                <div className="pt-2 text-center">
                  <p className="text-xs text-gray-400">
                    演示验证码：123456
                  </p>
                </div>
              </div>
            )}

            {/* 扫码登录 */}
            {loginMethod === 'qrcode' && (
              <div className="py-6 text-center">
                <div className="w-48 h-48 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m10 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="text-sm text-gray-500 mt-2">微信扫码功能</p>
                    <p className="text-xs text-gray-400 mt-1">暂未开放，敬请期待</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">使用微信扫描上方二维码</p>
                <p className="text-xs text-gray-400 mt-1">请在微信中打开"扫一扫"功能</p>
              </div>
            )}

            {/* 底部链接 */}
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center text-xs">
              <div className="text-gray-400">
                <a href="/terms" className="hover:text-gray-600">服务条款</a>
                <span className="mx-2">·</span>
                <a href="/privacy" className="hover:text-gray-600">隐私政策</a>
              </div>
            </div>
          </div>

          {/* 演示体验 */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mt-5 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-base hover:bg-gray-50 hover:border-gray-300 transition-all min-h-[48px]"
          >
            演示体验
          </button>
        </div>
      </div>

      {/* 桌面端 - 全新优雅设计：Vercel/Linear风格 */}
      <div className="hidden lg:flex min-h-screen">
        {/* 全屏淡雅渐变背景 */}
        <div className="fixed inset-0 overflow-hidden">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} transition-opacity duration-1500 ${
                index === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* 装饰性光斑 */}
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/40 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/30 rounded-full blur-[100px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[150px]"></div>
              </div>
            </div>
          ))}
        </div>

        {/* 顶部Logo - 更精致的样式 */}
        <div className="fixed top-0 left-0 right-0 z-20 px-10 py-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="AI 创意工作台" className="h-7 w-auto" />
            <span className="text-base font-semibold text-gray-800">AI 创意工作台</span>
          </div>
        </div>

        {/* 左侧产品宣传区 - 淡雅配色 */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 px-12 max-w-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            让品牌策划<br/>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">更智能、更高效</span>
          </h1>
          <p className="text-base text-gray-500 mb-8 leading-relaxed">
            一站式品牌创意工作平台，助力企业快速构建品牌策略
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-shadow border border-gray-100">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="pt-0.5">
                <div className="font-semibold text-gray-900">智能竞品分析</div>
                <div className="text-gray-500 text-sm mt-0.5">多维度数据洞察，一键生成竞品报告</div>
              </div>
            </div>
            <div className="flex items-start gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-shadow border border-gray-100">
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="pt-0.5">
                <div className="font-semibold text-gray-900">AI创意生成</div>
                <div className="text-gray-500 text-sm mt-0.5">智能生成创意简报与品牌策略方案</div>
              </div>
            </div>
            <div className="flex items-start gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-shadow border border-gray-100">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="pt-0.5">
                <div className="font-semibold text-gray-900">一键导出报告</div>
                <div className="text-gray-500 text-sm mt-0.5">专业文档格式，随时下载分享团队</div>
              </div>
            </div>
          </div>
        </div>

        {/* 登录卡片靠右 - 精致玻璃态设计 */}
        <div className="flex items-center justify-end w-full relative z-10 px-8 lg:pr-20">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 w-full max-w-sm overflow-hidden">
            {/* 登录表单内容 */}
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">欢迎回来</h2>
                <p className="text-sm text-gray-500 mt-0.5">登录后开启品牌策划之旅</p>
              </div>

              {/* 登录方式切换 - 胶囊式Tab */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-5">
                <button
                  onClick={() => { setLoginMethod('account'); setShowPhoneGuide(false); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    loginMethod === 'account' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  账号密码
                </button>
                <button
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    loginMethod === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  手机验证
                </button>
                <button
                  onClick={() => { setLoginMethod('qrcode'); setShowPhoneGuide(false); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 items-center justify-center gap-1 ${
                    loginMethod === 'qrcode' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m10 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  扫码
                </button>
              </div>

              {/* 账号登录表单 */}
              {loginMethod === 'account' && (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={account}
                      onChange={(e) => { setAccount(e.target.value); setError(''); }}
                      className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                      placeholder="用户名 / 邮箱"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                      placeholder="密码"
                    />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="agreeTerms" className="text-xs text-gray-500">
                      阅读并接受 <a href="/terms" className="text-indigo-600 hover:underline">《服务条款》</a> 和 <a href="/privacy" className="text-indigo-600 hover:underline">《隐私政策》</a>
                    </label>
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm text-center py-2.5 bg-red-50 rounded-xl">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleAccountLogin}
                    disabled={loading}
                    className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 active:scale-[0.99]"
                  >
                    {loading ? '登录中...' : '登 录'}
                  </button>
                  
                  {/* 注册和忘记密码 */}
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <a href="/register" className="text-indigo-600 hover:text-indigo-700">注册新账号</a>
                    <span className="text-gray-300">·</span>
                    <a href="/forgot-password" className="text-indigo-600 hover:text-indigo-700">忘记密码?</a>
                  </div>
                  
                  <div className="pt-2 text-center">
                    <p className="text-xs text-gray-400">
                      演示：demo / demo123
                    </p>
                  </div>
                </div>
              )}

              {/* 手机登录表单 */}
              {loginMethod === 'phone' && (
                <div className="space-y-4">
                  <div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setError(''); }}
                      className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                      placeholder="手机号"
                      maxLength={11}
                    />
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                      className="flex-1 px-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                      placeholder="验证码"
                      maxLength={6}
                    />
                    <button
                      onClick={handleSendCode}
                      disabled={countdown > 0 || loading}
                      className="px-5 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap min-w-[120px]"
                    >
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="agreeTermsPhone"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="agreeTermsPhone" className="text-xs text-gray-500">
                      阅读并接受 <a href="/terms" className="text-indigo-600 hover:underline">《服务条款》</a> 和 <a href="/privacy" className="text-indigo-600 hover:underline">《隐私政策》</a>
                    </label>
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm text-center py-2.5 bg-red-50 rounded-xl">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handlePhoneLogin}
                    disabled={loading}
                    className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 active:scale-[0.99]"
                  >
                    {loading ? '登录中...' : '登 录'}
                  </button>
                  
                  {/* 忘记密码链接 */}
                  <div className="text-center">
                    <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700">
                      忘记密码?
                    </a>
                  </div>
                  
                  <div className="pt-2 text-center">
                    <p className="text-xs text-gray-400">
                      演示验证码：123456
                    </p>
                  </div>
                </div>
              )}

              {/* 扫码登录 */}
              {loginMethod === 'qrcode' && (
                <div className="py-6 text-center">
                  <div className="w-48 h-48 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m10 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <p className="text-sm text-gray-500 mt-2">微信扫码功能</p>
                      <p className="text-xs text-gray-400 mt-1">暂未开放，敬请期待</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">使用微信扫描上方二维码</p>
                  <p className="text-xs text-gray-400 mt-1">请在微信中打开"扫一扫"功能</p>
                </div>
              )}

              {/* 底部链接 */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-end text-xs">
                <div className="text-gray-400">
                  <a href="/terms" className="hover:text-gray-600">服务条款</a>
                  <span className="mx-2">·</span>
                  <a href="/privacy" className="hover:text-gray-600">隐私政策</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 演示体验按钮 - 优雅胶囊式 */}
        <div className="fixed bottom-8 right-8 z-20">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="px-6 py-3 bg-white/80 backdrop-blur-xl text-gray-700 rounded-full text-sm font-medium hover:bg-white hover:shadow-lg transition-all border border-gray-200/50 shadow-md"
          >
            演示体验
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeLoginPage;
