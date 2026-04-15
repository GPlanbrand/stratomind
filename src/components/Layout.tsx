import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { refreshCurrentUser } from '../services/auth';
import { User } from '../types/user';
import Sidebar from './Sidebar';
import Header from './Header';
import FloatingAssistant from './FloatingAssistant';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 判断是否是workspace页面（有独立的顶部导航）
  const isWorkspacePage = location.pathname.includes('/workspace');

  useEffect(() => {
    const currentUser = refreshCurrentUser();
    setUser(currentUser);
  }, []);

  // 响应式检测
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // 桌面端默认展开侧边栏
      if (!mobile) {
        setSidebarCollapsed(false);
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 左侧导航栏 - 桌面端 */}
      {!isMobile && (
        <Sidebar 
          user={user} 
          collapsed={sidebarCollapsed} 
          onToggleCollapse={toggleSidebar}
        />
      )}

      {/* 移动端侧边栏（抽屉模式） */}
      {isMobile && sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-screen z-50 animate-slide-in-left">
            <Sidebar 
              user={user} 
              collapsed={false} 
              onToggleCollapse={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* 顶部功能栏 - 手机端始终显示，桌面端workspace页面不显示 */}
      {(isMobile || !isWorkspacePage) && (
        <Header 
          collapsed={isMobile ? true : sidebarCollapsed} 
          isMobile={isMobile}
          onMenuClick={toggleSidebar}
        />
      )}

      {/* 主内容区 */}
      <main 
        className={`h-screen overflow-y-auto transition-all duration-300 ${
          isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-16' : 'ml-60')
        } ${(isMobile || !isWorkspacePage) ? 'pt-14' : ''}`}
      >
        <div className={isWorkspacePage ? '' : 'p-4 sm:p-6 lg:p-8'}>
          <Outlet />
        </div>
      </main>

      {/* 浮动AI助手 */}
      <FloatingAssistant />
    </div>
  );
};

export default Layout;
