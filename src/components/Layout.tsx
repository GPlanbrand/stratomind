import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { refreshCurrentUser } from '../services/auth';
import { User, MEMBER_LEVELS } from '../types/user';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const currentUser = refreshCurrentUser();
    setUser(currentUser);
  }, []);

  const memberInfo = user ? MEMBER_LEVELS[user.memberLevel] : null;

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo - 可点击跳转首页 */}
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/logo.svg" 
                alt="灵思" 
                className="h-6 w-auto sm:h-7" 
              />
              <span className="text-sm sm:text-base font-semibold text-gray-800">灵思AI创意工作台</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-4">
              {user && (
                /* 积分显示 - Vercel风格 */
                <button
                  onClick={() => navigate('/projects/member')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="2" width="12" height="12" rx="3" fill="currentColor"/>
                    <path d="M8 4v8M5.5 6.5l2.5-2.5 2.5 2.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm font-medium">{user.points}</span>
                </button>
              )}

              {user ? (
                /* 用户头像下拉菜单 */
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium text-gray-600">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 text-sm hidden sm:inline">{user.username}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-52 sm:w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-2">
                        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100">
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{user.username}</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                          {memberInfo && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full">
                              {memberInfo.icon} {memberInfo.name}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => { navigate('/projects/member'); setMenuOpen(false); }}
                          className="w-full px-3 sm:px-4 py-2.5 text-left text-sm sm:text-base text-gray-700 hover:bg-gray-50"
                        >
                          会员中心
                        </button>
                        <button
                          onClick={() => { navigate('/projects'); setMenuOpen(false); }}
                          className="w-full px-3 sm:px-4 py-2.5 text-left text-sm sm:text-base text-gray-700 hover:bg-gray-50"
                        >
                          返回首页
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* 登录/注册按钮 */
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link to="/login" className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-gray-900 font-medium">
                    登录
                  </Link>
                  <Link to="/register" className="px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors">
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pb-16">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            © 2024 AI 创意工作台. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
