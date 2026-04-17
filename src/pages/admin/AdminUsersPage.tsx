import React, { useState, useEffect } from 'react';
import { MapPin, Edit2, X, Search, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

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
    const badges: Record<string, { border: string; text: string; label: string }> = {
      normal: { border: 'border-[#e5e7eb]', text: 'text-[#6b7280]', label: '普通' },
      silver: { border: 'border-[#d1d5db]', text: 'text-[#374151]', label: '白银' },
      gold: { border: 'border-[#fcd34d]', text: 'text-[#b45309]', label: '黄金' },
      diamond: { border: 'border-[#c4b5fd]', text: 'text-[#7c3aed]', label: '钻石' }
    };
    const badge = badges[level] || badges.normal;
    return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${badge.border} ${badge.text} bg-white`}>{badge.label}</span>;
  };

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 - 极简设计 */}
      <div className="bg-white rounded-xl p-4 border border-[#e5e7eb]">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input type="text" placeholder="搜索用户名或邮箱..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors" />
          </div>
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#374151] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors cursor-pointer">
            <option value="">全部等级</option>
            <option value="normal">普通</option>
            <option value="silver">白银</option>
            <option value="gold">黄金</option>
            <option value="diamond">钻石</option>
          </select>
        </div>
      </div>

      {/* 用户列表 - 简洁边框、斑马纹 */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wide">用户</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wide">地区</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wide">会员等级</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wide">积分余额</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wide">累计充值</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wide">项目数</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wide">注册时间</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#6b7280] uppercase tracking-wide">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[#6b7280]">加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#9ca3af]">暂无数据</td>
                </tr>
              ) : users.map((user, index) => (
                <tr key={user.id} className={`hover:bg-[#faf5ff]/30 transition-colors ${index % 2 === 1 ? 'bg-[#fafafb]' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#faf5ff] flex items-center justify-center text-[#7c3aed] font-medium text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[#111827] text-sm">{user.username}</p>
                        <p className="text-xs text-[#9ca3af]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-[#6b7280]">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.province || user.city ? `${user.province || ''}${user.city || ''}` : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">{getLevelBadge(user.memberLevel)}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#7c3aed]">{user.points}</span>
                    <span className="text-[#9ca3af] text-xs ml-0.5">分</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[#111827]">¥{(user.totalRecharge || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-[#6b7280] text-sm">{user._count.projects}</td>
                  <td className="px-4 py-3 text-[#6b7280] text-sm">{new Date(user.createdAt).toLocaleDateString('zh-CN')}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleEditUser(user)} 
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-[#7c3aed] hover:bg-[#faf5ff] rounded-md transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>编辑</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页器 - 底部居中 */}
        <div className="px-4 py-3 border-t border-[#e5e7eb] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-[#6b7280]">共 {pagination.total} 条记录</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => fetchUsers(pagination.page - 1)} 
              disabled={pagination.page <= 1}
              className="inline-flex items-center justify-center w-8 h-8 border border-[#e5e7eb] rounded-md text-sm text-[#6b7280] disabled:opacity-40 hover:bg-[#f9fafb] disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let page = i + 1;
                if (pagination.totalPages > 5) {
                  if (pagination.page > 3) {
                    page = pagination.page - 2 + i;
                  }
                  if (pagination.page > pagination.totalPages - 2) {
                    page = pagination.totalPages - 4 + i;
                  }
                }
                return (
                  <button
                    key={page}
                    onClick={() => fetchUsers(page)}
                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                      pagination.page === page
                        ? 'bg-[#7c3aed] text-white'
                        : 'text-[#6b7280] hover:bg-[#f9fafb]'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => fetchUsers(pagination.page + 1)} 
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex items-center justify-center w-8 h-8 border border-[#e5e7eb] rounded-md text-sm text-[#6b7280] disabled:opacity-40 hover:bg-[#f9fafb] disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 编辑模态框 - 极简设计 */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-[#111827]">编辑用户</h3>
              <button 
                onClick={() => setEditingUser(null)} 
                className="p-1 text-[#9ca3af] hover:text-[#6b7280] hover:bg-[#f9fafb] rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {/* 用户信息展示 */}
              <div className="bg-[#f9fafb] rounded-lg p-3">
                <p className="text-xs text-[#6b7280] mb-1">用户名</p>
                <p className="font-medium text-[#111827]">{editingUser.username}</p>
              </div>

              {/* 积分 */}
              <div>
                <label className="block text-xs font-medium text-[#6b7280] mb-1.5">积分余额</label>
                <input
                  type="number"
                  value={editForm.points}
                  onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
                />
              </div>

              {/* 会员等级 */}
              <div>
                <label className="block text-xs font-medium text-[#6b7280] mb-1.5">会员等级</label>
                <select
                  value={editForm.memberLevel}
                  onChange={(e) => setEditForm({ ...editForm, memberLevel: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors cursor-pointer"
                >
                  <option value="normal">普通</option>
                  <option value="silver">白银</option>
                  <option value="gold">黄金</option>
                  <option value="diamond">钻石</option>
                </select>
              </div>

              {/* 会员到期时间 */}
              <div>
                <label className="block text-xs font-medium text-[#6b7280] mb-1.5">会员到期时间</label>
                <input
                  type="date"
                  value={editForm.memberExpiresAt}
                  onChange={(e) => setEditForm({ ...editForm, memberExpiresAt: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
                />
              </div>

              {/* 地区 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] mb-1.5">省份</label>
                  <input
                    type="text"
                    value={editForm.province}
                    onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] mb-1.5">城市</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2 border border-[#e5e7eb] rounded-lg text-sm font-medium text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#7c3aed] text-white rounded-lg text-sm font-medium hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
