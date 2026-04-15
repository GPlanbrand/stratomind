import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';

const HomeLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loginMethod, setLoginMethod] = useState<'account' | 'phone'>('account');
  
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const banners = [
    { gradient: 'from-blue-600 via-blue-500 to-cyan-400', title: '智能品牌分析', desc: '深度洞察市场与竞品' },
    { gradient: 'from-purple-600 via-purple-500 to-pink-400', title: '创意策略生成', desc: '一键产出完整方案' },
    { gradient: 'from-emerald-600 via-emerald-500 to-teal-400', title: '可视化报告', desc: '多维度图表展示' },
    { gradient: 'from-orange-500 via-orange-400 to-amber-300', title: '团队协作', desc: '高效协同项目推进' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 4000);
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
    <div className="min-h-screen bg-gray-100">
      {/* 背景Banner轮播 */}
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
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl xl:text-5xl font-bold mb-4">{banner.title}</h1>
                <p className="text-xl opacity-90">{banner.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 轮播指示器 */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentBanner ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* 顶部Logo */}
      <div className="fixed top-0 left-0 right-0 z-20 px-6 py-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="AI 创意工作台" className="h-8 w-auto" />
          <span className="text-lg font-semibold text-white">AI 创意工作台</span>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="fixed inset-0 flex z-10">
        {/* 左侧品牌宣传区域 */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-md">
            <div className="flex items-center gap-4 mb-8">
              <img src="/logo.svg" alt="AI 创意工作台" className="h-16 w-auto" />
              <span className="text-3xl font-bold text-white">AI 创意工作台</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              让品牌策划<br/>更智能、更高效
            </h2>
            <p className="text-lg text-white/80 mb-10">
              一站式品牌创意工作平台，助力企业快速构建品牌策略
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">智能竞品分析</h3>
                  <p className="text-sm text-white/70">多维度数据洞察市场格局</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">创意策略生成</h3>
                  <p className="text-sm text-white/70">AI驱动的品牌策略方案</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">可视化报告</h3>
                  <p className="text-sm text-white/70">专业图表呈现分析结果</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">团队协作</h3>
                  <p className="text-sm text-white/70">高效协同推进品牌项目</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧登录区域 */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white/95 backdrop-blur-sm">
          <div className="w-full max-w-md">
            {/* 移动端Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <img src="/logo.svg" alt="AI 创意工作台" className="h-8 w-auto" />
              <span className="text-lg font-semibold text-gray-900">AI 创意工作台</span>
            </div>
            
            {/* 126邮箱风格登录框 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
              {/* 右上角微信扫码区域 */}
              <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-green-600">
                  {/* 斜角装饰 */}
                  <div className="absolute top-0 right-0 w-8 h-8 bg-white transform translate-x-4 -translate-y-4 rotate-45"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-white/20 to-white/5"></div>
                </div>
              </div>
              
              <div className="p-6">
                {/* 登录框标题 */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">账号登录</h2>
                    <p className="text-sm text-gray-500 mt-1">登录后开启品牌策划之旅</p>
                  </div>
                  {/* 微信扫码图标 */}
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:from-green-600 hover:to-green-700 transition-colors shadow-lg">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
                    </svg>
                    <span className="text-[10px] text-white mt-0.5 font-medium">扫码登录</span>
                  </div>
                </div>

                {/* 登录方式切换 */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => { setLoginMethod('account'); setError(''); }}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                      loginMethod === 'account'
                        ? 'text-gray-900 border-b-2 border-gray-900' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    账号密码
                  </button>
                  <button
                    onClick={() => { setLoginMethod('phone'); setError(''); }}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                      loginMethod === 'phone'
                        ? 'text-gray-900 border-b-2 border-gray-900' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    手机验证
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
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        placeholder="用户名 / 邮箱"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        placeholder="密码"
                        onKeyDown={(e) => e.key === 'Enter' && handleAccountLogin()}
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
                      className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? '登录中...' : '登 录'}
                    </button>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">
                        演示：<span className="font-mono">demo</span> / <span className="font-mono">demo123</span>
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
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        placeholder="手机号"
                        maxLength={11}
                      />
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        placeholder="验证码"
                        maxLength={6}
                      />
                      <button
                        onClick={handleSendCode}
                        disabled={countdown > 0 || loading}
                        className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
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
                      className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? '登录中...' : '登 录'}
                    </button>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">
                        演示验证码：<span className="font-mono">123456</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* 底部链接 */}
                <div className="mt-6 flex items-center justify-between text-xs border-t border-gray-100 pt-4">
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
        </div>
      </div>

      {/* 演示体验 */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors border border-white/30"
        >
          演示体验
        </button>
      </div>
    </div>
  );
};

export default HomeLoginPage;
