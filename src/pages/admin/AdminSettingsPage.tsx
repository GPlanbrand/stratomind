import React, { useState } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: '灵思AI创意工作台',
    siteUrl: 'https://lingsi.ai',
    aiModel: 'gpt-4',
    aiApiKey: '',
    pointsPerSignup: 600,
    pointsPerSignin: 10,
    pointsPerInvite: 100,
    aiCostPerAnalysis: 50,
    aiCostPerBrief: 100,
    aiCostPerStrategy: 150,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setMessage('设置已保存');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReset = () => {
    if (confirm('确定要恢复默认设置吗？')) {
      setSettings({
        siteName: '灵思AI创意工作台',
        siteUrl: 'https://lingsi.ai',
        aiModel: 'gpt-4',
        aiApiKey: '',
        pointsPerSignup: 600,
        pointsPerSignin: 10,
        pointsPerInvite: 100,
        aiCostPerAnalysis: 50,
        aiCostPerBrief: 100,
        aiCostPerStrategy: 150,
      });
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">系统设置</h3>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* 基本设置 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b">基本设置</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">网站名称</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">网站地址</label>
                  <input
                    type="text"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI设置 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b">AI设置</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI模型</label>
                  <select
                    value={settings.aiModel}
                    onChange={(e) => setSettings({...settings, aiModel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5">GPT-3.5</option>
                    <option value="claude-3">Claude 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input
                    type="password"
                    value={settings.aiApiKey}
                    onChange={(e) => setSettings({...settings, aiApiKey: e.target.value})}
                    placeholder="请输入API Key"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 积分设置 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b">积分规则</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">注册奖励</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={settings.pointsPerSignup}
                    onChange={(e) => setSettings({...settings, pointsPerSignup: parseInt(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-500">积分</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">每日签到</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={settings.pointsPerSignin}
                    onChange={(e) => setSettings({...settings, pointsPerSignin: parseInt(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-500">积分</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邀请奖励</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={settings.pointsPerInvite}
                    onChange={(e) => setSettings({...settings, pointsPerInvite: parseInt(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-500">积分</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI消耗设置 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b">AI功能积分消耗</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">竞品分析</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={settings.aiCostPerAnalysis}
                    onChange={(e) => setSettings({...settings, aiCostPerAnalysis: parseInt(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-500">积分/次</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brief生成</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={settings.aiCostPerBrief}
                    onChange={(e) => setSettings({...settings, aiCostPerBrief: parseInt(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-500">积分/次</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">策略生成</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={settings.aiCostPerStrategy}
                    onChange={(e) => setSettings({...settings, aiCostPerStrategy: parseInt(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-500">积分/次</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <RefreshCw className="w-4 h-4" />
            恢复默认
          </button>
          <div className="flex items-center gap-4">
            {message && (
              <span className="text-sm text-green-600">{message}</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存设置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
