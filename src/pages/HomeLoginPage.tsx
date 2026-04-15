import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';

// 126邮箱风格登录页
const HomeLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'account' | 'phone'>('account');
  
  // 账号登录
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // 手机登录
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 演示登录
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
      setCodeSent(true);
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
    
    // 演示模式：验证码123456
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
    <div className="min-h-screen bg-white flex">
      {/* 左侧品牌区域 */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 border-r border-gray-100">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.svg" alt="AI 创意工作台" className="h-10 w-auto" />
          <span className="text-xl font-semibold text-gray-900">AI 创意工作台</span>
        </div>
        
        {/* 品牌标语 */}
        <h1 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-4">
          AI 创意工作台
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          专业的品牌策划与创意生成平台
        </p>
        
        {/* 功能特点 */}
        <div className="space-y-5">
          {[
            { icon: '🎯', title: '智能品牌分析', desc: '深度洞察市场与竞品，制定差异化策略' },
            { icon: '💡', title: '创意策略生成', desc: '一键产出完整的品牌创意方案' },
            { icon: '📊', title: '可视化报告', desc: '多维度图表展示分析结果' },
            { icon: '👥', title: '团队协作', desc: '高效协同，推进项目进展' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧登录区域 */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">
          {/* Logo - 移动端 */}
          <div className="lg:hidden mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src="/logo.svg" alt="AI 创意工作台" className="h-8 w-auto" />
              <span className="text-base font-semibold text-gray-900">AI 创意工作台</span>
            </div>
          </div>

          {/* 登录卡片 - 126邮箱风格 */}
          <div className="bg-white rounded-lg border border-gray-200 relative">
            {/* 右上角微信二维码图标 - 斜片效果 */}
            <div className="absolute -top-1 -right-1 w-12 h-12">
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-br-lg rounded-tl-lg flex items-center justify-center cursor-pointer hover:from-green-600 hover:to-green-700 transition-colors">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
                </svg>
              </div>
            </div>

            {/* 登录标题 */}
            <div className="p-6 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">登录邮箱</h2>
            </div>

            {/* 登录方式切换 */}
            <div className="px-6 flex border-b border-gray-200">
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
              <div className="p-6 space-y-4">
                <div>
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => { setAccount(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                    placeholder="用户名 / 邮箱"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                    placeholder="密码"
                    onKeyDown={(e) => e.key === 'Enter' && handleAccountLogin()}
                  />
                </div>

                {/* 服务条款勾选 */}
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
              <div className="p-6 space-y-4">
                <div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                    placeholder="手机号"
                    maxLength={11}
                  />
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
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

                {/* 服务条款勾选 */}
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
            <div className="px-6 pb-4 flex items-center justify-between text-xs">
              <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">注册新账号</a>
              <div className="text-gray-400">
                <a href="/terms" className="hover:text-gray-600">服务条款</a>
                <span className="mx-2">|</span>
                <a href="/privacy" className="hover:text-gray-600">隐私政策</a>
              </div>
            </div>
          </div>

          {/* 演示体验 */}
          <div className="mt-4 text-center">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              演示体验（无需注册）
            </button>
          </div>

          {/* 积分说明 */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              新用户注册即送 <span className="font-medium text-gray-700">600</span> 积分，每日签到送 <span className="font-medium text-gray-700">10</span> 积分
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLoginPage;
