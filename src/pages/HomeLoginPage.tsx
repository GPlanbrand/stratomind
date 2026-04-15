import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';

// 126邮箱风格登录页
const HomeLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'account' | 'phone'>('account');
  const [showWechat, setShowWechat] = useState(false);
  
  // 账号登录
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  
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

  const handleAccountLogin = async () => {
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

  const handleSendCode = async () => {
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

  const handlePhoneLogin = async () => {
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
    <div className="min-h-screen bg-white">
      {/* 顶部导航栏 */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="AI 创意工作台" className="h-8 w-auto" />
              <span className="text-base font-semibold text-gray-900">AI 创意工作台</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 - 126邮箱风格左右布局 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-0">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
          
          {/* 左侧广告宣传区域 */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center pr-8 xl:pr-16">
            <h1 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-4">
              智能品牌策划<br />让创意更简单
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              AI 驱动的品牌策划与创意生成平台，一站式解决品牌建设难题
            </p>
            
            {/* 功能特点 */}
            <div className="space-y-4">
              {[
                { icon: '🎯', title: '智能品牌分析', desc: '深度洞察市场与竞品，制定差异化策略' },
                { icon: '💡', title: '创意策略生成', desc: '一键产出完整的品牌创意方案' },
                { icon: '📊', title: '可视化报告', desc: '多维度图表展示分析结果' },
                { icon: '👥', title: '团队协作', desc: '高效协同，推进项目进展' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧登录框 */}
          <div className="lg:w-1/2 lg:flex lg:items-center lg:justify-center">
            <div className="w-full max-w-sm">
              
              {/* 登录卡片 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">登录账号</h2>

                {/* 登录方式切换 */}
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    onClick={() => { setLoginMethod('account'); setError(''); }}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                      loginMethod === 'account'
                        ? 'text-gray-900 border-b-2 border-gray-900' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    账号登录
                  </button>
                  <button
                    onClick={() => { setLoginMethod('phone'); setError(''); }}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                      loginMethod === 'phone'
                        ? 'text-gray-900 border-b-2 border-gray-900' 
                        : 'text-gray-400 hover:text-gray-600'
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                        placeholder="用户名或邮箱"
                      />
                    </div>

                    <div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                        placeholder="密码"
                        onKeyDown={(e) => e.key === 'Enter' && handleAccountLogin()}
                      />
                    </div>

                    {error && (
                      <div className="text-red-500 text-sm text-center py-2 bg-red-50 rounded-lg">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleAccountLogin}
                      disabled={loading}
                      className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? '登录中...' : '登录'}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                      演示模式：账号 <span className="font-mono">demo</span> 密码 <span className="font-mono">demo123</span>
                    </p>
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                        placeholder="手机号"
                        maxLength={11}
                      />
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                        placeholder="验证码"
                        maxLength={6}
                      />
                      <button
                        onClick={handleSendCode}
                        disabled={countdown > 0 || loading}
                        className="px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      >
                        {countdown > 0 ? `${countdown}s` : '获取验证码'}
                      </button>
                    </div>

                    {error && (
                      <div className="text-red-500 text-sm text-center py-2 bg-red-50 rounded-lg">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handlePhoneLogin}
                      disabled={loading}
                      className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? '登录中...' : '登录'}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                      演示模式：验证码输入 <span className="font-mono">123456</span>
                    </p>
                  </div>
                )}

                {/* 其他链接 */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <a href="/register" className="text-blue-600 hover:text-blue-700">注册账号</a>
                  <div className="flex gap-3">
                    <a href="/terms" className="text-gray-400 hover:text-gray-600">服务条款</a>
                    <a href="/privacy" className="text-gray-400 hover:text-gray-600">隐私政策</a>
                  </div>
                </div>

                {/* 积分说明 */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 text-center">
                    新用户注册即送 <span className="font-medium">600</span> 积分，每日签到送 <span className="font-medium">10</span> 积分
                  </p>
                </div>

                {/* 演示登录按钮 */}
                <button
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg font-medium hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  🚀 演示体验
                </button>
              </div>

              {/* 底部微信登录 */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowWechat(true)}
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
                  </svg>
                  <span>微信扫码登录</span>
                </button>
              </div>

              {/* 移动端功能介绍 */}
              <div className="lg:hidden mt-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-3 text-sm">核心功能</h3>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>🎯</span>
                    <span>智能品牌分析</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💡</span>
                    <span>创意策略生成</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📊</span>
                    <span>可视化报告</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>团队协作</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 微信扫码弹窗 */}
      {showWechat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowWechat(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">微信扫码登录</h3>
            <div className="w-52 h-52 mx-auto bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 mb-4">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-2 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
                </svg>
                <p className="text-sm text-gray-500">请使用微信扫码</p>
              </div>
            </div>
            <button
              onClick={() => setShowWechat(false)}
              className="w-full py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeLoginPage;
