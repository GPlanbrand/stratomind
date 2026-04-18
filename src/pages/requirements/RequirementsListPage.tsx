import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Plus, Search, Clock, FileText, Users, AlertCircle,
  ChevronRight, Filter, X
} from 'lucide-react';
import { getRequirements, deleteRequirement } from '../../services/requirements';
import { RequirementDocument } from '../../types/requirement';
import { getCurrentUser, isGuest } from '../../services/auth';
import { User } from '../../types/user';

interface OutletContext {
  onLoginClick: () => void;
  onVisitorLimitReached: () => void;
  user: User | null;
}

const RequirementsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { onLoginClick, onVisitorLimitReached } = useOutletContext<OutletContext>();
  const [requirements, setRequirements] = useState<RequirementDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    loadRequirements();
  }, []);

  const loadRequirements = () => {
    setLoading(true);
    const data = getRequirements();
    // 按更新时间倒序排列
    data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setRequirements(data);
    setLoading(false);
  };

  const handleCreateNew = () => {
    const currentUser = getCurrentUser();
    
    // 检查访客限制
    if (!currentUser) {
      const visitorReqs = requirements.filter(r => !r.createdBy);
      if (visitorReqs.length >= 3) {
        onVisitorLimitReached();
        return;
      }
    }
    
    navigate('/requirements/new');
  };

  const handleCardClick = (id: string) => {
    navigate(`/requirements/${id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这个需求确认单吗？')) {
      deleteRequirement(id);
      loadRequirements();
    }
  };

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = 
      req.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

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

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { color: string }> = {
      high: { color: 'bg-red-100 text-red-700' },
      medium: { color: 'bg-yellow-100 text-yellow-700' },
      low: { color: 'bg-green-100 text-green-700' },
    };
    const c = config[priority] || config.medium;
    return (
      <span className={`px-1.5 py-0.5 rounded text-xs ${c.color}`}>
        {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">需求确认单</h1>
          <p className="text-gray-500 text-sm mt-1">管理客户需求，转化为可执行条目</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建需求单
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索项目名或客户名..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          {/* 状态筛选 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="all">全部状态</option>
              <option value="draft">草稿</option>
              <option value="confirmed">已确认</option>
              <option value="archived">已归档</option>
            </select>
          </div>
        </div>
      </div>

      {/* 访客提示 */}
      {isGuest() && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-purple-800 font-medium">体验模式</p>
            <p className="text-purple-600 text-sm mt-0.5">
              当前为访客模式，最多可创建3个需求单。登录后可解锁更多功能，数据永久保存。
            </p>
          </div>
          <button
            onClick={onLoginClick}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors whitespace-nowrap"
          >
            登录解锁
          </button>
        </div>
      )}

      {/* 加载状态 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredRequirements.length === 0 ? (
        /* 空状态 */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? '未找到匹配的需求单' : '暂无需求确认单'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? '尝试调整搜索条件或筛选器'
              : '创建第一个需求确认单，开始管理客户需求'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建需求单
            </button>
          )}
        </div>
      ) : (
        /* 需求单卡片列表 */
        <div className="grid gap-4">
          {filteredRequirements.map((req) => (
            <div
              key={req.id}
              onClick={() => handleCardClick(req.id)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 项目名和状态 */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {req.projectName}
                    </h3>
                    {getStatusBadge(req.status)}
                  </div>
                  
                  {/* 客户名 */}
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <Users className="w-4 h-4" />
                    <span>{req.clientName}</span>
                  </div>

                  {/* 统计信息 */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <FileText className="w-4 h-4" />
                      <span>{req.items.length} 个条目</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(req.updatedAt)}</span>
                    </div>
                  </div>

                  {/* 优先级预览 */}
                  {req.items.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      {req.items.slice(0, 5).map((item) => (
                        getPriorityBadge(item.priority)
                      ))}
                      {req.items.length > 5 && (
                        <span className="text-gray-400 text-xs">+{req.items.length - 5}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* 操作区域 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(e, req.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="删除"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequirementsListPage;
