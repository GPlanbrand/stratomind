import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('请填写所有必填项');
      return;
    }

    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = login(formData.email, formData.password);
    
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="StratoMind" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900">欢迎回来</h1>
          <p className="text-gray-500 mt-2">登录您的 StratoMind 账号</p>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                邮箱
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="请输入邮箱"
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                密码
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="请输入密码"
              />
            </div>

            {/* 忘记密码 */}
            <div className="text-right">
              <span className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
                忘记密码？
              </span>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="text-red-500 text-sm text-center py-2 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          {/* 注册链接 */}
          <div className="mt-6 text-center">
            <span className="text-gray-500 text-sm">没有账号？</span>
            <Link to="/register" className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-1">
              立即注册
            </Link>
          </div>
        </div>

        {/* 登录提示 */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>登录即表示同意 <span className="text-gray-600 cursor-pointer hover:underline">服务条款</span> 和 <span className="text-gray-600 cursor-pointer hover:underline">隐私政策</span></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
