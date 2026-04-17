import React, { useState, useEffect } from 'react';
import { MapPin, Edit2, X, Plus, Download, User, Shield, Activity, FileText, LogOut, ChevronRight, Eye } from 'lucide-react';

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
  status?: string;
  _count: { projects: number; aiLogs: number };
}

interface Project {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  _count?: { briefs: number; strategies: number };
}

interface AILog {
  id: string;
  type: string;
  pointsCost: number;
  status: string;
  createdAt: string;
}

interface LoginRecord {
  id: string;
  ip: string;
  device: string;
  createdAt: string;
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
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userAILogs, setUserAILogs] = useState<AILog[]>([]);
  const [userLoginRecords, setUserLoginRecords] = useState<LoginRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'projects' | 'ai' | 'logins'>('info');
  const [editForm, setEditForm] = useState({ points: 0, memberLevel: '', memberExpiresAt: '', province: '', city: '' });
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', email: '', password: '', memberLevel: 'normal' });
  const [creating, setCreating] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState({ userIds: [] as string[], amount: 0, reason: '' });
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

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

  const fetchUserDetail = async (userId: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      const [projectsRes, aiRes, loginsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users/${userId}/projects`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/users/${userId}/ai-logs?limit=20`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/users/${userId}/logins?limit=10`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const [projectsData, aiData, loginsData] = await Promise.all([
        projectsRes.json(), aiRes.json(), loginsRes.json()
      ]);
      if (projectsData.success) setUserProjects(projectsData.data.projects || []);
      if (aiData.success) setUserAILogs(aiData.data.logs || []);
      if (loginsData.success) setUserLoginRecords(loginsData.data.logins || []);
    } catch (err) { console.error(err); }
  };

  const handleViewUser = async (user: User) => {
    setViewingUser(user);
    setActiveTab('info');
    await fetchUserDetail(user.id);
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
        if (viewingUser?.id === editingUser.id) setViewingUser({ ...viewingUser, points: editForm.points, memberLevel: editForm.memberLevel });
        setEditingUser(null);
      } else { alert(data.error || '保存失败'); }
    } catch (err) { alert('网络错误'); }
    finally { setSaving(false); }
  };

  const handleCreateUser = async () => {
    if (!createForm.username || !createForm.email || !createForm.password) {
      alert('请填写完整信息');
      return;
    }
    const token = localStorage.getItem('adminToken');
    setCreating(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(createForm)
      });
      const data = await response.json();
      if (data.success) {
        alert('用户创建成功');
        setShowCreateModal(false);
        setCreateForm({ username: '', email: '', password: '', memberLevel: 'normal' });
        fetchUsers();
      } else { alert(data.error || '创建失败'); }
    } catch (err) { alert('网络错误'); }
    finally { setCreating(false); }
  };

  const handleForceLogout = async (userId: string) => {
    if (!confirm('确定要强制该用户下线吗？')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/force-logout`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) alert('已强制用户下线');
      else alert(data.error || '操作失败');
    } catch (err) { alert('网络错误'); }
  };

  const handleBatchRecharge = async () => {
    if (selectedUsers.length === 0 || !batchForm.reason) {
      alert('请选择用户并填写原因');
      return;
    }
    const token = localStorage.getItem('adminToken');
    setBatchProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/points/batch-adjust`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userIds: selectedUsers, amount: batchForm.amount, reason: batchForm.reason })
      });
      const data = await response.json();
      if (data.success) {
        alert(`成功为 ${selectedUsers.length} 位用户调整积分`);
        setShowBatchModal(false);
        setBatchForm({ userIds: [], amount: 0, reason: '' });
        setSelectedUsers([]);
        fetchUsers();
      } else { alert(data.error || '批量操作失败'); }
    } catch (err) { alert('网络错误'); }
    finally { setBatchProcessing(false); }
  };

  const handleExportUsers = async () => {
    setExportLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const csv = [
          ['用户名', '邮箱', '会员等级', '积分', '累计充值', '项目数', '注册时间'].join(','),
          ...data.data.users.map((u: User) => [
            u.username, u.email, u.memberLevel, u.points, u.totalRecharge || 0,
            u._count.projects, new Date(u.createdAt).toLocaleDateString('zh-CN')
          ].join(','))
        ].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `用户列表_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) { alert('导出失败'); }
    finally { setExportLoading(false); }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
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

  const getAILabel = (type: string) => {
    const labels: Record<string, string> = {
      'analyze-competitors': '竞品分析', 'generate-brief': 'Brief生成', 'generate-strategy': '策略生成'
    };
    return labels[type] || type;
  };

  return (
    <div>
      {/* 头部操作栏 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Plus className="w-4 h-4" />创建用户
        </button>
        <button onClick={() => setShowBatchModal(true)} disabled={selectedUsers.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          <Shield className="w-4 h-4" />批量充值 ({selectedUsers.length})
        </button>
        <button onClick={handleExportUsers} disabled={exportLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
          <Download className="w-4 h-4" />{exportLoading ? '导出中...' : '导出数据'}
        </button>
      </div>

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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10">
                  <input type="checkbox" checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => setSelectedUsers(e.target.checked ? users.map(u => u.id) : [])}
                    className="rounded border-gray-300" />
                </th>
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
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">加载中...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-gray-300" />
                  </td>
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
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleViewUser(user)} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />详情
                      </button>
                      <button onClick={() => handleEditUser(user)} className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" />编辑
                      </button>
                      <button onClick={() => handleForceLogout(user.id)} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                        <LogOut className="w-3.5 h-3.5" />下线
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">共 {pagination.total} 条记录，已选择 {selectedUsers.length} 项</span>
          <div className="flex gap-2">
            <button onClick={() => fetchUsers(pagination.page - 1)} disabled={pagination.page <= 1}
              className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-50">上一页</button>
            <span className="px-3 py-1 text-sm">{pagination.page} / {pagination.totalPages}</span>
            <button onClick={() => fetchUsers(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-50">下一页</button>
          </div>
        </div>
      </div>

      {/* 用户详情弹窗 */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                  {viewingUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewingUser.username}</h3>
                  <p className="text-sm text-gray-500">{viewingUser.email}</p>
                </div>
              </div>
              <button onClick={() => setViewingUser(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            {/* 标签页 */}
            <div className="flex border-b border-gray-200 px-4">
              {[
                { key: 'info', label: '基本信息', icon: User },
                { key: 'projects', label: '项目列表', icon: FileText },
                { key: 'ai', label: 'AI使用记录', icon: Activity },
                { key: 'logins', label: '登录记录', icon: Shield }
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors
                    ${activeTab === tab.key ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <tab.icon className="w-4 h-4" />{tab.label}
                </button>
              ))}
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'info' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">会员等级</p>
                    <p className="font-medium text-gray-900 mt-1">{getLevelBadge(viewingUser.memberLevel)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">积分余额</p>
                    <p className="font-medium text-purple-600 text-lg mt-1">{viewingUser.points}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">累计充值</p>
                    <p className="font-medium text-gray-900 mt-1">¥{(viewingUser.totalRecharge || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">项目数量</p>
                    <p className="font-medium text-gray-900 mt-1">{viewingUser._count.projects}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">地区</p>
                    <p className="font-medium text-gray-900 mt-1">{viewingUser.province || viewingUser.city ? `${viewingUser.province || ''} ${viewingUser.city || ''}` : '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">注册时间</p>
                    <p className="font-medium text-gray-900 mt-1">{new Date(viewingUser.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">最后登录</p>
                    <p className="font-medium text-gray-900 mt-1">{viewingUser.lastLoginAt ? new Date(viewingUser.lastLoginAt).toLocaleString('zh-CN') : '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">会员到期</p>
                    <p className="font-medium text-gray-900 mt-1">{viewingUser.memberExpiresAt ? new Date(viewingUser.memberExpiresAt).toLocaleDateString('zh-CN') : '永久'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-gray-500">邀请码</p>
                    <p className="font-medium text-gray-900 mt-1">{viewingUser.inviteCode || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-gray-500">AI调用次数</p>
                    <p className="font-medium text-gray-900 mt-1">{viewingUser._count.aiLogs} 次</p>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-3">
                  {userProjects.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">暂无项目</p>
                  ) : userProjects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <p className="text-sm text-gray-500">创建于 {new Date(project.createdAt).toLocaleDateString('zh-CN')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${project.status === 'active' ? 'bg-green-100 text-green-700' :
                            project.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {project.status === 'active' ? '进行中' : project.status === 'completed' ? '已完成' : '已归档'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-3">
                  {userAILogs.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">暂无AI使用记录</p>
                  ) : userAILogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                          ${log.type === 'analyze-competitors' ? 'bg-blue-100 text-blue-600' :
                            log.type === 'generate-brief' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{getAILabel(log.type)}</p>
                          <p className="text-sm text-gray-500">{new Date(log.createdAt).toLocaleString('zh-CN')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">-{log.pointsCost}</p>
                        <p className={`text-xs ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {log.status === 'success' ? '成功' : '失败'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'logins' && (
                <div className="space-y-3">
                  {userLoginRecords.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">暂无登录记录</p>
                  ) : userLoginRecords.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{record.device || '未知设备'}</p>
                          <p className="text-sm text-gray-500">IP: {record.ip || '未知'}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(record.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 编辑用户模态框 */}
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

      {/* 创建用户模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">创建用户</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input type="text" value={createForm.username} onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                  placeholder="请输入用户名" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input type="email" value={createForm.email} onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  placeholder="请输入邮箱" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input type="password" value={createForm.password} onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  placeholder="请输入密码" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">初始会员等级</label>
                <select value={createForm.memberLevel} onChange={(e) => setCreateForm({...createForm, memberLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="normal">普通</option>
                  <option value="silver">白银</option>
                  <option value="gold">黄金</option>
                  <option value="diamond">钻石</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleCreateUser} disabled={creating} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {creating ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量充值模态框 */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">批量充值积分</h3>
              <button onClick={() => setShowBatchModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-700">已选择 {selectedUsers.length} 位用户</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">充值积分数量</label>
                <input type="number" value={batchForm.amount} onChange={(e) => setBatchForm({...batchForm, amount: parseInt(e.target.value) || 0})}
                  placeholder="请输入积分数量" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">充值原因</label>
                <textarea value={batchForm.reason} onChange={(e) => setBatchForm({...batchForm, reason: e.target.value})}
                  placeholder="请输入充值原因" rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBatchModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleBatchRecharge} disabled={batchProcessing} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {batchProcessing ? '处理中...' : '确认充值'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
