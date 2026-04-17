import React, { useState, useEffect } from 'react';
import { Bot, User as UserIcon, Clock, AlertCircle, Download, BarChart3, PieChart, TrendingUp, Settings, Shield, Filter, Eye } from 'lucide-react';

const API_BASE = '';

interface AILog {
  id: string;
  userId: string;
  type: string;
  input: string;
  output?: string;
  pointsCost: number;
  status: string;
  createdAt: string;
  duration?: number;
  user: { username: string; email: string };
}

interface AILogStats {
  totalCalls: number;
  successCalls: number;
  failedCalls: number;
  totalCost: number;
  averageCost: number;
  byType: Record<string, { count: number; cost: number; successRate: number }>;
  byDay: Array<{ date: string; count: number; cost: number }>;
  topUsers: Array<{ userId: string; username: string; email: string; count: number; cost: number }>;
}

interface AIConfig {
  id: string;
  type: string;
  name: string;
  pointsCost: number;
  dailyLimit: number;
  enabled: boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AdminAILogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [stats, setStats] = useState<AILogStats | null>(null);
  const [config, setConfig] = useState<AIConfig[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewingLog, setViewingLog] = useState<AILog | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  const [configForm, setConfigForm] = useState({ pointsCost: 0, dailyLimit: 0, enabled: true });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'stats' | 'config'>('logs');
  const [exportLoading, setExportLoading] = useState(false);
  const [debouncedUserFilter, setDebouncedUserFilter] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUserFilter(userFilter), 500);
    return () => clearTimeout(timer);
  }, [userFilter]);

  useEffect(() => {
    fetchLogs();
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'config') fetchConfig();
  }, [typeFilter, statusFilter, dateRange, activeTab, debouncedUserFilter]);

  const fetchLogs = async (page = 1) => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (debouncedUserFilter) params.append('user', debouncedUserFilter);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      const response = await fetch(`${API_BASE}/api/admin/ai-logs?${params}`, {
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
      const response = await fetch(`${API_BASE}/api/admin/ai-logs/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (err) { console.error(err); }
  };

  const fetchConfig = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/ai-logs/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setConfig(data.data.configs || []);
    } catch (err) { console.error(err); }
  };

  const handleSaveConfig = async () => {
    if (!editingConfig) return;
    const token = localStorage.getItem('adminToken');
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/ai-logs/config/${editingConfig.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(configForm)
      });
      const data = await response.json();
      if (data.success) {
        setConfig(config.map(c => c.id === editingConfig.id ? { ...c, ...configForm } : c));
        setShowConfigModal(false);
        setEditingConfig(null);
      } else {
        alert(data.error || '保存失败');
      }
    } catch (err) { alert('网络错误'); }
    finally { setSaving(false); }
  };

  const handleExportLogs = async () => {
    setExportLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const params = new URLSearchParams({ limit: '1000' });
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const response = await fetch(`${API_BASE}/api/admin/ai-logs/export?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const csv = [
          ['用户', '邮箱', '调用类型', '消耗积分', '状态', '时间'].join(','),
          ...data.data.logs.map((log: AILog) => [
            log.user.username, log.user.email, getTypeLabel(log.type),
            log.pointsCost, log.status === 'success' ? '成功' : '失败',
            new Date(log.createdAt).toLocaleString('zh-CN')
          ].join(','))
        ].join('\n');
        
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AI调用记录_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) { alert('导出失败'); }
    finally { setExportLoading(false); }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'analyze-competitors': '竞品分析',
      'generate-brief': 'Brief生成',
      'generate-strategy': '策略生成'
    };
    return labels[type] || type;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'analyze-competitors': 'bg-blue-100 text-blue-600',
      'generate-brief': 'bg-purple-100 text-purple-600',
      'generate-strategy': 'bg-green-100 text-green-600'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-600'}`}>
        {getTypeLabel(type)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 标签页切换 */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'logs', label: '调用记录', icon: Clock },
          { key: 'stats', label: '使用统计', icon: BarChart3 },
          { key: 'config', label: '配置管理', icon: Settings }
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
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">AI调用总次数</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">积分总消耗</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalCost || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">成功率</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats ? ((stats.successCalls / stats.totalCalls * 100) || 0).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">平均消耗</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats ? (stats.averageCost || 0).toFixed(1) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 操作栏 */}
          <div className="flex flex-wrap gap-3">
            <button onClick={handleExportLogs} disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              <Download className="w-4 h-4" />{exportLoading ? '导出中...' : '导出数据'}
            </button>
          </div>

          {/* 筛选 */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex flex-wrap gap-4">
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); fetchLogs(1); }}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">全部类型</option>
                <option value="analyze-competitors">竞品分析</option>
                <option value="generate-brief">Brief生成</option>
                <option value="generate-strategy">策略生成</option>
              </select>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); fetchLogs(1); }}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">全部状态</option>
                <option value="success">成功</option>
                <option value="failed">失败</option>
              </select>
              <input type="text" placeholder="搜索用户名..." value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input type="date" value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <span className="text-gray-400 self-center">至</span>
              <input type="date" value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          {/* AI日志列表 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">调用类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">消耗积分</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
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
                      <span className="text-red-600 font-medium">-{log.pointsCost}</span>
                    </td>
                    <td className="px-4 py-3">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                          <Clock className="w-3.5 h-3.5" /> 成功
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                          <AlertCircle className="w-3.5 h-3.5" /> 失败
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setViewingLog(log)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />查看
                      </button>
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

      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* 概览统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <p className="text-purple-100">总调用次数</p>
              <p className="text-3xl font-bold mt-2">{stats.totalCalls}</p>
              <p className="text-purple-200 text-sm mt-2">成功 {stats.successCalls} / 失败 {stats.failedCalls}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
              <p className="text-red-100">积分总消耗</p>
              <p className="text-3xl font-bold mt-2">{stats.totalCost}</p>
              <p className="text-red-200 text-sm mt-2">平均 {stats.averageCost.toFixed(1)}/次</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <p className="text-green-100">成功率</p>
              <p className="text-3xl font-bold mt-2">
                {stats.totalCalls > 0 ? ((stats.successCalls / stats.totalCalls * 100)).toFixed(1) : 0}%
              </p>
              <p className="text-green-200 text-sm mt-2">共 {stats.totalCalls} 次调用</p>
            </div>
          </div>

          {/* 按类型统计 */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />按类型统计
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats.byType || {}).map(([type, data]) => (
                <div key={type} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    {getTypeBadge(type)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">调用次数</span>
                      <span className="font-medium text-gray-900">{data.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">积分消耗</span>
                      <span className="font-medium text-red-600">{data.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">成功率</span>
                      <span className="font-medium text-green-600">{(data.successRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top用户 */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />Top用户
            </h3>
            <div className="space-y-3">
              {(stats.topUsers || []).slice(0, 10).map((user, index) => (
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
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{user.count} 次</p>
                    <p className="text-xs text-red-600">消耗 {user.cost} 积分</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 每日趋势 */}
          {stats.byDay && stats.byDay.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />每日趋势
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                      <th className="pb-2">日期</th>
                      <th className="pb-2">调用次数</th>
                      <th className="pb-2">积分消耗</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.byDay.slice(-14).reverse().map(day => (
                      <tr key={day.date}>
                        <td className="py-2 text-sm text-gray-900">{day.date}</td>
                        <td className="py-2 text-sm text-gray-900">{day.count}</td>
                        <td className="py-2 text-sm text-red-600">{day.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />AI配置管理
          </h3>
          <div className="space-y-4">
            {config.length === 0 ? (
              <p className="text-center text-gray-500 py-8">暂无配置</p>
            ) : config.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  {getTypeBadge(item.type)}
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      <span>消耗积分: <span className="text-red-600">{item.pointsCost}</span></span>
                      <span>每日限制: <span className="text-purple-600">{item.dailyLimit}</span> 次</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${item.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.enabled ? '已启用' : '已禁用'}
                  </span>
                  <button onClick={() => {
                    setEditingConfig(item);
                    setConfigForm({ pointsCost: item.pointsCost, dailyLimit: item.dailyLimit, enabled: item.enabled });
                    setShowConfigModal(true);
                  }} className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200">
                    编辑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 日志详情弹窗 */}
      {viewingLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">调用详情</h3>
              <button onClick={() => setViewingLog(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">用户</p>
                  <p className="font-medium text-gray-900 mt-1">{viewingLog.user.username}</p>
                  <p className="text-xs text-gray-500">{viewingLog.user.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">调用类型</p>
                  <div className="mt-1">{getTypeBadge(viewingLog.type)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">消耗积分</p>
                  <p className="font-medium text-red-600 text-lg mt-1">-{viewingLog.pointsCost}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">状态</p>
                  <p className={`font-medium mt-1 ${viewingLog.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {viewingLog.status === 'success' ? '成功' : '失败'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-gray-500">调用时间</p>
                  <p className="font-medium text-gray-900 mt-1">{new Date(viewingLog.createdAt).toLocaleString('zh-CN')}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">输入内容</p>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 max-h-40 overflow-y-auto">
                  {viewingLog.input || '-'}
                </div>
              </div>
              {viewingLog.output && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">输出内容</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {viewingLog.output}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 配置编辑弹窗 */}
      {showConfigModal && editingConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">编辑配置</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">AI类型</p>
                <p className="font-medium text-gray-900">{editingConfig.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">消耗积分</label>
                <input type="number" value={configForm.pointsCost}
                  onChange={(e) => setConfigForm({...configForm, pointsCost: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">每日调用限制</label>
                <input type="number" value={configForm.dailyLimit}
                  onChange={(e) => setConfigForm({...configForm, dailyLimit: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <p className="text-xs text-gray-500 mt-1">0表示不限制</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="enabled" checked={configForm.enabled}
                  onChange={(e) => setConfigForm({...configForm, enabled: e.target.checked})}
                  className="rounded border-gray-300" />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">启用此AI功能</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleSaveConfig} disabled={saving}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAILogsPage;
