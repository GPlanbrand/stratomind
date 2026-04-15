import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';

const HomeLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // App推广栏状态
  const [showAppBanner, setShowAppBanner] = useState(true);

  // 手机版引导页状态
  const [showMobileGuide, setShowMobileGuide] = useState(true);

  // 登录方式状态（仅移动端使用）
  const [loginMethod, setLoginMethod] = useState<'account' | 'phone'>('account');

  // Banner数据 - 预留3个位置
  const leftBanners = [
    {
      title: '让品牌策划更智能',
      subtitle: '一站式品牌创意工作平台，助力企业快速构建品牌策略',
    },
    {
      title: '智能数据分析',
      subtitle: '深度洞察市场与竞品，多维度数据一触即达',
    },
    {
      title: '创意策略生成',
      subtitle: 'AI驱动创意灵感，一键产出完整品牌方案',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % leftBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 手机版引导页 */}
      {showMobileGuide && (
        <div className="lg:hidden fixed inset-0 z-50 bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center px-6" style={{ overscrollBehavior: 'none', touchAction: 'none' }}>
          {/* 主内容区 */}
          <div className="flex flex-col items-center mb-16">
            {/* App图标 */}
            <div className="w-16 h-16 mb-5">
              <img src="/app-icon.svg" alt="StratoMind" className="w-full h-full" />
            </div>
            
            {/* 文案 */}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">使用App登陆更便捷</h2>
            <p className="text-sm text-gray-500">请下载官方App使用</p>
          </div>

          {/* 按钮区 - 居中 */}
          <div className="w-full max-w-[260px] space-y-3 mb-16">
            <button
              onClick={() => window.open('#', '_blank')}
              className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-700 transition-colors"
            >
              立刻下载StratoMind
            </button>
            <button
              onClick={() => setShowMobileGuide(false)}
              className="w-full py-2.5 bg-gray-100 text-gray-400 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              先进入网页版
            </button>
          </div>

          {/* 底部品牌 */}
          <div className="absolute bottom-8 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <img src="/guide-logo.svg" alt="StratoMind" className="h-16 w-auto" />
            </div>
            <p className="text-xs text-gray-500 mt-2">© StratoMind. All Rights Reserved.</p>
          </div>
        </div>
      )}

      {/* 移动端顶部 - Logo */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 transition-all duration-300 ${showMobileGuide ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="px-4 py-3 flex items-center gap-2">
          <img src="/logo.svg" alt="灵思" className="h-6 w-auto" />
          <span className="text-base font-semibold text-gray-800">灵思，你的AI创意合伙人</span>
        </div>
      </div>

      {/* App下载推广栏 - 手机版，参考网易 */}
      <div className="lg:hidden">
        <div 
          className={`fixed top-14 left-0 right-0 z-30 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-3 py-2 flex items-center gap-2 shadow-lg transition-all duration-300 ${
            showAppBanner ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <img src="/app-logo.svg" alt="App Logo" className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium leading-tight truncate">AI 创意工作台</div>
            <div className="text-xs opacity-80 leading-tight">智能品牌策划</div>
          </div>
          <button 
            onClick={() => window.open('#', '_blank')}
            className="px-3 py-1 bg-white text-purple-600 text-xs font-medium rounded-full hover:bg-purple-50 transition-colors flex-shrink-0"
          >
            获取
          </button>
          <button 
            onClick={() => setShowAppBanner(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            aria-label="关闭"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 移动端内容区 - 保留手机登录方式 */}
      <div className="lg:hidden min-h-screen pt-14 bg-white" style={{ paddingTop: showAppBanner ? 'calc(3.5rem + 56px)' : '56px' }}>
        <div className="px-5 py-8">
          <div className="bg-white">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">欢迎回来</h2>
            <p className="text-sm text-gray-500 mb-6">登录后开启品牌策划之旅</p>

            {/* 登录方式切换 - 手机版 */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
              <button
                onClick={() => setLoginMethod('account')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  loginMethod === 'account' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                账号登录
              </button>
              <button
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  loginMethod === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                手机登录
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

            {/* 手机登录表单 */}
            {loginMethod === 'phone' && (
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
                    placeholder="请输入验证码"
                    maxLength={6}
                  />
                  <button
                    onClick={handleSendCode}
                    disabled={countdown > 0 || loading}
                    className="px-4 py-3.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 whitespace-nowrap min-h-[48px] transition-all"
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>

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

      {/* 桌面端 - 126邮箱风格：左侧Banner轮播 + 右侧登录卡片 */}
      <div className="hidden lg:flex min-h-screen">
        {/* 全屏背景 - 预留Banner图片位置（目前用渐变占位） */}
        <div className="fixed inset-0 overflow-hidden">
          {leftBanners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 transition-opacity duration-1000 ${
                index === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* 装饰性光斑 */}
              <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-white/40 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-200/30 rounded-full blur-[100px]"></div>
              </div>
            </div>
          ))}
        </div>

        {/* 顶部Logo */}
        <div className="fixed top-0 left-0 right-0 z-20 px-10 py-5">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="灵思" className="h-10 w-auto" />
            <span className="text-xl font-semibold text-gray-800">灵思AI创意工作台</span>
          </div>
        </div>

        {/* 左侧Banner轮播区 - 126邮箱风格 */}
        <div className="absolute left-0 top-0 bottom-0 w-[55%] flex items-center z-10">
          {/* 左侧轮播指示器 - 竖排小圆点 */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
            {leftBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentBanner 
                    ? 'bg-green-500 scale-125' 
                    : 'bg-gray-400/50 hover:bg-gray-400'
                }`}
                aria-label={`切换到第${index + 1}个Banner`}
              />
            ))}
          </div>

          {/* Banner内容 - 居中偏左 */}
          <div className="ml-20 max-w-xl relative" style={{ minHeight: '120px' }}>
            {leftBanners.map((banner, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${
                  index === currentBanner 
                    ? 'opacity-100' 
                    : 'opacity-0 absolute top-0 left-0 right-0 pointer-events-none'
                }`}
              >
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {banner.title}
                </h1>
                <p className="text-base text-gray-500 leading-relaxed">
                  {banner.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧登录卡片 - 126邮箱风格，纯白背景，靠右 */}
        <div className="flex items-center justify-end w-full relative z-10 px-16">
          <div className="bg-white rounded-2xl shadow-[0_8px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 w-full max-w-[400px] overflow-hidden">
            <div className="p-8">
              {/* 登录方式切换Tab */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
                <button
                  onClick={() => setLoginMethod('account')}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    loginMethod === 'account' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  账号登录
                </button>
                <button
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    loginMethod === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  手机登录
                </button>
              </div>

              {/* 账号登录表单 */}
              {loginMethod === 'account' && (
                <div className="space-y-4">
                  {/* 用户名/邮箱 */}
                  <div>
                    <input
                      type="text"
                      value={account}
                      onChange={(e) => { setAccount(e.target.value); setError(''); }}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                      placeholder="用户名 / 邮箱"
                    />
                  </div>
                  
                  {/* 密码 */}
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                      placeholder="密码"
                    />
                  </div>

                  {/* 错误提示 */}
                  {error && (
                    <div className="text-red-500 text-sm py-2">
                      {error}
                    </div>
                  )}

                  {/* 登录按钮 */}
                  <button
                    onClick={handleAccountLogin}
                    disabled={loading}
                    className="w-full py-3.5 bg-green-500 text-white rounded-lg font-medium text-base hover:bg-green-600 transition-colors disabled:opacity-50 active:scale-[0.99]"
                  >
                    {loading ? '登录中...' : '登 录'}
                  </button>

                  {/* 忘记密码和注册新账号 */}
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <a href="/register" className="text-indigo-600 hover:text-indigo-700">注册新账号</a>
                    <span className="text-gray-300">|</span>
                    <a href="/forgot-password" className="text-indigo-600 hover:text-indigo-700">忘记密码?</a>
                  </div>
                  
                  {/* 服务条款 */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="agreeTermsDesktop"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="agreeTermsDesktop" className="text-xs text-gray-500">
                      阅读并接受 <a href="/terms" className="text-green-600 hover:underline">《服务条款》</a> 和 <a href="/privacy" className="text-green-600 hover:underline">《隐私政策》</a>
                    </label>
                  </div>
                  
                  <div className="pt-3 text-center">
                    <p className="text-xs text-gray-400">
                      演示：demo / demo123
                    </p>
                  </div>
                </div>
              )}

              {/* 手机登录表单 */}
              {loginMethod === 'phone' && (
                <div className="space-y-4">
                  {/* 手机号 */}
                  <div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setError(''); }}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                      placeholder="请输入手机号"
                    />
                  </div>
                  
                  {/* 验证码 */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => { setCode(e.target.value); setError(''); }}
                      className="flex-1 px-4 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                      placeholder="请输入验证码"
                    />
                    <button
                      onClick={handleSendCode}
                      disabled={countdown > 0 || loading}
                      className="px-4 py-3.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 whitespace-nowrap transition-all"
                    >
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </button>
                  </div>

                  {/* 错误提示 */}
                  {error && (
                    <div className="text-red-500 text-sm py-2">
                      {error}
                    </div>
                  )}

                  {/* 登录按钮 */}
                  <button
                    onClick={handlePhoneLogin}
                    disabled={loading}
                    className="w-full py-3.5 bg-green-500 text-white rounded-lg font-medium text-base hover:bg-green-600 transition-colors disabled:opacity-50 active:scale-[0.99]"
                  >
                    {loading ? '登录中...' : '登 录'}
                  </button>

                  {/* 忘记密码和注册新账号 */}
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <a href="/register" className="text-indigo-600 hover:text-indigo-700">注册新账号</a>
                    <span className="text-gray-300">|</span>
                    <a href="/forgot-password" className="text-indigo-600 hover:text-indigo-700">忘记密码?</a>
                  </div>
                  
                  {/* 服务条款 */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="agreeTermsDesktopPhone"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="agreeTermsDesktopPhone" className="text-xs text-gray-500">
                      阅读并接受 <a href="/terms" className="text-green-600 hover:underline">《服务条款》</a> 和 <a href="/privacy" className="text-green-600 hover:underline">《隐私政策》</a>
                    </label>
                  </div>
                  
                  <div className="pt-3 text-center">
                    <p className="text-xs text-gray-400">
                      演示验证码：123456
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 演示体验按钮 */}
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
