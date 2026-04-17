import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, X, CheckCircle, Clock, XCircle } from 'lucide-react';

const API_BASE = '';

interface RechargeRecord {
  id: string;
  userId: string;
  amount: number;
  points: number;
  paymentMethod: string;
  status: string;
  remark?: string;
  createdAt: string;
  completedAt?: string;
  user: { username: string; email: string };
}

interface User {
  id: string;
  username: string;
  email: string;
  points: number;
}

const AdminRechargePage: React.FC = () => {
  const [records, setRecords] = useState<RechargeRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ userId: '', amount: '', points: '', remark: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecords();
    fetchUsers();
  }, [statusFilter]);

  const fetchRecords = async (page = 1) => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (statusFilter) params.append('status', statusFilter);
      const response = await fetch(`${API_BASE}/api/admin/recharges?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRecords(data.data.records);
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

  const handleAdd = async () => {
    if (!addForm.userId || !addForm.amount || !addForm.points) {
      alert('请填写完整信息');
      return;
    }
    const token = localStorage.getItem('adminToken');
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/recharges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          userId: addForm.userId,
          amount: parseFloat(addForm.amount),
          points: parseInt(addForm.points),
          remark: addForm.remark
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('充值成功');
        setShowAddModal(false);
        setAddForm({ userId: '', amount: '', points: '', remark: '' });
        fetchRecords();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (err) { alert('网络错误'); }
    finally { setSaving(false); }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      completed: { bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: Clock },
      failed: { bg: 'bg-red-100', text: 'text-red-600', icon: XCircle },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', icon: XCircle }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <badge.icon className="w-3 h-3" />
        {status === 'completed' ? '已完成' : status === 'pending' ? '处理中' : status === 'failed' ? '失败' : '已取消'}
      </span>
    );
  };

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, string> = {
      alipay: '支付宝',
      wxpay: '微信支付',
      offline: '线下充值'
    };
    return labels[method] || method;
  };

  // 计算总充值金额
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总充值笔数</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总充值金额</p>
              <p className="text-2xl font-bold text-gray-900">¥{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总获得积分</p>
              <p className="text-2xl font-bold text-gray-900">{records.reduce((sum, r) => sum + r.points, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮和筛选 */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">充值记录</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          手动录入充值
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); fetchRecords(1); }}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">全部状态</option>
          <option value="completed">已完成</option>
          <option value="pending">处理中</option>
          <option value="failed">失败</option>
          <option value="cancelled">已取消</option>
        </select>
      </div>

      {/* 充值列表 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">充值金额</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">获得积分</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">支付方式</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">备注</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">加载中...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
            ) : records.map(record => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{record.user.username}</p>
                    <p className="text-xs text-gray-500">{record.user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">¥{record.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-purple-600 font-medium">{record.points}</td>
                <td className="px-4 py-3 text-gray-600">{getPaymentLabel(record.paymentMethod)}</td>
                <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(record.createdAt).toLocaleString('zh-CN')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{record.remark || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分页 */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">共 {pagination.total} 条</span>
          <div className="flex gap-2">
            <button onClick={() => fetchRecords(pagination.page - 1)} disabled={pagination.page <= 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">上一页</button>
            <span className="px-3 py-1 text-sm">{pagination.page} / {pagination.totalPages}</span>
            <button onClick={() => fetchRecords(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">下一页</button>
          </div>
        </div>
      </div>

      {/* 添加充值弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">手动录入充值</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择用户</label>
                <select
                  value={addForm.userId}
                  onChange={(e) => setAddForm({...addForm, userId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="">请选择用户</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">充值金额 (元)</label>
                <input
                  type="number"
                  value={addForm.amount}
                  onChange={(e) => setAddForm({...addForm, amount: e.target.value})}
                  placeholder="请输入金额"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">获得积分</label>
                <input
                  type="number"
                  value={addForm.points}
                  onChange={(e) => setAddForm({...addForm, points: e.target.value})}
                  placeholder="请输入积分数量"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={addForm.remark}
                  onChange={(e) => setAddForm({...addForm, remark: e.target.value})}
                  placeholder="可选：备注信息"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleAdd} disabled={saving}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? '提交中...' : '确认充值'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRechargePage;
