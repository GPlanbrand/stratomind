import React, { useState, useEffect } from 'react';

const API_BASE = '';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  memberLevel: string;
  points: number;
  signInDays: number;
  inviteCode: string;
  createdAt: string;
  lastLoginAt: string | null;
  memberExpiresAt: string | null;
  _count: {
    projects: number;
    aiLogs: number;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 搜索和筛选
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 编辑模态框
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    points: 0,
    memberLevel: '',
    memberExpiresAt: ''
  });
  const [saving, setSaving] = useState(false);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [debouncedSearch, levelFilter]);

  const fetchUsers = async (page: number = 1) => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(levelFilter && { level: levelFilter })
      });

      const response = await fetch(`${API_BASE}/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || '获取数据失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      points: user.points,
      memberLevel: user.memberLevel,
      memberExpiresAt: user.memberExpiresAt ? user.memberExpiresAt.split('T')[0] : ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    const token = localStorage.getItem('adminToken');
    setSaving(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          points: editForm.points,
          memberLevel: editForm.memberLevel,
          memberExpiresAt: editForm.memberExpiresAt || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 更新本地数据
        setUsers(users.map(u => 
          u.id === editingUser.id 
            ? { ...u, points: editForm.points, memberLevel: editForm.memberLevel, memberExpiresAt: editForm.memberExpiresAt || null }
            : u
        ));
        setEditingUser(null);
      } else {
        alert(data.error || '保存失败');
      }
    } catch (err) {
      alert('网络错误');
    } finally {
      setSaving(false);
    }
  };

  const getLevelBadge = (level: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      normal: { bg: 'bg-gray-100', text: 'text-gray-600', label: '普通' },
      silver: { bg: 'bg-gray-200', text: 'text-gray-700', label: '白银' },
      gold: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '黄金' },
      diamond: { bg: 'bg-purple-100', text: 'text-purple-700', label: '钻石' }
    };
    const badge = badges[level] || badges.normal;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  return (
    <div>
      {/* 搜索和筛选 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索用户名或邮箱..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          {/* 会员等级筛选 */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">全部等级</option>
            <option value="normal">普通</option>
            <option value="silver">白银</option>
            <option value="gold">黄金</option>
            <option value="diamond">钻石</option>
          </select>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">会员等级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">积分</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">项目数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">加载中...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">暂无数据</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getLevelBadge(user.memberLevel)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{user.points}</span>
                      <span className="text-gray-500 text-sm"> 分</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {user._count.projects}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        编辑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              共 {pagination.total} 条记录，第 {pagination.page}/{pagination.totalPages} 页
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 编辑模态框 */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">编辑用户</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">用户名</p>
                <p className="font-medium text-gray-900">{editingUser.username}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">邮箱</p>
                <p className="text-gray-900">{editingUser.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  积分
                </label>
                <input
                  type="number"
                  value={editForm.points}
                  onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会员等级
                </label>
                <select
                  value={editForm.memberLevel}
                  onChange={(e) => setEditForm({ ...editForm, memberLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="normal">普通</option>
                  <option value="silver">白银</option>
                  <option value="gold">黄金</option>
                  <option value="diamond">钻石</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会员到期日期
                </label>
                <input
                  type="date"
                  value={editForm.memberExpiresAt}
                  onChange={(e) => setEditForm({ ...editForm, memberExpiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
