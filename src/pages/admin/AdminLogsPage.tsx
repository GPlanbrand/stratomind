import React, { useState, useEffect } from 'react';
import { ScrollText, User as UserIcon, Clock, Filter } from 'lucide-react';

const API_BASE = '';

interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId?: string;
  detail?: string;
  ip?: string;
  createdAt: string;
}

const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, targetTypeFilter]);

  const fetchLogs = async (page = 1) => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (actionFilter) params.append('action', actionFilter);
      if (targetTypeFilter) params.append('targetType', targetTypeFilter);
      const response = await fetch(`${API_BASE}/api/admin/logs?${params}`, {
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

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'login': '登录',
      'logout': '退出登录',
      'update_user': '更新用户',
      'adjust_points': '调整积分',
      'create_recharge': '创建充值',
      'delete_file': '删除文件',
      'delete_knowledge': '删除知识库',
      'system_config': '系统配置'
    };
    return labels[action] || action;
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      'login': 'bg-blue-100 text-blue-600',
      'logout': 'bg-gray-100 text-gray-600',
      'update_user': 'bg-yellow-100 text-yellow-600',
      'adjust_points': 'bg-purple-100 text-purple-600',
      'create_recharge': 'bg-green-100 text-green-600',
      'delete_file': 'bg-red-100 text-red-600',
      'delete_knowledge': 'bg-red-100 text-red-600',
      'system_config': 'bg-indigo-100 text-indigo-600'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[action] || 'bg-gray-100 text-gray-600'}`}>
        {getActionLabel(action)}
      </span>
    );
  };

  const getTargetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'user': '用户',
      'project': '项目',
      'points': '积分',
      'recharge': '充值',
      'file': '文件',
      'knowledge': '知识库',
      'system': '系统'
    };
    return labels[type] || type;
  };

  // 统计动作类型
  const actionStats = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(actionStats).slice(0, 4).map(([action, count]) => (
          <div key={action} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{getActionLabel(action)}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
              {getActionBadge(action).props && (
                <div className={`px-2 py-1 rounded ${getActionBadge(action).props.className}`}>
                  {getActionBadge(action).props.children}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">筛选：</span>
        </div>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); fetchLogs(1); }}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">全部操作</option>
          <option value="login">登录</option>
          <option value="logout">退出登录</option>
          <option value="update_user">更新用户</option>
          <option value="adjust_points">调整积分</option>
          <option value="create_recharge">创建充值</option>
          <option value="delete_file">删除文件</option>
          <option value="delete_knowledge">删除知识库</option>
        </select>
        <select
          value={targetTypeFilter}
          onChange={(e) => { setTargetTypeFilter(e.target.value); fetchLogs(1); }}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">全部对象</option>
          <option value="user">用户</option>
          <option value="project">项目</option>
          <option value="points">积分</option>
          <option value="recharge">充值</option>
          <option value="file">文件</option>
          <option value="knowledge">知识库</option>
          <option value="system">系统</option>
        </select>
      </div>

      {/* 日志列表 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">管理员</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">对象类型</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作详情</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP地址</th>
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
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {new Date(log.createdAt).toLocaleString('zh-CN')}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{log.adminName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{getTargetTypeLabel(log.targetType)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600 max-w-xs truncate block" title={log.detail}>
                    {log.detail || '-'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-500 font-mono">{log.ip || '-'}</span>
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

export default AdminLogsPage;
