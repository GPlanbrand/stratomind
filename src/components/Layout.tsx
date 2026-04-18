import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { refreshCurrentUser, isGuest } from '../services/auth';
import { User } from '../types/user';
import Sidebar from './Sidebar';
import Header from './Header';
import AIDialog from './AIDialog';
import VisitorBanner from './VisitorBanner';
import LoginModal from './LoginModal';
import VisitorLimitModal from './VisitorLimitModal';
import { VISITOR_MAX_REQUIREMENTS } from '../types/requirement';
import { getVisitorRequirementCount } from '../services/requirements';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVisitorLimitModal, setShowVisitorLimitModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // 判断是否是workspace页面（有独立的顶部导航）
  const isWorkspacePage = location.pathname.includes('/workspace');
  // 判断是否为需求确认单页面（需要显示访客提示条）
  const isRequirementsPage = location.pathname.includes('/requirements');

  // 刷新用户状态
  const refreshUser = useCallback(() => {
    const currentUser = refreshCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      setBannerDismissed(true);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

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

  // 暴露给子组件的方法（通过window事件）
  useEffect(() => {
    const handleOpenLogin = () => setShowLoginModal(true);
    const handleOpenVisitorLimit = () => setShowVisitorLimitModal(true);

    window.addEventListener('open-login-modal', handleOpenLogin);
    window.addEventListener('open-visitor-limit-modal', handleOpenVisitorLimit);

    return () => {
      window.removeEventListener('open-login-modal', handleOpenLogin);
      window.removeEventListener('open-visitor-limit-modal', handleOpenVisitorLimit);
    };
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setShowLoginModal(false);
    setBannerDismissed(true);
    // 刷新页面以更新所有依赖用户状态的内容
    window.location.reload();
  };

  const handleVisitorLimitReached = () => {
    setShowVisitorLimitModal(true);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  // 是否显示访客提示条
  const showVisitorBanner = isGuest() && !bannerDismissed && isRequirementsPage;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 访客提示条 */}
      {showVisitorBanner && (
        <VisitorBanner 
          onLoginClick={handleLoginClick}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

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
        className={`min-h-screen transition-all duration-300 ${
          isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-16' : 'ml-60')
        } ${(isMobile || !isWorkspacePage) ? 'pt-14' : ''} ${
          showVisitorBanner ? 'md:pt-[calc(theme(spacing.14)+theme(spacing.10))]' : ''
        }`}
      >
        <div className={isWorkspacePage ? '' : 'p-4 sm:p-6 lg:p-8'}>
          <Outlet context={{
            onLoginClick: handleLoginClick,
            onVisitorLimitReached: handleVisitorLimitReached,
            user
          }} />
        </div>
      </main>

      {/* 浮动文案助手 */}
      <AIDialog />

      {/* 登录弹窗 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 访客限制提示弹窗 */}
      <VisitorLimitModal
        isOpen={showVisitorLimitModal}
        onClose={() => setShowVisitorLimitModal(false)}
        onLoginClick={handleLoginClick}
        currentCount={getVisitorRequirementCount()}
        limit={VISITOR_MAX_REQUIREMENTS}
      />
    </div>
  );
};

export default Layout;
