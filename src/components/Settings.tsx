import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Type, 
  Palette, 
  ChevronRight, 
  Check,
  Accessibility,
  Smartphone,
  Briefcase,
  Building2,
  Landmark,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { RoleType, getAllRoles, getRoleConfig, ROLE_CONFIGS } from '../config/roleConfig';
import { getUserRole, updateUserRole } from '../services/auth';

// 舒适模式类型
interface ComfortSettings {
  enabled: boolean;
  fontSize: 'normal' | 'large';
  iconLabels: boolean;
  buttonSize: 'normal' | 'large';
}

// 获取存储的设置
const getComfortSettings = (): ComfortSettings => {
  const stored = localStorage.getItem('comfort_settings');
  if (stored) {
    return JSON.parse(stored);
  }
  // 默认启用舒适模式（新用户友好）
  return {
    enabled: true,
    fontSize: 'large',
    iconLabels: true,
    buttonSize: 'large'
  };
};

// 保存设置
const saveComfortSettings = (settings: ComfortSettings) => {
  localStorage.setItem('comfort_settings', JSON.stringify(settings));
};

interface SettingsProps {
  onClose?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<ComfortSettings>(getComfortSettings);
  const [activeSection, setActiveSection] = useState<'comfort' | 'general' | 'role'>('comfort');
  const [userRole, setUserRole] = useState<RoleType | null>(getUserRole());
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // 刷新用户角色
  const refreshUserRole = () => {
    setUserRole(getUserRole());
  };

  useEffect(() => {
    refreshUserRole();
  }, []);

  // 切换角色
  const handleRoleChange = (newRole: RoleType) => {
    const success = updateUserRole(newRole);
    if (success) {
      setUserRole(newRole);
      setShowRoleDropdown(false);
    }
  };

  // 应用舒适模式样式到全局
  useEffect(() => {
    const root = document.documentElement;
    if (settings.enabled) {
      root.classList.add('comfort-mode');
      root.style.setProperty('--base-font-size', settings.fontSize === 'large' ? '18px' : '16px');
      root.style.setProperty('--button-height', settings.buttonSize === 'large' ? '48px' : '40px');
      root.style.setProperty('--icon-gap', settings.iconLabels ? '12px' : '8px');
    } else {
      root.classList.remove('comfort-mode');
      root.style.setProperty('--base-font-size', '16px');
      root.style.setProperty('--button-height', '40px');
      root.style.setProperty('--icon-gap', '8px');
    }
  }, [settings]);

  const updateSetting = <K extends keyof ComfortSettings>(
    key: K, 
    value: ComfortSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveComfortSettings(newSettings);
  };

  const toggleComfortMode = () => {
    updateSetting('enabled', !settings.enabled);
  };

