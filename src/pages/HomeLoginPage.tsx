import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';

// 飞书风格登录页
const HomeLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'account' | 'phone'>('account');
  const [showWechat, setShowWechat] = useState(false);
  
  // 账号登录
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [accountError, setAccountError] = useState('');
  
  // 手机登录
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleAccountLogin = async () => {
    if (!account) {
      setAccountError('请输入用户名或邮箱');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }
    setAccountError('');
    setError('');
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = login(account, password);
    
    setLoading(false);
    
    if (result.success) {
      navigate('/projects');
    } else {
      setError(result.message);
    }
  };

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[360px]">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <img 
                src="/logo.svg" 
                alt="AI 创意工作台" 
                className="h-9 w-auto" 
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">AI 创意工作台</h1>
            <p className="text-sm text-gray-500 mt-1">专业的品牌策划与创意生成平台</p>
          </div>

          {/* 登录方式切换 - 飞书风格 */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setLoginMethod('account'); setShowWechat(false); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                loginMethod === 'account' && !showWechat
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              账号登录
            </button>
            <button
              onClick={() => { setLoginMethod('phone'); setShowWechat(false); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                loginMethod === 'phone' && !showWechat
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              手机登录
            </button>
          </div>

          {/* 账号登录表单 */}
          {loginMethod === 'account' && !showWechat && (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => { setAccount(e.target.value); setAccountError(''); }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all text-base"
                  placeholder="用户名或邮箱"
                />
                {accountError && (
                  <p className="text-red-500 text-xs mt-1.5">{accountError}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all text-base"
                  placeholder="密码"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center py-2.5 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleAccountLogin}
                disabled={loading}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </div>
          )}

          {/* 手机登录表单 */}
          {loginMethod === 'phone' && !showWechat && (
            <div className="space-y-4">
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all text-base"
                  placeholder="手机号"
                  maxLength={11}
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1.5">{phoneError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all text-base"
                  placeholder="验证码"
                  maxLength={6}
                />
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0 || loading}
                  className="px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap min-w-[100px]"
                >
                  {countdown > 0 ? `${countdown}秒` : '获取验证码'}
                </button>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center py-2.5 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handlePhoneLogin}
                disabled={loading || !codeSent}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </div>
          )}

          {/* 微信扫码区域 */}
          {showWechat && (
            <div className="text-center py-6">
              <div className="w-52 h-52 mx-auto bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-gray-100">
                {loading ? (
                  <div className="text-center">
                    <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500">加载中...</p>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <svg className="w-16 h-16 mx-auto mb-2 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
                    </svg>
                    <p className="text-xs text-gray-500">请使用微信扫码</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowWechat(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                返回账号登录
              </button>
            </div>
          )}

          {/* 其他链接 */}
          {!showWechat && (
            <div className="mt-6 flex items-center justify-between text-sm">
              <a href="/register" className="text-blue-600 hover:text-blue-700">
                注册账号
              </a>
              <a href="/terms" className="text-gray-400 hover:text-gray-600">
                服务条款
              </a>
              <a href="/privacy" className="text-gray-400 hover:text-gray-600">
                隐私政策
              </a>
            </div>
          )}

          {/* 积分说明 */}
          {!showWechat && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                新用户注册即送 <span className="text-gray-700 font-medium">600</span> 积分，每日签到送 <span className="text-gray-700 font-medium">10</span> 积分
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 底部其他登录方式 - 飞书风格 */}
      {!showWechat && (
        <div className="py-6 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3">其他登录方式</p>
          <button
            onClick={() => setShowWechat(true)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
            </svg>
          </button>
        </div>
      )}

      {/* 微信扫码弹窗 */}
      {showWechat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowWechat(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">微信扫码登录</h3>
            <div className="w-52 h-52 mx-auto bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 mb-4">
              <svg className="w-16 h-16 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500 text-center">请使用微信扫描二维码</p>
            <button
              onClick={() => setShowWechat(false)}
              className="w-full mt-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
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
