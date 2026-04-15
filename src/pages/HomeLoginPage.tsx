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
    'from-blue-500 via-blue-400 to-cyan-300',
    'from-purple-500 via-purple-400 to-pink-300',
    'from-emerald-500 via-emerald-400 to-teal-300',
    'from-orange-400 via-orange-300 to-amber-200',
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
    <div className="min-h-screen">
      {/* 网页版：背景Banner（手机版隐藏） */}
      <div className="hidden md:block fixed inset-0">
        {banners.map((gradient, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-opacity duration-1000 ${
              index === currentBanner ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {/* 手机版：白色背景 */}
      <div className="md:hidden min-h-screen bg-gray-50" />

      {/* 顶部Logo - 手机版居中，网页版左上角 */}
      <div className="md:absolute md:top-6 md:left-6 z-20 flex justify-center md:justify-start py-6 px-4">
        <div className="flex items-center gap-2 bg-white md:bg-white/10 md:backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm md:shadow-none">
          <img src="/logo.svg" alt="AI 创意工作台" className="h-7 md:h-8 w-auto" />
          <span className="text-sm md:text-base font-semibold text-gray-900 md:text-white">AI 创意工作台</span>
        </div>
      </div>

      {/* 登录框 - 手机版居中，网页版右侧 */}
      <div className="flex items-center justify-center md:justify-end min-h-screen px-4 py-4 md:py-0 md:pr-12">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-xl md:shadow-2xl overflow-hidden">
          {/* 右上角微信扫码（仅网页版） */}
          <div className="hidden md:block relative">
            <div className="absolute -top-0 -right-0 w-20 h-20 overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-green-500 to-green-600 transform rotate-45 translate-x-14 -translate-y-14"></div>
            </div>
            <div className="absolute top-3 right-3 z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:from-green-600 hover:to-green-700 transition-colors shadow">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
                </svg>
                <span className="text-[9px] text-white font-medium">扫码</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* 登录框标题 */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">账号登录</h2>
              <p className="text-sm text-gray-500 mt-1">登录后开启品牌策划之旅</p>
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
                <input
                  type="text"
                  value={account}
                  onChange={(e) => { setAccount(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                  placeholder="用户名或邮箱"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                  placeholder="密码"
                />
              </div>
            )}

            {/* 手机登录表单 */}
            {loginMethod === 'phone' && (
              <div className="space-y-4">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                  placeholder="手机号"
                  maxLength={11}
                />
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
                    className="px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}秒` : '获取验证码'}
                  </button>
                </div>
                <p className="text-xs text-gray-400">演示模式：验证码输入 123456</p>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="text-red-500 text-sm text-center py-2 bg-red-50 rounded-lg mt-4">
                {error}
              </div>
            )}

            {/* 服务条款 */}
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 text-gray-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">
                阅读并接受 <span className="text-gray-900 cursor-pointer hover:underline">服务条款</span> 和 <span className="text-gray-900 cursor-pointer hover:underline">隐私政策</span>
              </span>
            </div>

            {/* 登录按钮 */}
            <button
              onClick={loginMethod === 'account' ? handleAccountLogin : handlePhoneLogin}
              disabled={loading}
              className="w-full mt-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>

            {/* 演示提示 */}
            <p className="text-xs text-gray-400 text-center mt-3">
              演示：demo / demo123
            </p>

            {/* 底部链接 */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">注册新账号</span>
              <div className="text-sm text-gray-400">
                <span className="cursor-pointer hover:text-gray-600">服务条款</span>
                <span className="mx-1">|</span>
                <span className="cursor-pointer hover:text-gray-600">隐私政策</span>
              </div>
            </div>

            {/* 演示体验按钮 */}
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              🚀 演示体验（无需注册）
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLoginPage;
