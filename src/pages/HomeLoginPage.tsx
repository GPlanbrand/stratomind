import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';

// 126邮箱风格登录页
const HomeLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'wechat' | 'phone'>('wechat');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleSendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setPhoneError('请输入正确的手机号');
      return;
    }
    setPhoneError('');
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCodeSent(true);
    setCountdown(60);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setLoading(false);
  };

  const handlePhoneLogin = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setPhoneError('请输入正确的手机号');
      return;
    }
    if (!code || code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }
    setError('');
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    const result = login(phone, 'sms');
    
    setLoading(false);
    
    if (result.success) {
      navigate('/projects');
    } else {
      setError(result.message);
    }
  };

  const handleWechatScan = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoginMethod('phone');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* 左侧品牌区域 */}
      <div className="hidden lg:flex lg:w-1/2 bg-white flex-col justify-center px-16 border-r border-gray-100">
        <div className="max-w-md">
          {/* Logo + 名称同行 */}
          <div className="flex items-center gap-3 mb-8">
            <img 
              src="/logo.svg" 
              alt="AI 创意工作台" 
              className="h-10 w-auto" 
            />
            <span className="text-xl font-semibold text-gray-900">AI 创意工作台</span>
          </div>
          
          {/* 品牌标语 */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            AI 创意工作台
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            专业的品牌策划与创意生成平台
          </p>
          
          {/* 功能特点 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">智能品牌分析</h3>
                <p className="text-sm text-gray-500">深度洞察市场与竞品</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">创意策略生成</h3>
                <p className="text-sm text-gray-500">一键产出完整方案</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">团队协作管理</h3>
                <p className="text-sm text-gray-500">高效协同项目推进</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧登录区域 */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          {/* 移动端Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img 
                src="/logo.svg" 
                alt="AI 创意工作台" 
                className="h-10 w-auto" 
              />
              <span className="text-lg font-semibold text-gray-900">AI 创意工作台</span>
            </div>
          </div>

          {/* 登录标题 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">登录账号</h2>
            <p className="text-gray-500 mt-2">登录后享受更多服务</p>
          </div>

          {/* 登录方式切换 */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setLoginMethod('wechat')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                loginMethod === 'wechat' 
                  ? 'text-gray-900 border-b-2 border-gray-900' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              微信扫码
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                loginMethod === 'phone' 
                  ? 'text-gray-900 border-b-2 border-gray-900' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              手机验证
            </button>
          </div>

          {/* 微信扫码登录 */}
          {loginMethod === 'wechat' && (
            <div className="text-center">
              <div className="w-48 h-48 mx-auto bg-gray-50 rounded-xl flex items-center justify-center mb-6 border border-gray-200">
                {loading ? (
                  <div className="text-center">
                    <div className="w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500">正在获取二维码...</p>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <svg className="w-20 h-20 mx-auto mb-3 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247a.433.433 0 00-.04-.179l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.008-.27-.03-.406-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
                    </svg>
                    <p className="text-sm text-gray-500">请使用微信扫码</p>
                  </div>
                )}
              </div>
              
              {!loading && (
                <button
                  onClick={handleWechatScan}
                  className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  模拟微信扫码登录
                </button>
              )}
              
              <p className="text-xs text-gray-400 mt-4">
                登录即表示同意 <span className="text-gray-600 cursor-pointer hover:underline">服务条款</span> 和 <span className="text-gray-600 cursor-pointer hover:underline">隐私政策</span>
              </p>
            </div>
          )}

          {/* 手机验证码登录 */}
          {loginMethod === 'phone' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  手机号
                </label>
                <div className="flex gap-3">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError('');
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="请输入手机号"
                    maxLength={11}
                  />
                  <button
                    onClick={handleSendCode}
                    disabled={countdown > 0 || loading}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  验证码
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="请输入6位验证码"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center py-2 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handlePhoneLogin}
                disabled={loading || !codeSent}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '登录中...' : '登录'}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                登录即表示同意 <span className="text-gray-600 cursor-pointer hover:underline">服务条款</span> 和 <span className="text-gray-600 cursor-pointer hover:underline">隐私政策</span>
              </p>

              {/* 积分说明 */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">新用户福利</span>：注册即送 <span className="text-gray-900 font-semibold">600</span> 积分
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  每日签到可获得 <span className="text-gray-700 font-medium">10</span> 积分
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeLoginPage;
