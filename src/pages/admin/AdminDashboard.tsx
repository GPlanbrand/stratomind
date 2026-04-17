import React, { useState, useEffect } from 'react';
import { 
  Users, FolderOpen, Coins, Bot, TrendingUp, TrendingDown,
  Activity, Clock, UserPlus, FileText, Zap, Download,
  CreditCard, ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const API_BASE = '';

interface Stats {
  totalUsers: number;
  totalProjects: number;
  todayNewUsers: number;
  todayNewProjects: number;
  weekNewUsers: number;
  weekNewProjects: number;
  monthNewUsers: number;
  monthNewProjects: number;
  activeProjects: number;
  todayAILogs: number;
  weekAILogs: number;
  monthAILogs: number;
  totalAILogs: number;
  totalRecharges: number;
  todayRecharges: number;
  weekRecharges: number;
  monthRecharges: number;
  vipUsers: number;
}

interface TrendData {
  date: string;
  users: number;
  projects: number;
  aiCalls: number;
  recharges: number;
}

interface LevelData {
  name: string;
  value: number;
}

interface Activity {
  id: string;
  type: 'user' | 'project' | 'ai' | 'recharge' | 'member';
  title: string;
  description: string;
  time: string;
}

interface AdminDashboardProps {
  onNavigate?: (menu: string) => void;
}

const COLORS = ['#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe'];
const PURPLE = '#7c3aed';
const PURPLE_LIGHT = '#a78bfa';
const PURPLE_BG = '#faf5ff';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, totalProjects: 0, todayNewUsers: 0, todayNewProjects: 0,
    weekNewUsers: 0, weekNewProjects: 0, monthNewUsers: 0, monthNewProjects: 0,
    activeProjects: 0, todayAILogs: 0, weekAILogs: 0, monthAILogs: 0, totalAILogs: 0,
    totalRecharges: 0, todayRecharges: 0, weekRecharges: 0, monthRecharges: 0, vipUsers: 0
  });
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [levelData, setLevelData] = useState<LevelData[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d'>('7d');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const [statsRes, trendRes, activitiesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/admin/stats/trend?range=${dateRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/admin/activities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [statsData, trendData, activitiesData] = await Promise.all([
        statsRes.json(),
        trendRes.json(),
        activitiesRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (trendData.success) {
        setTrendData(trendData.data.trend);
        setLevelData(trendData.data.levels);
      }
      if (activitiesData.success) setActivities(activitiesData.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calcTrend = (current: number, previous: number): { value: number; isUp: boolean } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isUp: true };
    const change = ((current - previous) / previous * 100);
    return { value: Math.abs(change), isUp: change >= 0 };
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
      user: { icon: UserPlus, bg: 'bg-[#faf5ff]', color: 'text-[#7c3aed]' },
      project: { icon: FileText, bg: 'bg-[#eff6ff]', color: 'text-[#3b82f6]' },
      ai: { icon: Bot, bg: 'bg-[#fdf2f8]', color: 'text-[#ec4899]' },
      recharge: { icon: Coins, bg: 'bg-[#fef3c7]', color: 'text-[#f59e0b]' },
      member: { icon: Zap, bg: 'bg-[#fff7ed]', color: 'text-[#f97316]' }
    };
    return icons[type] || icons.user;
  };

  const statCards = [
    { 
      title: '总用户', 
      value: stats.totalUsers, 
      icon: Users, 
      trend: calcTrend(stats.todayNewUsers, stats.weekNewUsers / 7),
      subtitle: '今日新增'
    },
    { 
      title: '总项目', 
      value: stats.totalProjects, 
      icon: FolderOpen, 
      trend: calcTrend(stats.todayNewProjects, stats.weekNewProjects / 7),
      subtitle: '进行中'
    },
    { 
      title: '总充值', 
      value: `¥${stats.totalRecharges.toLocaleString()}`, 
      icon: Coins, 
      trend: calcTrend(stats.todayRecharges, stats.weekRecharges / 7),
      subtitle: '今日充值'
    },
    { 
      title: 'AI调用', 
      value: stats.totalAILogs.toLocaleString(), 
      icon: Bot, 
      trend: calcTrend(stats.todayAILogs, stats.weekAILogs / 7),
      subtitle: '今日调用'
    }
  ];

  const formatDate = (date: string) => date.slice(5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-[#6b7280]">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#111827]">数据概览</h2>
        {/* 时间切换 - 7天/30天 */}
        <div className="flex gap-1 bg-[#f9fafb] p-1 rounded-md border border-[#e5e7eb]">
          {[
            { key: '7d', label: '7天' },
            { key: '30d', label: '30天' }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setDateRange(btn.key as any)}
              className={`px-4 py-1.5 text-sm rounded transition-all ${
                dateRange === btn.key 
                  ? 'bg-white text-[#7c3aed] shadow-sm font-medium border border-[#e5e7eb]' 
                  : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 统计卡片 - 4列响应式 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl p-5 border border-[#e5e7eb] hover:border-[#a78bfa] transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-[#6b7280]">{card.title}</span>
              <div className="w-9 h-9 rounded-lg bg-[#faf5ff] flex items-center justify-center">
                <card.icon className="w-4 h-4 text-[#7c3aed]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#111827] mb-2">{card.value}</p>
            <div className="flex items-center gap-2">
              {card.trend.isUp ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-[#10b981]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-[#ef4444]" />
              )}
              <span className={`text-xs font-medium ${card.trend.isUp ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {card.trend.value.toFixed(0)}%
              </span>
              <span className="text-xs text-[#9ca3af]">{card.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 用户增长趋势 */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[#e5e7eb]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#111827]">增长趋势</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={formatDate} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                labelFormatter={(label) => `${label}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#7c3aed" 
                strokeWidth={2} 
                dot={{ fill: '#7c3aed', r: 3 }}
                name="新增用户"
                activeDot={{ r: 5, fill: '#7c3aed' }}
              />
              <Line 
                type="monotone" 
                dataKey="projects" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ fill: '#3b82f6', r: 3 }}
                name="创建项目"
                activeDot={{ r: 5, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 会员等级分布 */}
        <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">会员分布</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={levelData.filter(l => l.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {levelData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}人`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {levelData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs text-[#6b7280]">{item.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-xs text-[#9ca3af]">
            共 {levelData.reduce((sum, l) => sum + l.value, 0)} 位会员
          </div>
        </div>
      </div>

      {/* AI使用趋势 + 最新动态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI使用趋势 */}
        <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#111827]">AI使用趋势</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={formatDate} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="aiCalls" fill="#7c3aed" radius={[4, 4, 0, 0]} name="AI调用" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 最新动态 - 时间线样式 */}
        <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#111827]">最新动态</h3>
            <button className="text-xs text-[#7c3aed] hover:text-[#6d28d9] flex items-center gap-1">
              查看全部 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3 max-h-[220px] overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-[#9ca3af] text-sm text-center py-8">暂无动态</p>
            ) : (
              activities.map((activity, index) => {
                const iconConfig = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3 relative">
                    {/* 时间线 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-lg ${iconConfig.bg} flex items-center justify-center`}>
                        <iconConfig.icon className={`w-4 h-4 ${iconConfig.color}`} />
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-px h-6 bg-[#e5e7eb] mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-sm text-[#111827] truncate">{activity.title}</p>
                      <p className="text-xs text-[#9ca3af] truncate mt-0.5">{activity.description}</p>
                    </div>
                    <span className="text-xs text-[#9ca3af] flex-shrink-0 pt-1">{activity.time}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
        <h3 className="text-sm font-semibold text-[#111827] mb-4">快捷操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '新建用户', icon: UserPlus, color: 'purple', action: () => onNavigate?.('users') },
            { label: '新建项目', icon: FileText, color: 'blue', action: () => onNavigate?.('projects') },
            { label: '充值积分', icon: Coins, color: 'green', action: () => onNavigate?.('recharges') },
            { label: '导出报表', icon: Download, color: 'gray', action: () => {} }
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all group ${
                action.color === 'purple' ? 'border-[#e9d5ff] hover:border-[#7c3aed] hover:bg-[#faf5ff]' :
                action.color === 'blue' ? 'border-[#bfdbfe] hover:border-[#3b82f6] hover:bg-[#eff6ff]' :
                action.color === 'green' ? 'border-[#a7f3d0] hover:border-[#10b981] hover:bg-[#ecfdf5]' :
                'border-[#e5e7eb] hover:border-[#6b7280] hover:bg-[#f9fafb]'
              }`}
            >
              <action.icon className={`w-5 h-5 ${
                action.color === 'purple' ? 'text-[#7c3aed]' :
                action.color === 'blue' ? 'text-[#3b82f6]' :
                action.color === 'green' ? 'text-[#10b981]' :
                'text-[#6b7280]'
              }`} />
              <span className={`font-medium text-sm ${
                action.color === 'purple' ? 'text-[#7c3aed]' :
                action.color === 'blue' ? 'text-[#3b82f6]' :
                action.color === 'green' ? 'text-[#10b981]' :
                'text-[#6b7280]'
              }`}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