  // 快捷功能卡片数据
  const quickFeatures = [
    {
      id: 'poster',
      icon: '🎨',
      title: '做一张海报',
      description: '输入需求，快速产出创意方案',
      path: '/projects?type=poster',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'campaign',
      icon: '📋',
      title: '做一套活动方案',
      description: '完整的策划文档和执行清单',
      path: '/projects?type=campaign',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'review',
      icon: '🔍',
      title: '审一篇公众号',
      description: '检查合规性和格式规范',
      path: '/projects?type=review',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">个人设置</h1>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-gray-500 text-2xl">×</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 标签切换 */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 border border-gray-100">
          <button
            onClick={() => setActiveSection('comfort')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeSection === 'comfort'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            舒适模式
          </button>
          <button
            onClick={() => setActiveSection('role')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeSection === 'role'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            角色切换
          </button>
          <button
            onClick={() => setActiveSection('general')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeSection === 'general'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            通用设置
          </button>
        </div>

        {activeSection === 'comfort' && (
          <div className="space-y-6">
            {/* 舒适模式总开关 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    settings.enabled 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                      : 'bg-gray-100'
                  }`}>
                    <Accessibility className={`w-7 h-7 ${
                      settings.enabled ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">舒适模式</h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                      更大的字体、更清晰的布局，适合长时间使用
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleComfortMode}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    settings.enabled ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      settings.enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 详细设置 */}
            {settings.enabled && (
              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
                {/* 字号设置 */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Type className="w-5 h-5 text-purple-500" />
                    <h4 className="font-semibold text-gray-900">全局字号</h4>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateSetting('fontSize', 'normal')}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                        settings.fontSize === 'normal'
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-base font-medium">标准</span>
                      <span className="block text-xs text-gray-500 mt-1">16px</span>
                    </button>
                    <button
                      onClick={() => updateSetting('fontSize', 'large')}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                        settings.fontSize === 'large'
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg font-medium">大号</span>
                      <span className="block text-xs text-gray-500 mt-1">18px</span>
                    </button>
                  </div>
                </div>

                {/* 图标标签 */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-purple-500" />
                      <div>
                        <h4 className="font-semibold text-gray-900">图标文字标签</h4>
                        <p className="text-sm text-gray-500">在图标下方显示中文说明</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSetting('iconLabels', !settings.iconLabels)}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        settings.iconLabels ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                          settings.iconLabels ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 按钮大小 */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Smartphone className="w-5 h-5 text-purple-500" />
                    <h4 className="font-semibold text-gray-900">按钮尺寸</h4>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateSetting('buttonSize', 'normal')}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                        settings.buttonSize === 'normal'
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium">标准</span>
                      <span className="block text-xs text-gray-500 mt-1">40px 高度</span>
                    </button>
                    <button
                      onClick={() => updateSetting('buttonSize', 'large')}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                        settings.buttonSize === 'large'
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium">大号</span>
                      <span className="block text-xs text-gray-500 mt-1">48px 高度</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 预览效果 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">效果预览</h4>
              <div 
                className="p-4 bg-gray-50 rounded-xl"
                style={{
                  fontSize: settings.enabled && settings.fontSize === 'large' ? '18px' : '16px'
                }}
              >
                <p className="text-gray-700 mb-2">这是一段示例文本</p>
                <button
                  className={`px-4 bg-purple-600 text-white rounded-lg text-white transition-all ${
                    settings.enabled && settings.buttonSize === 'large' 
                      ? 'h-12' 
                      : 'h-10'
                  }`}
                  style={{
                    fontSize: settings.enabled && settings.fontSize === 'large' ? '18px' : '16px'
                  }}
                >
                  预览按钮
                </button>
              </div>
            </div>

            {/* 快捷入口 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">常用快捷入口</h4>
              <div className="grid gap-3">
                {quickFeatures.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => window.location.href = feature.path}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl shadow-md`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h5 className="font-semibold text-gray-900">{feature.title}</h5>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* 角色切换 */}
        {activeSection === 'role' && (
          <div className="space-y-6">
            {/* 当前角色 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    userRole === 'ad_agency' ? 'bg-purple-100' :
                    userRole === 'enterprise' ? 'bg-blue-100' :
                    userRole === 'government' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {userRole === 'ad_agency' && <Briefcase className="w-7 h-7 text-purple-600" />}
                    {userRole === 'enterprise' && <Building2 className="w-7 h-7 text-blue-600" />}
                    {userRole === 'government' && <Landmark className="w-7 h-7 text-red-600" />}
                    {!userRole && <RefreshCw className="w-7 h-7 text-gray-400" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {userRole ? getRoleConfig(userRole).name : '未选择角色'}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {userRole ? getRoleConfig(userRole).slogan : '点击下方切换您的角色模式'}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <span>切换角色</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showRoleDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
                      {getAllRoles().map((role) => (
                        <button
                          key={role.id}
                          onClick={() => handleRoleChange(role.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            userRole === role.id 
                              ? 'bg-purple-50 text-purple-700' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-2xl">{role.icon}</span>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-900">{role.name}</div>
                            <div className="text-xs text-gray-500">"{role.slogan}"</div>
                          </div>
                          {userRole === role.id && (
                            <Check className="w-5 h-5 text-purple-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 角色功能说明 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">角色功能概览</h4>
              <div className="grid gap-4">
                {getAllRoles().map((role) => (
                  <div 
                    key={role.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      userRole === role.id 
                        ? 'border-purple-200 bg-purple-50' 
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{role.icon}</span>
                      <div>
                        <h5 className="font-semibold text-gray-900">{role.name}</h5>
                        <p className="text-xs text-gray-500">"{role.slogan}"</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.features.slice(0, 4).map((feature) => (
                        <span 
                          key={feature.id}
                          className={`px-2 py-1 rounded text-xs ${
                            userRole === role.id 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {feature.icon} {feature.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'general' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">深色模式</h4>
                  <p className="text-sm text-gray-500">切换深色/浅色主题</p>
                </div>
                <span className="text-gray-400 text-sm">即将推出</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">通知设置</h4>
                  <p className="text-sm text-gray-500">管理消息通知偏好</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">清除缓存</h4>
                  <p className="text-sm text-gray-500">释放存储空间</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
