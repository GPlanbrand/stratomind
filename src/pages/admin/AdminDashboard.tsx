import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, FolderOpen, UserPlus, Activity, Bot, Clock, Users, Folder } from 'lucide-react';

const API_BASE = '';

interface Stats {
  totalUsers: number;
  totalProjects: number;
  todayNewUsers: number;
  todayNewProjects: number;
  activeProjects: number;
  todayAILogs: number;
  totalAILogs: number;
}

interface DailyData {
  date: string;
  users: number;
  projects: number;
  aiCalls: number;
}

interface LevelData {
  name: string;
  value: number;
}

interface RecentUser {
  id: string;
  username: string;
  createdAt: string;
}

interface RecentProject {
  id: string;
  name: string;
  status: string;
  username: string;
  createdAt: string;
}

const COLORS = ['#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe'];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, totalProjects: 0, todayNewUsers: 0, todayNewProjects: 0,
    activeProjects: 0, todayAILogs: 0, totalAILogs: 0
  });
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [levelData, setLevelData] = useState<LevelData[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<'7' | '30'>('7');

  useEffect(() => {
    fetchStats();
    fetchDailyStats();
  }, [dateRange]);

  const fetchStats = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStats(data.data);
      else setError(data.error || '获取数据失败');
    } catch (err) { setError('网络错误'); }
    finally { setLoading(false); }
  };

  const fetchDailyStats = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/stats/daily?range=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDailyData(data.data.daily);
        setLevelData(data.data.levels);
        setRecentUsers(data.data.recentUsers || []);
        setRecentProjects(data.data.recentProjects || []);
      }
    } catch (err) { console.error('Failed to fetch daily stats:', err); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">加载中...</div></div>;
  if (error) return <div className="flex items-center justify-center h-64"><div className="text-red-500">{error}</div></div>;

  const statCards = [
    { title: '总用户数', value: stats.totalUsers, icon: Users, gradient: 'from-violet-500 to-purple-600' },
    { title: '总项目数', value: stats.totalProjects, icon: Folder, gradient: 'from-blue-500 to-cyan-600' },
    { title: '今日新增用户', value: stats.todayNewUsers, icon: UserPlus, gradient: 'from-emerald-500 to-teal-600' },
    { title: '今日新增项目', value: stats.todayNewProjects, icon: FolderOpen, gradient: 'from-cyan-500 to-blue-600' },
    { title: '活跃项目', value: stats.activeProjects, icon: Activity, gradient: 'from-orange-500 to-amber-600' },
    { title: '今日AI调用', value: stats.todayAILogs, icon: Bot, gradient: 'from-pink-500 to-rose-600' }
  ];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = { active: 'bg-green-100 text-green-600', completed: 'bg-blue-100 text-blue-600', archived: 'bg-gray-100 text-gray-600' };
    return <span className={`px-2 py-0.5 rounded text-xs ${colors[status] || colors.active}`}>{status === 'active' ? '进行中' : status === 'completed' ? '已完成' : '已归档'}</span>;
  };

  return (
    <div className="space-y-6">
      {/* 核心统计卡片 - 6个 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className={`bg-gradient-to-br ${card.gradient} rounded-xl p-4 text-white shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-xs">{card.title}</span>
              <card.icon className="w-4 h-4 text-white/60" />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* 趋势图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户增长趋势 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />用户增长趋势
            </h3>
            <div className="flex gap-1">
              <button onClick={() => setDateRange('7')} className={`px-2 py-1 text-xs rounded ${dateRange === '7' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}>7天</button>
              <button onClick={() => setDateRange('30')} className={`px-2 py-1 text-xs rounded ${dateRange === '30' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}>30天</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }} labelFormatter={(v) => `${v}`} />
              <Line type="monotone" dataKey="users" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 3 }} name="新增用户" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 项目创建趋势 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-600" />项目创建趋势
            </h3>
            <div className="flex gap-1">
              <button onClick={() => setDateRange('7')} className={`px-2 py-1 text-xs rounded ${dateRange === '7' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}>7天</button>
              <button onClick={() => setDateRange('30')} className={`px-2 py-1 text-xs rounded ${dateRange === '30' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}>30天</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="projects" fill="#3b82f6" radius={[4, 4, 0, 0]} name="创建项目" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI使用趋势 + 会员分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI使用趋势 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-pink-600" />AI使用趋势
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Line type="monotone" dataKey="aiCalls" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899', r: 3 }} name="AI调用" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 会员等级分布 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">会员等级分布</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={levelData.filter(l => l.value > 0)} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                {levelData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}人`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {levelData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 快捷数据 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />实时数据
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 mb-1">累计AI调用</p>
              <p className="text-xl font-bold text-purple-700">{stats.totalAILogs}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">用户转化率</p>
              <p className="text-xl font-bold text-blue-700">
                {stats.totalProjects > 0 && stats.totalUsers > 0 
                  ? ((stats.totalProjects / stats.totalUsers) * 100).toFixed(1) 
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 mb-1">AI使用率</p>
              <p className="text-xl font-bold text-green-700">
                {stats.totalUsers > 0 
                  ? ((stats.totalAILogs / stats.totalUsers)).toFixed(1) 
                  : 0}次/人
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 最近动态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近注册用户 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />最近注册
          </h3>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">暂无数据</p>
            ) : recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-900">{user.username}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 最近创建项目 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600" />最近项目
          </h3>
          <div className="space-y-3">
            {recentProjects.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">暂无数据</p>
            ) : recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 truncate">{project.name}</p>
                    <p className="text-xs text-gray-400">{project.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusBadge(project.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
