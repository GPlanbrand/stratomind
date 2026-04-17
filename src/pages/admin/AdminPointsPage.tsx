import React, { useState, useEffect } from 'react';
import { Coins, ArrowUpDown, Plus, Minus, User as UserIcon, X } from 'lucide-react';

const API_BASE = '';

interface PointsLog {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balance: number;
  reason: string;
  createdAt: string;
  user: { username: string; email: string };
}

interface User {
  id: string;
  username: string;
  email: string;
  points: number;
}

const AdminPointsPage: React.FC = () => {
  const [logs, setLogs] = useState<PointsLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ userId: '', amount: 0, reason: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, [typeFilter]);

  const fetchLogs = async (page = 1) => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (typeFilter) params.append('type', typeFilter);
      const response = await fetch(`${API_BASE}/api/admin/points/logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/users?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setUsers(data.data.users);
    } catch (err) { console.error(err); }
  };

  const handleAdjust = async () => {
    if (!adjustForm.userId || !adjustForm.reason) {
      alert('请选择用户并填写原因');
      return;
    }
    const token = localStorage.getItem('adminToken');
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/points/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(adjustForm)
      });
      const data = await response.json();
      if (data.success) {
        alert('积分调整成功');
        setShowAdjustModal(false);
        setAdjustForm({ userId: '', amount: 0, reason: '' });
        fetchLogs();
      } else {
        alert(data.error || '调整失败');
      }
    } catch (err) { alert('网络错误'); }
    finally { setSaving(false); }
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string; icon: string }> = {
      gain: { bg: 'bg-green-100', text: 'text-green-600', icon: '获得' },
      consume: { bg: 'bg-red-100', text: 'text-red-600', icon: '消耗' },
      recharge: { bg: 'bg-purple-100', text: 'text-purple-600', icon: '充值' },
      adjust: { bg: 'bg-blue-100', text: 'text-blue-600', icon: '调整' }
    };
    const badge = badges[type] || badges.adjust;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">积分流水</h2>
        <button
          onClick={() => setShowAdjustModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          手动调整积分
        </button>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); fetchLogs(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">全部类型</option>
            <option value="gain">获得</option>
            <option value="consume">消耗</option>
            <option value="recharge">充值</option>
            <option value="adjust">调整</option>
          </select>
        </div>
      </div>

      {/* 流水列表 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">变动</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">余额</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">原因</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">加载中...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{log.user.username}</p>
                      <p className="text-xs text-gray-500">{log.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{getTypeBadge(log.type)}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${log.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {log.amount >= 0 ? '+' : ''}{log.amount}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{log.balance}</td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{log.reason}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString('zh-CN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分页 */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">共 {pagination.total} 条</span>
          <div className="flex gap-2">
            <button onClick={() => fetchLogs(pagination.page - 1)} disabled={pagination.page <= 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">
              上一页
            </button>
            <span className="px-3 py-1 text-sm">{pagination.page} / {pagination.totalPages}</span>
            <button onClick={() => fetchLogs(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* 调整积分弹窗 */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">手动调整积分</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择用户</label>
                <select
                  value={adjustForm.userId}
                  onChange={(e) => setAdjustForm({...adjustForm, userId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="">请选择用户</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.email}) - 余额: {u.points}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">调整数量</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setAdjustForm({...adjustForm, amount: adjustForm.amount - 100})}
                    className="p-2 border rounded-lg hover:bg-gray-50">
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={adjustForm.amount}
                    onChange={(e) => setAdjustForm({...adjustForm, amount: parseInt(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-center"
                  />
                  <button onClick={() => setAdjustForm({...adjustForm, amount: adjustForm.amount + 100})}
                    className="p-2 border rounded-lg hover:bg-gray-50">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">正数增加积分，负数减少积分</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">调整原因</label>
                <textarea
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({...adjustForm, reason: e.target.value})}
                  placeholder="请输入调整原因..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdjustModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                取消
              </button>
              <button onClick={handleAdjust} disabled={saving}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? '提交中...' : '确认调整'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPointsPage;
