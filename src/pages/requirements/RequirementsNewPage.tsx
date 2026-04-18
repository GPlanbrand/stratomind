import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Camera,
  AlertCircle, Clock, User
} from 'lucide-react';
import { createRequirement, addRequirementItem, getRequirementById, updateRequirementItem, deleteRequirementItem, checkVisitorLimit } from '../../services/requirements';
import { RequirementItem } from '../../types/requirement';
import { getCurrentUser } from '../../services/auth';
import { User as UserType } from '../../types/user';

interface OutletContext {
  onLoginRequired: () => void;
  onVisitorLimitReached: () => void;
  user: UserType | null;
}

const RequirementsNewPage: React.FC = () => {
  const navigate = useNavigate();
  const { onLoginRequired } = useOutletContext<OutletContext>();
  const user = getCurrentUser();
  
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState<RequirementItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  useEffect(() => {
    // 检查访客限制
    const limit = checkVisitorLimit(user?.id);
    if (!user && !limit.allowed) {
      setShowLimitWarning(true);
    }
  }, [user]);

  const handleAddItem = () => {
    const newItem: RequirementItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      clientStatement: '',
      action: '',
      priority: 'medium',
      assignee: '',
      status: 'pending'
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof RequirementItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    if (!projectName.trim()) {
      alert('请输入项目名称');
      return;
    }
    if (!clientName.trim()) {
      alert('请输入客户名称');
      return;
    }

    setSaving(true);
    
    try {
      // 检查访客限制
      const limit = checkVisitorLimit(user?.id);
      if (!user && !limit.allowed) {
        setShowLimitWarning(true);
        setSaving(false);
        return;
      }

      // 创建需求单
      const requirement = createRequirement({
        projectName: projectName.trim(),
        clientName: clientName.trim(),
        createdBy: user?.id || ''
      });

      // 添加所有条目
      for (const item of items) {
        await addRequirementItem(requirement.id);
      }

      // 更新条目数据
      const savedRequirement = getRequirementById(requirement.id);
      if (savedRequirement) {
        items.forEach((item, index) => {
          if (savedRequirement.items[index]) {
            updateRequirementItem(requirement.id, savedRequirement.items[index].id, item);
          }
        });
      }

      setSavedId(requirement.id);
      
      // 延迟跳转，让用户看到保存成功的提示
      setTimeout(() => {
        navigate(`/requirements/${requirement.id}`);
      }, 500);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 使用浏览器原生打印功能
  const handlePrint = () => {
    window.print();
  };

  const getPriorityOptions = (priority: string) => [
    { value: 'high', label: '高', color: 'text-red-700 bg-red-50 border-red-200' },
    { value: 'medium', label: '中', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    { value: 'low', label: '低', color: 'text-green-700 bg-green-50 border-green-200' },
  ];

  const getStatusOptions = (status: string) => [
    { value: 'pending', label: '待确认', color: 'text-gray-600 bg-gray-50 border-gray-200' },
    { value: 'confirmed', label: '已确认', color: 'text-green-700 bg-green-50 border-green-200' },
  ];

  if (showLimitWarning) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">已达到体验上限</h2>
          <p className="text-gray-500 mb-6">
            访客模式最多可创建3个需求单。登录后可解锁无限创建功能，数据永久保存。
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('/requirements')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              返回列表
            </button>
            <button
              onClick={onLoginRequired}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              登录解锁
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/requirements')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">新建需求确认单</h1>
            <p className="text-gray-500 text-sm mt-0.5">创建新的需求确认单，记录客户需求</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">截图/打印</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div id="requirement-content" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* 基本信息 */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                项目名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="输入项目名称"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                客户名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="输入客户名称"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 需求条目表格 */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">需求条目</h3>
            <button
              onClick={handleAddItem}
              className="flex items-center gap-1.5 px-3 py-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              添加条目
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-3">暂无需求条目</p>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                添加第一个条目
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="py-3 px-2 text-sm font-medium text-gray-600 w-8">#</th>
                    <th className="py-3 px-2 text-sm font-medium text-gray-600 min-w-[200px]">客户原话</th>
                    <th className="py-3 px-2 text-sm font-medium text-gray-600 min-w-[200px]">执行动作</th>
                    <th className="py-3 px-2 text-sm font-medium text-gray-600 w-24">优先级</th>
                    <th className="py-3 px-2 text-sm font-medium text-gray-600 w-32">负责人</th>
                    <th className="py-3 px-2 text-sm font-medium text-gray-600 w-24">状态</th>
                    <th className="py-3 px-2 text-sm font-medium text-gray-600 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-gray-400 text-sm">{index + 1}</td>
                      <td className="py-3 px-2">
                        <textarea
                          value={item.clientStatement}
                          onChange={(e) => handleUpdateItem(item.id, 'clientStatement', e.target.value)}
                          placeholder="客户说的话..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <textarea
                          value={item.action}
                          onChange={(e) => handleUpdateItem(item.id, 'action', e.target.value)}
                          placeholder="需要执行的动作..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <select
                          value={item.priority}
                          onChange={(e) => handleUpdateItem(item.id, 'priority', e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${getPriorityOptions(item.priority).find(o => o.value === item.priority)?.color || ''}`}
                        >
                          {getPriorityOptions(item.priority).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={item.assignee}
                          onChange={(e) => handleUpdateItem(item.id, 'assignee', e.target.value)}
                          placeholder="负责人"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateItem(item.id, 'status', e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${getStatusOptions(item.status).find(o => o.value === item.status)?.color || ''}`}
                        >
                          {getStatusOptions(item.status).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 页脚 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {new Date().toLocaleDateString('zh-CN')}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {user?.username || '访客'}
            </span>
          </div>
          <span>共 {items.length} 个条目</span>
        </div>
      </div>

      {/* 打印样式 */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #requirement-content, #requirement-content * {
            visibility: visible;
          }
          #requirement-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default RequirementsNewPage;
