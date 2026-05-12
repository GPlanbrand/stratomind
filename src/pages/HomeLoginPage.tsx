import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, hasSelectedRole } from '../services/auth';

const HomeLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Banner数据
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
        // 检查用户是否已选择角色
        if (hasSelectedRole()) {
          navigate('/projects');
        } else {
          navigate('/role-select');
        }
      } else {
        setError(result.message);
      }
    }, 500);
  };

  const handleAccountLogin = () => {
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
        // 检查用户是否已选择角色
        if (hasSelectedRole()) {
          navigate('/projects');
        } else {
          navigate('/role-select');
        }
      } else {
        setError(result.message);
      }
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAccountLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧Banner区域 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-300 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            {leftBanners[currentBanner].title}
          </h1>
          <p className="text-xl text-purple-100 mb-8">
            {leftBanners[currentBanner].subtitle}
          </p>
          
          {/* 指示器 */}
          <div className="flex gap-2">
            {leftBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentBanner ? 'w-6 bg-white' : 'bg-purple-300 hover:bg-purple-200'
                }`}
              />
            ))}
          </div>
          
          {/* 功能特点 */}
          <div className="mt-16 grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">数据分析</p>
                <p className="text-purple-200 text-sm">多维度市场洞察</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">创意助手</p>
                <p className="text-purple-200 text-sm">智能生成方案</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">知识管理</p>
                <p className="text-purple-200 text-sm">积累品牌资产</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">团队协作</p>
                <p className="text-purple-200 text-sm">高效协同办公</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧登录区域 */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.svg" alt="灵思" className="h-10 w-10" />
            <span className="text-2xl font-bold text-gray-900">灵思</span>
          </div>

          {/* 标题 */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">欢迎回来</h2>
          <p className="text-gray-500 mb-8">请使用您的账号登录</p>

          {/* 登录表单 */}
          <div className="space-y-5">
            {/* 用户名/邮箱 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                用户名或邮箱
              </label>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="请输入用户名或邮箱"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="请输入密码"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 记住登录状态 */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-600">30天内免登录</span>
              </label>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 登录按钮 */}
            <button
              onClick={handleAccountLogin}
              disabled={loading}
              className="w-full py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '登录中...' : '登录'}
            </button>

            {/* 分隔线 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">或者</span>
              </div>
            </div>

            {/* 演示登录 */}
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              演示登录
            </button>
          </div>

          {/* 注册链接 */}
          <p className="mt-8 text-center text-sm text-gray-500">
            还没有账号？
            <a
              href="/register"
              className="font-medium text-purple-600 hover:text-purple-700"
            >
              立即注册
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeLoginPage;
