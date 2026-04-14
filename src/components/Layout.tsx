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
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <img 
                src="/logo.svg" 
                alt="StratoMind" 
                className="h-8 w-auto" 
              />
              <span className="text-gray-900 font-medium whitespace-nowrap">品牌策划工作台</span>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => navigate('/member')}
                >
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-900 font-medium">{user.points}</span>
                </div>
              )}

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
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
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-2">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-gray-900 font-medium">{user.username}</p>
                          <p className="text-gray-500 text-sm">{user.email}</p>
                          {memberInfo && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full">
                              {memberInfo.icon} {memberInfo.name}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => { navigate('/member'); setMenuOpen(false); }}
                          className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50"
                        >
                          会员中心
                        </button>
                        <button
                          onClick={() => navigate('/')}
                          className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50"
                        >
                          返回首页
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium">
                    登录
                  </Link>
                  <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
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

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 StratoMind. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
