import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Camera,
  AlertCircle, CheckCircle2, Clock, User, Check, X
} from 'lucide-react';
import { 
  getRequirementById, 
  saveRequirement, 
  addRequirementItem, 
  updateRequirementItem, 
  deleteRequirementItem 
} from '../../services/requirements';
import { RequirementDocument, RequirementItem } from '../../types/requirement';
import { getCurrentUser } from '../../services/auth';
import { User as UserType } from '../../types/user';

interface OutletContext {
  onLoginRequired: () => void;
  onVisitorLimitReached: () => void;
  user: UserType | null;
}

const RequirementsEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { onLoginRequired } = useOutletContext<OutletContext>();
  const user = getCurrentUser();
  
  const [requirement, setRequirement] = useState<RequirementDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (id) {
      loadRequirement();
    }
  }, [id]);

  const loadRequirement = () => {
    setLoading(true);
    const data = getRequirementById(id!);
    if (data) {
      setRequirement(data);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const handleUpdateField = (field: keyof RequirementDocument, value: any) => {
    if (!requirement) return;
    setRequirement({ ...requirement, [field]: value });
    setHasChanges(true);
  };

  const handleAddItem = () => {
    if (!requirement) return;
    
    const newItem: RequirementItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      clientStatement: '',
      action: '',
      priority: 'medium',
      assignee: '',
      status: 'pending'
    };
    
    setRequirement({ ...requirement, items: [...requirement.items, newItem] });
    setHasChanges(true);
  };

  const handleUpdateItem = (itemId: string, field: keyof RequirementItem, value: any) => {
    if (!requirement) return;
    
    setRequirement({
      ...requirement,
      items: requirement.items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    });
    setHasChanges(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!requirement) return;
    
    setRequirement({
      ...requirement,
      items: requirement.items.filter(item => item.id !== itemId)
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!requirement) return;
    
    if (!requirement.projectName.trim()) {
      alert('请输入项目名称');
      return;
    }
    if (!requirement.clientName.trim()) {
      alert('请输入客户名称');
      return;
    }

    setSaving(true);
    
    try {
      saveRequirement({
        ...requirement,
        updatedAt: new Date().toISOString()
      });
      setHasChanges(false);
      
      // 短暂显示保存成功提示
      setTimeout(() => {
        navigate('/requirements');
      }, 300);
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

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: '草稿' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: '已确认' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-500', label: '已归档' },
    };
    const c = config[status] || config.draft;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  // 加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // 未找到
  if (notFound || !requirement) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">需求确认单不存在</h2>
          <p className="text-gray-500 mb-6">
            未找到对应的需求确认单，可能已被删除。
          </p>
          <button
            onClick={() => navigate('/requirements')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            返回列表
          </button>
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">编辑需求确认单</h1>
              {getStatusBadge(requirement.status)}
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              {hasChanges ? '有未保存的更改' : '所有更改已保存'}
            </p>
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
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                保存中...
              </>
            ) : hasChanges ? (
              <>
                <Check className="w-4 h-4" />
                保存更改
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                已保存
              </>
            )}
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
                value={requirement.projectName}
                onChange={(e) => handleUpdateField('projectName', e.target.value)}
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
                value={requirement.clientName}
                onChange={(e) => handleUpdateField('clientName', e.target.value)}
                placeholder="输入客户名称"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* 状态选择 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              文档状态
            </label>
            <div className="flex gap-2">
              {[
                { value: 'draft', label: '草稿', icon: Clock },
                { value: 'confirmed', label: '已确认', icon: CheckCircle2 },
                { value: 'archived', label: '已归档', icon: X },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleUpdateField('status', opt.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    requirement.status === opt.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  {opt.label}
                </button>
              ))}
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

          {requirement.items.length === 0 ? (
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
                  {requirement.items.map((item, index) => (
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
              更新于 {new Date(requirement.updatedAt).toLocaleDateString('zh-CN')}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {user?.username || '访客'}
            </span>
          </div>
          <span>共 {requirement.items.length} 个条目</span>
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

export default RequirementsEditPage;
