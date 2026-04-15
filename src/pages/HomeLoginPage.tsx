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

  const banners = [
    { gradient: 'from-blue-500 via-blue-400 to-cyan-300', title: '智能品牌分析', desc: '深度洞察市场与竞品' },
    { gradient: 'from-purple-500 via-purple-400 to-pink-300', title: '创意策略生成', desc: '一键产出完整方案' },
    { gradient: 'from-emerald-500 via-emerald-400 to-teal-300', title: '可视化报告', desc: '多维度图表展示' },
    { gradient: 'from-orange-400 via-orange-300 to-amber-200', title: '团队协作', desc: '高效协同项目推进' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 4000);
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200">
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
          className={`fixed top-14 left-0 right-0 z-30 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 flex items-center justify-between shadow-lg transition-all duration-300 ${
            showAppBanner ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
          style={{ display: 'block' }}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
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
              className="px-4 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-full hover:bg-blue-50 transition-colors"
            >
              获取
            </button>
            <button 
              onClick={() => setShowAppBanner(false)}
              className="p-1.5 hover:bg-blue-400 rounded-full transition-colors"
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
        <div className="px-4 py-6">
          <div className="bg-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">登录</h2>
            <p className="text-sm text-gray-500 mb-5">登录后开启品牌策划之旅</p>

            {/* 登录方式切换 */}
            <div className="flex border-b border-gray-200 mb-5">
              <button
                onClick={() => { setLoginMethod('account'); setShowPhoneGuide(false); }}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                  loginMethod === 'account' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'
                }`}
              >
                账号密码
              </button>
              <button
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                  loginMethod === 'phone' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'
                }`}
              >
                手机验证
              </button>
              {/* 手机版隐藏扫码登录 */}
              <button
                onClick={() => { setLoginMethod('qrcode'); setShowPhoneGuide(false); }}
                className={`hidden md:flex flex-1 pb-3 text-sm font-medium transition-colors items-center justify-center gap-1 ${
                  loginMethod === 'qrcode' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'
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
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="用户名 / 邮箱"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="密码"
                  />
                </div>

                {/* 服务条款 */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="agreeTermsMobile"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="agreeTermsMobile" className="text-xs text-gray-500 leading-relaxed">
                    阅读并接受 <a href="/terms" className="text-blue-600 hover:underline">《服务条款》</a> 和 <a href="/privacy" className="text-blue-600 hover:underline">《隐私政策》</a>
                  </label>
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center py-2 bg-red-50 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleAccountLogin}
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-500 text-white rounded-lg font-medium text-base hover:bg-blue-600 transition-colors disabled:opacity-50 min-h-[48px]"
                >
                  {loading ? '登录中...' : '登 录'}
                </button>

                {/* 忘记密码链接 */}
                <div className="text-left">
                  <a href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-600 hover:underline">
                    忘记密码?
                  </a>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    演示：demo / demo123
                  </p>
                </div>
              </div>
            )}

            {/* 手机登录引导页 */}
            {loginMethod === 'phone' && showPhoneGuide && (
              <div className="py-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full py-3.5 bg-blue-500 text-white rounded-lg font-medium text-base hover:bg-blue-600 transition-colors min-h-[48px]"
                  >
                    立即下载App
                  </button>
                  <button
                    onClick={handleEnterPhoneLogin}
                    className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-base hover:bg-gray-200 transition-colors min-h-[48px]"
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
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="手机号"
                    maxLength={11}
                  />
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                    className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="验证码"
                    maxLength={6}
                  />
                  <button
                    onClick={handleSendCode}
                    disabled={countdown > 0 || loading}
                    className="px-4 py-3.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 min-w-[110px] min-h-[48px]"
                  >
                    {countdown > 0 ? `${countdown}秒` : '获取验证码'}
                  </button>
                </div>

                {/* 服务条款 */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="agreeTermsPhoneMobile"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="agreeTermsPhoneMobile" className="text-xs text-gray-500 leading-relaxed">
                    阅读并接受 <a href="/terms" className="text-blue-600 hover:underline">《服务条款》</a> 和 <a href="/privacy" className="text-blue-600 hover:underline">《隐私政策》</a>
                  </label>
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center py-2 bg-red-50 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePhoneLogin}
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-500 text-white rounded-lg font-medium text-base hover:bg-blue-600 transition-colors disabled:opacity-50 min-h-[48px]"
                >
                  {loading ? '登录中...' : '登 录'}
                </button>

                {/* 忘记密码链接 */}
                <div className="text-left">
                  <a href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-600 hover:underline">
                    忘记密码?
                  </a>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    演示验证码：123456
                  </p>
                </div>
              </div>
            )}

            {/* 扫码登录 */}
            {loginMethod === 'qrcode' && (
              <div className="py-6 text-center">
                <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">注册新账号</a>
              <div className="text-gray-400">
                <a href="/terms" className="hover:text-gray-600">服务条款</a>
                <span className="mx-2">|</span>
                <a href="/privacy" className="hover:text-gray-600">隐私政策</a>
              </div>
            </div>
          </div>

          {/* 演示体验 */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-base hover:bg-gray-200 transition-colors border border-gray-200 min-h-[48px]"
          >
            演示体验
          </button>
        </div>
      </div>

      {/* 桌面端 - 126邮箱风格：全屏背景 + 居中登录卡片 */}
      <div className="hidden lg:flex min-h-screen">
        {/* 全屏背景Banner轮播 */}
        <div className="fixed inset-0 overflow-hidden">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} transition-opacity duration-1000 ${
                index === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* 顶部Logo */}
        <div className="fixed top-0 left-0 right-0 z-20 px-8 py-5">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="AI 创意工作台" className="h-8 w-auto" />
            <span className="text-xl font-semibold text-white">AI 创意工作台</span>
          </div>
        </div>

        {/* 登录卡片居中 */}
        <div className="flex items-center justify-center w-full relative z-10 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* 登录表单内容 */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">账号登录</h2>
                  <p className="text-sm text-gray-500 mt-1">登录后开启品牌策划之旅</p>
                </div>
              </div>

              <div className="flex border-b border-gray-200 mb-5">
                <button
                  onClick={() => { setLoginMethod('account'); setShowPhoneGuide(false); }}
                  className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                    loginMethod === 'account' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  账号密码
                </button>
                <button
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                    loginMethod === 'phone' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  手机验证
                </button>
                <button
                  onClick={() => { setLoginMethod('qrcode'); setShowPhoneGuide(false); }}
                  className={`flex-1 pb-3 text-sm font-medium transition-colors items-center justify-center gap-1 ${
                    loginMethod === 'qrcode' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'
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
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="用户名 / 邮箱"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="密码"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="agreeTerms" className="text-xs text-gray-500 leading-relaxed">
                      阅读并接受 <a href="/terms" className="text-blue-600 hover:underline">《服务条款》</a> 和 <a href="/privacy" className="text-blue-600 hover:underline">《隐私政策》</a>
                    </label>
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm text-center py-2 bg-red-50 rounded-lg">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleAccountLogin}
                    disabled={loading}
                    className="w-full py-3.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? '登录中...' : '登 录'}
                  </button>
                  
                  {/* 忘记密码链接 */}
                  <div className="text-left">
                    <a href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-600 hover:underline">
                      忘记密码?
                    </a>
                  </div>
                  
                  <div className="text-center">
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
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="手机号"
                      maxLength={11}
                    />
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                      className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="验证码"
                      maxLength={6}
                    />
                    <button
                      onClick={handleSendCode}
                      disabled={countdown > 0 || loading}
                      className="px-4 py-3.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap min-w-[120px]"
                    >
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </button>
                  </div>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="agreeTermsPhone"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="agreeTermsPhone" className="text-xs text-gray-500 leading-relaxed">
                      阅读并接受 <a href="/terms" className="text-blue-600 hover:underline">《服务条款》</a> 和 <a href="/privacy" className="text-blue-600 hover:underline">《隐私政策》</a>
                    </label>
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm text-center py-2 bg-red-50 rounded-lg">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handlePhoneLogin}
                    disabled={loading}
                    className="w-full py-3.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? '登录中...' : '登 录'}
                  </button>
                  
                  {/* 忘记密码链接 */}
                  <div className="text-left">
                    <a href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-600 hover:underline">
                      忘记密码?
                    </a>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-400">
                      演示验证码：123456
                    </p>
                  </div>
                </div>
              )}

              {/* 扫码登录 */}
              {loginMethod === 'qrcode' && (
                <div className="py-6 text-center">
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">注册新账号</a>
                <div className="text-gray-400">
                  <a href="/terms" className="hover:text-gray-600">服务条款</a>
                  <span className="mx-2">|</span>
                  <a href="/privacy" className="hover:text-gray-600">隐私政策</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 演示体验按钮 */}
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors border border-white/30"
          >
            演示体验
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeLoginPage;
