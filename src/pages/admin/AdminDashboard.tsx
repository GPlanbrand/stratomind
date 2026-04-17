import React, { useState, useEffect } from 'react';

const API_BASE = '';

interface Stats {
  totalUsers: number;
  totalProjects: number;
  todayNewUsers: number;
  activeProjects: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProjects: 0,
    todayNewUsers: 0,
    activeProjects: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || '获取数据失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const statCards = [
    {
      title: '总用户数',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-blue-50 text-blue-600',
      change: '+12%',
      changeType: 'up'
    },
    {
      title: '总项目数',
      value: stats.totalProjects,
      icon: '📁',
      color: 'bg-purple-50 text-purple-600',
      change: '+8%',
      changeType: 'up'
    },
    {
      title: '今日新增',
      value: stats.todayNewUsers,
      icon: '📈',
      color: 'bg-green-50 text-green-600',
      change: '+5',
      changeType: 'up'
    },
    {
      title: '活跃项目',
      value: stats.activeProjects,
      icon: '⚡',
      color: 'bg-orange-50 text-orange-600',
      change: '进行中',
      changeType: 'neutral'
    }
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {card.changeType === 'up' && (
                <span className="text-green-500 text-sm font-medium">↑ {card.change}</span>
              )}
              {card.changeType === 'neutral' && (
                <span className="text-gray-500 text-sm">{card.change}</span>
              )}
              <span className="text-gray-400 text-sm ml-2">较上月</span>
            </div>
          </div>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin?tab=users"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-medium text-gray-900">用户管理</p>
              <p className="text-sm text-gray-500">查看和编辑用户信息</p>
            </div>
          </a>
          <a
            href="/admin?tab=projects"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <span className="text-2xl">📁</span>
            <div>
              <p className="font-medium text-gray-900">项目管理</p>
              <p className="text-sm text-gray-500">查看和管理项目</p>
            </div>
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <span className="text-2xl">🌐</span>
            <div>
              <p className="font-medium text-gray-900">访问前台</p>
              <p className="text-sm text-gray-500">打开网站首页</p>
            </div>
          </a>
        </div>
      </div>

      {/* 系统信息 */}
      <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">系统信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">系统版本</span>
            <span className="text-gray-900 font-medium">v1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">数据库</span>
            <span className="text-green-600 font-medium">已连接</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">最后更新</span>
            <span className="text-gray-900">{new Date().toLocaleString('zh-CN')}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">管理员</span>
            <span className="text-gray-900">{localStorage.getItem('adminUsername')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
