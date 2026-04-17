import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, X, Crown } from 'lucide-react';

const API_BASE = '';

interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
}

const AdminManagePage: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', email: '', role: 'admin' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/admins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAdmins(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!form.username || !form.password || !form.email) {
      alert('请填写完整信息');
      return;
    }
    const token = localStorage.getItem('adminToken');
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (data.success) {
        alert('管理员创建成功');
        setShowAddModal(false);
        setForm({ username: '', password: '', email: '', role: 'admin' });
        fetchAdmins();
      } else {
        alert(data.error || '创建失败');
      }
    } catch (err) { alert('网络错误'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`确定要删除管理员 "${username}" 吗？`)) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/admins/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAdmins(admins.filter(a => a.id !== id));
      } else {
        alert(data.error || '删除失败');
      }
    } catch (err) { alert('网络错误'); }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'superadmin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          <Crown className="w-3 h-3" /> 超级管理员
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        管理员
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
            <Shield className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">管理员管理</h2>
            <p className="text-sm text-gray-500">管理后台管理员账号</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          添加管理员
        </button>
      </div>

      {/* 管理员列表 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">管理员</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最后登录</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">加载中...</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">暂无管理员</td></tr>
            ) : admins.map(admin => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-medium">
                      {admin.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{admin.username}</p>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{getRoleBadge(admin.role)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(admin.createdAt).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString('zh-CN') : '从未登录'}
                </td>
                <td className="px-6 py-4">
                  {admin.role !== 'superadmin' && (
                    <button
                      onClick={() => handleDelete(admin.id, admin.username)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 添加管理员弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">添加管理员</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({...form, username: e.target.value})}
                  placeholder="请输入用户名"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="请输入邮箱"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  placeholder="请输入密码"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({...form, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="admin">管理员</option>
                  <option value="superadmin">超级管理员</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                取消
              </button>
              <button onClick={handleAdd} disabled={saving}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagePage;
