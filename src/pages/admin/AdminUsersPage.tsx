import React, { useState, useEffect } from 'react';
import { MapPin, Edit2, X } from 'lucide-react';

const API_BASE = '';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  memberLevel: string;
  points: number;
  totalRecharge: number;
  province?: string | null;
  city?: string | null;
  signInDays: number;
  inviteCode: string;
  createdAt: string;
  lastLoginAt: string | null;
  memberExpiresAt: string | null;
  _count: { projects: number; aiLogs: number };
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ points: 0, memberLevel: '', memberExpiresAt: '', province: '', city: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { fetchUsers(pagination.page); }, [debouncedSearch, levelFilter]);

  const fetchUsers = async (page = 1) => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (levelFilter) params.append('level', levelFilter);
      const response = await fetch(`${API_BASE}/api/admin/users?${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } else { setError(data.error || '获取数据失败'); }
    } catch (err) { setError('网络错误'); }
    finally { setLoading(false); }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      points: user.points, memberLevel: user.memberLevel,
      memberExpiresAt: user.memberExpiresAt ? user.memberExpiresAt.split('T')[0] : '',
      province: user.province || '', city: user.city || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    const token = localStorage.getItem('adminToken');
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${editingUser.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ points: editForm.points, memberLevel: editForm.memberLevel, memberExpiresAt: editForm.memberExpiresAt || null, province: editForm.province || null, city: editForm.city || null })
      });
      const data = await response.json();
      if (data.success) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, points: editForm.points, memberLevel: editForm.memberLevel, province: editForm.province || null, city: editForm.city || null } : u));
        setEditingUser(null);
      } else { alert(data.error || '保存失败'); }
    } catch (err) { alert('网络错误'); }
    finally { setSaving(false); }
  };

  const getLevelBadge = (level: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      normal: { bg: 'bg-gray-100', text: 'text-gray-600', label: '普通' },
      silver: { bg: 'bg-gray-200', text: 'text-gray-700', label: '白银' },
      gold: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '黄金' },
      diamond: { bg: 'bg-purple-100', text: 'text-purple-700', label: '钻石' }
    };
    const badge = badges[level] || badges.normal;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  return (
    <div>
      {/* 搜索和筛选 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input type="text" placeholder="搜索用户名或邮箱..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">地区</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">会员等级</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">积分余额</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">累计充值</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">项目数</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">加载中...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.province || user.city ? `${user.province || ''}${user.city || ''}` : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">{getLevelBadge(user.memberLevel)}</td>
                  <td className="px-4 py-3"><span className="font-medium text-purple-600">{user.points}</span><span className="text-gray-500 text-xs"> 分</span></td>
                  <td className="px-4 py-3"><span className="text-gray-900">¥{(user.totalRecharge || 0).toFixed(2)}</span></td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{user._count.projects}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{new Date(user.createdAt).toLocaleDateString('zh-CN')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleEditUser(user)} className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1">
                      <Edit2 className="w-3.5 h-3.5" />编辑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">共 {pagination.total} 条记录</span>
          <div className="flex gap-2">
            <button onClick={() => fetchUsers(pagination.page - 1)} disabled={pagination.page <= 1}
              className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-50">上一页</button>
            <span className="px-3 py-1 text-sm">{pagination.page} / {pagination.totalPages}</span>
            <button onClick={() => fetchUsers(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-50">下一页</button>
          </div>
        </div>
      </div>

      {/* 编辑模态框 */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">编辑用户</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">用户名</p><p className="font-medium text-gray-900">{editingUser.username}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">邮箱</p><p className="font-medium text-gray-900">{editingUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">积分余额</label>
                <input type="number" value={editForm.points} onChange={(e) => setEditForm({...editForm, points: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">会员等级</label>
                <select value={editForm.memberLevel} onChange={(e) => setEditForm({...editForm, memberLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="normal">普通</option><option value="silver">白银</option>
                  <option value="gold">黄金</option><option value="diamond">钻石</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">会员到期时间</label>
                <input type="date" value={editForm.memberExpiresAt} onChange={(e) => setEditForm({...editForm, memberExpiresAt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">省份</label>
                  <input type="text" value={editForm.province} onChange={(e) => setEditForm({...editForm, province: e.target.value})} placeholder="如：山东"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">城市</label>
                  <input type="text" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} placeholder="如：济南"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
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
