import React, { useState, useEffect } from 'react';
import { Bot, User as UserIcon, Clock, AlertCircle } from 'lucide-react';

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
  user: { username: string; email: string };
}

const AdminAILogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [typeFilter]);

  const fetchLogs = async (page = 1) => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (typeFilter) params.append('type', typeFilter);
      const response = await fetch(`${API_BASE}/api/admin/ai-logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
        setTotalCost(data.data.totalCost);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Bot className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">积分总消耗</p>
              <p className="text-2xl font-bold text-gray-900">{totalCost}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Bot className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">成功率</p>
              <p className="text-2xl font-bold text-gray-900">
                {pagination.total > 0 ? ((logs.filter(l => l.status === 'success').length / logs.length * 100)).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); fetchLogs(1); }}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">全部类型</option>
          <option value="analyze-competitors">竞品分析</option>
          <option value="generate-brief">Brief生成</option>
          <option value="generate-strategy">策略生成</option>
        </select>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">加载中...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
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
    </div>
  );
};

export default AdminAILogsPage;
