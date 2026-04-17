import React, { useState, useEffect } from 'react';
import { Coins, ArrowUpDown, Plus, Minus, User as UserIcon, X, Download, BarChart3, TrendingUp, Calendar, FileText, RefreshCw } from 'lucide-react';

const API_BASE = '';

interface PointsLog {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balance: number;
  reason: string;
  createdAt: string;
  operatorName?: string;
  user: { username: string; email: string };
}

interface PointsStats {
  totalPoints: number;
  totalConsume: number;
  totalRecharge: number;
  totalAdjust: number;
  todayRecharge: number;
  todayConsume: number;
  topUsers: Array<{ userId: string; username: string; email: string; balance: number }>;
  byDay: Array<{ date: string; recharge: number; consume: number }>;
}

interface User {
  id: string;
  username: string;
  email: string;
  points: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AdminPointsPage: React.FC = () => {
  const [logs, setLogs] = useState<PointsLog[]>([]);
  const [stats, setStats] = useState<PointsStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userBalances, setUserBalances] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ userId: '', amount: 0, reason: '' });
  const [batchForm, setBatchForm] = useState({ userIds: [] as string[], amount: 0, reason: '', operation: 'add' as 'add' | 'set' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'balances' | 'stats'>('logs');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'balances') fetchUserBalances();
  }, [typeFilter, dateRange, activeTab, debouncedSearch]);

  const fetchLogs = async (page = 1) => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (typeFilter) params.append('type', typeFilter);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      if (debouncedSearch) params.append('search', debouncedSearch);
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

  const fetchStats = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/points/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/users?limit=500`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setUsers(data.data.users);
    } catch (err) { console.error(err); }
  };

  const fetchUserBalances = async () => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/points/balances?search=${debouncedSearch}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setUserBalances(data.data.users);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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
        fetchStats();
        fetchUserBalances();
      } else {
        alert(data.error || '调整失败');
      }
    } catch (err) { alert('网络错误'); }
    finally { setSaving(false); }
  };

  const handleBatchAdjust = async () => {
    if (batchForm.userIds.length === 0 || !batchForm.reason) {
      alert('请选择用户并填写原因');
      return;
    }
    const token = localStorage.getItem('adminToken');
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/points/batch-adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(batchForm)
      });
      const data = await response.json();
      if (data.success) {
        alert(`成功处理 ${batchForm.userIds.length} 位用户`);
        setShowBatchModal(false);
        setBatchForm({ userIds: [], amount: 0, reason: '', operation: 'add' });
        fetchLogs();
        fetchStats();
        fetchUserBalances();
      } else {
        alert(data.error || '批量操作失败');
      }
    } catch (err) { alert('网络错误'); }
    finally { setSaving(false); }
  };

  const handleExportLogs = async () => {
    setExportLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const params = new URLSearchParams({ limit: '5000' });
      if (typeFilter) params.append('type', typeFilter);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const response = await fetch(`${API_BASE}/api/admin/points/logs/export?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const csv = [
          ['用户名', '邮箱', '类型', '变动', '余额', '原因', '时间'].join(','),
          ...data.data.logs.map((log: PointsLog) => [
            log.user.username, log.user.email,
            log.type === 'gain' ? '获得' : log.type === 'consume' ? '消耗' :
            log.type === 'recharge' ? '充值' : '调整',
            log.amount >= 0 ? `+${log.amount}` : log.amount,
            log.balance, log.reason, new Date(log.createdAt).toLocaleString('zh-CN')
          ].join(','))
        ].join('\n');
        
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `积分流水_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) { alert('导出失败'); }
    finally { setExportLoading(false); }
  };

  const handleExportBalances = async () => {
    setExportLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/points/balances/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const csv = [
          ['用户名', '邮箱', '积分余额', '累计充值'].join(','),
          ...data.data.users.map((u: User & { totalRecharge?: number }) => [
            u.username, u.email, u.points, u.totalRecharge || 0
          ].join(','))
        ].join('\n');
        
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `用户积分余额_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) { alert('导出失败'); }
    finally { setExportLoading(false); }
  };

  const toggleUserSelection = (userId: string) => {
    setBatchForm(prev => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter(id => id !== userId)
        : [...prev.userIds, userId]
    }));
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
      {/* 标签页切换 */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'logs', label: '积分流水', icon: ArrowUpDown },
          { key: 'balances', label: '用户余额', icon: Coins },
          { key: 'stats', label: '数据统计', icon: BarChart3 }
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors
              ${activeTab === tab.key ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'logs' && (
        <>
          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowAdjustModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Plus className="w-4 h-4" />手动调整
            </button>
            <button onClick={() => setShowBatchModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <RefreshCw className="w-4 h-4" />批量操作
            </button>
            <button onClick={handleExportLogs} disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              <Download className="w-4 h-4" />{exportLoading ? '导出中...' : '导出流水'}
            </button>
          </div>

          {/* 筛选 */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex flex-wrap gap-4 items-center">
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); fetchLogs(1); }}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">全部类型</option>
                <option value="gain">获得</option>
                <option value="consume">消耗</option>
                <option value="recharge">充值</option>
                <option value="adjust">调整</option>
              </select>
              <input type="text" placeholder="搜索用户名..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input type="date" value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <span className="text-gray-400">至</span>
              <input type="date" value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
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
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">上一页</button>
                <span className="px-3 py-1 text-sm">{pagination.page} / {pagination.totalPages}</span>
                <button onClick={() => fetchLogs(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">下一页</button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'balances' && (
        <>
          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3">
            <input type="text" placeholder="搜索用户名..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <button onClick={handleExportBalances} disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              <Download className="w-4 h-4" />{exportLoading ? '导出中...' : '导出余额'}
            </button>
          </div>

          {/* 用户余额列表 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">积分余额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">加载中...</td></tr>
                ) : userBalances.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
                ) : userBalances.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-purple-600 text-lg">{user.points}</span>
                      <span className="text-gray-500 text-sm ml-1">分</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => {
                        setAdjustForm({ userId: user.id, amount: 0, reason: '' });
                        setShowAdjustModal(true);
                      }} className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                        调整积分
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* 概览统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">平台总积分</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalPoints}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">累计充值</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalRecharge}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">累计消耗</p>
                  <p className="text-xl font-bold text-red-600">{stats.totalConsume}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">手动调整</p>
                  <p className="text-xl font-bold text-blue-600">{stats.totalAdjust}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">今日充值</p>
                  <p className="text-xl font-bold text-green-600">{stats.todayRecharge}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">今日消耗</p>
                  <p className="text-xl font-bold text-orange-600">{stats.todayConsume}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top用户 */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-purple-600" />积分余额 Top 10
            </h3>
            <div className="space-y-3">
              {stats.topUsers.slice(0, 10).map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-200 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-purple-600">{user.balance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 每日趋势 */}
          {stats.byDay && stats.byDay.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />每日趋势
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                      <th className="pb-2">日期</th>
                      <th className="pb-2">充值</th>
                      <th className="pb-2">消耗</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.byDay.slice(-14).reverse().map(day => (
                      <tr key={day.date}>
                        <td className="py-2 text-sm text-gray-900">{day.date}</td>
                        <td className="py-2 text-sm text-green-600">+{day.recharge}</td>
                        <td className="py-2 text-sm text-red-600">-{day.consume}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

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
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={adjustForm.amount}
                    onChange={(e) => setAdjustForm({...adjustForm, amount: parseInt(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-center"
                  />
                  <button onClick={() => setAdjustForm({...adjustForm, amount: adjustForm.amount + 100})}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
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

      {/* 批量操作弹窗 */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">批量操作</h3>
              <button onClick={() => setShowBatchModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">操作类型</label>
                <select
                  value={batchForm.operation}
                  onChange={(e) => setBatchForm({...batchForm, operation: e.target.value as 'add' | 'set'})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="add">增加积分</option>
                  <option value="set">设置积分为</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {batchForm.operation === 'add' ? '增加数量' : '设置数量'}
                </label>
                <input
                  type="number"
                  value={batchForm.amount}
                  onChange={(e) => setBatchForm({...batchForm, amount: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择用户</label>
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                  {users.map(u => (
                    <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={batchForm.userIds.includes(u.id)}
                        onChange={() => toggleUserSelection(u.id)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{u.username} ({u.points}分)</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">已选择 {batchForm.userIds.length} 位用户</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">操作原因</label>
                <textarea
                  value={batchForm.reason}
                  onChange={(e) => setBatchForm({...batchForm, reason: e.target.value})}
                  placeholder="请输入操作原因..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBatchModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                取消
              </button>
              <button onClick={handleBatchAdjust} disabled={saving}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? '处理中...' : '确认操作'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPointsPage;
