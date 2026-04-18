import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Building2, Landmark, Sparkles, 
  ChevronRight, Check, ArrowRight, X
} from 'lucide-react';
import { RoleType, ROLE_CONFIGS, getAllRoles, getRoleConfig } from '../config/roleConfig';
import { updateUserRole } from '../services/auth';

interface RoleSelectPageProps {
  onComplete?: () => void;
  isModal?: boolean;
}

const RoleSelectPage: React.FC<RoleSelectPageProps> = ({ onComplete, isModal = false }) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [hoveredRole, setHoveredRole] = useState<RoleType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role: RoleType) => {
    setSelectedRole(role);
  };

  const handleConfirm = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      // 保存角色到用户信息
      await updateUserRole(selectedRole);
      
      if (onComplete) {
        onComplete();
      } else {
        navigate('/projects');
      }
    } catch (error) {
      console.error('角色保存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const roles = getAllRoles();

  // 角色图标组件映射
  const roleIcons: Record<RoleType, React.ReactNode> = {
    ad_agency: <Briefcase className="w-12 h-12" />,
    enterprise: <Building2 className="w-12 h-12" />,
    government: <Landmark className="w-12 h-12" />
  };

  // 背景装饰
  const backgroundDecorations = (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );

  const content = (
    <>
      {/* 背景装饰 */}
      {backgroundDecorations}

      {/* 关闭按钮（Modal模式） */}
      {isModal && (
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-20"
        >
          <X className="w-6 h-6 text-white/70" />
        </button>
      )}

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* 标题区 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white/90 text-sm font-medium">选择您的角色模式</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            欢迎使用 灵思AI创意工作台
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            根据您的工作场景，选择最适合的角色模式，我们将为您定制专属的功能界面
          </p>
        </div>

        {/* 角色卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {roles.map((role) => {
            const config = getRoleConfig(role.id);
            const isSelected = selectedRole === role.id;
            const isHovered = hoveredRole === role.id;

            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
                className={`
                  relative p-6 rounded-2xl text-left transition-all duration-300 transform
                  ${isSelected 
                    ? 'bg-white shadow-2xl scale-105 ring-4 ring-yellow-400' 
                    : isHovered 
                      ? 'bg-white/90 shadow-xl scale-102' 
                      : 'bg-white/80 shadow-lg hover:bg-white/90'
                  }
                `}
              >
                {/* 选中标记 */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-gray-900" />
                  </div>
                )}

                {/* 角色图标 */}
                <div className={`
                  w-16 h-16 rounded-xl flex items-center justify-center mb-4
                  ${role.id === 'ad_agency' ? 'bg-purple-100 text-purple-600' : ''}
                  ${role.id === 'enterprise' ? 'bg-blue-100 text-blue-600' : ''}
                  ${role.id === 'government' ? 'bg-red-100 text-red-600' : ''}
                `}>
                  {roleIcons[role.id]}
                </div>

                {/* 角色名称 */}
                <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                  {role.name}
                </h3>

                {/* Slogan */}
                <p className={`text-sm mb-4 ${isSelected ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                  "{role.slogan}"
                </p>

                {/* 功能列表 */}
                <div className="space-y-2">
                  {role.features.slice(0, 3).map((feature) => (
                    <div key={feature.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{feature.icon}</span>
                      <span>{feature.name}</span>
                    </div>
                  ))}
                </div>

                {/* 箭头指示 */}
                <div className={`
                  absolute bottom-6 right-6 transition-transform duration-300
                  ${isHovered || isSelected ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'}
                `}>
                  <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* 确认按钮 */}
        <div className="text-center">
          <button
            onClick={handleConfirm}
            disabled={!selectedRole || loading}
            className={`
              inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg
              transition-all duration-300 transform
              ${selectedRole
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:shadow-lg hover:scale-105'
                : 'bg-white/30 text-white/50 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                <span>正在配置...</span>
              </>
            ) : (
              <>
                <span>{selectedRole ? '进入工作台' : '请先选择角色'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* 跳过提示 */}
          {!isModal && (
            <p className="text-white/50 text-sm mt-4">
              您也可以在个人设置中随时切换角色
            </p>
          )}
        </div>
      </div>
    </>
  );

  // Modal模式 - 全屏遮罩
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800">
        {content}
      </div>
    );
  }

  // 独立页面模式
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 flex items-center justify-center p-4">
      {content}
    </div>
  );
};

export default RoleSelectPage;
