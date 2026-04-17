import React, { useState, useEffect } from 'react';
import { 
  Users, FolderOpen, Coins, Bot, TrendingUp, TrendingDown,
  Activity, Clock, UserPlus, FileText, Zap, Download,
  CreditCard, ChevronRight
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const API_BASE = '';

// 统计数据接口
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

// 趋势数据接口
interface TrendData {
  date: string;
  users: number;
  projects: number;
  aiCalls: number;
  recharges: number;
}

// 会员等级数据
interface LevelData {
  name: string;
  value: number;
}

// 动态数据接口
interface Activity {
  id: string;
  type: 'user' | 'project' | 'ai' | 'recharge' | 'member';
  title: string;
  description: string;
  time: string;
}

// Props接口
interface AdminDashboardProps {
  onNavigate?: (menu: string) => void;
}

const COLORS = ['#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe'];

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
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');

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

  // 计算趋势百分比
  const calcTrend = (current: number, previous: number): { value: number; isUp: boolean } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isUp: true };
    const change = ((current - previous) / previous * 100);
    return { value: Math.abs(change), isUp: change >= 0 };
  };

  // 获取动态图标
  const getActivityIcon = (type: string) => {
    const icons: Record<string, { icon: React.ElementType; color: string }> = {
      user: { icon: UserPlus, color: 'text-purple-500 bg-purple-100' },
      project: { icon: FileText, color: 'text-blue-500 bg-blue-100' },
      ai: { icon: Bot, color: 'text-pink-500 bg-pink-100' },
      recharge: { icon: Coins, color: 'text-yellow-500 bg-yellow-100' },
      member: { icon: Zap, color: 'text-amber-500 bg-amber-100' }
    };
    return icons[type] || icons.user;
  };

  // 统计卡片配置
  const statCards = [
    { 
      title: '总用户', 
      value: stats.totalUsers, 
      icon: Users, 
      gradient: 'from-violet-500 to-purple-600',
      trend: calcTrend(stats.todayNewUsers, stats.weekNewUsers / 7),
      subtitle: '今日新增'
    },
    { 
      title: '总项目', 
      value: stats.totalProjects, 
      icon: FolderOpen, 
      gradient: 'from-blue-500 to-cyan-600',
      trend: calcTrend(stats.todayNewProjects, stats.weekNewProjects / 7),
      subtitle: '进行中'
    },
    { 
      title: '总充值', 
      value: `¥${stats.totalRecharges.toLocaleString()}`, 
      icon: Coins, 
      gradient: 'from-emerald-500 to-teal-600',
      trend: calcTrend(stats.todayRecharges, stats.weekRecharges / 7),
      subtitle: '今日充值'
    },
    { 
      title: 'AI调用', 
      value: stats.totalAILogs.toLocaleString(), 
      icon: Bot, 
      gradient: 'from-pink-500 to-rose-600',
      trend: calcTrend(stats.todayAILogs, stats.weekAILogs / 7),
      subtitle: '今日调用'
    },
    { 
      title: 'VIP用户', 
      value: stats.vipUsers, 
      icon: Zap, 
      gradient: 'from-amber-500 to-orange-600',
      subtitle: '活跃用户'
    },
    { 
      title: '本周活跃', 
      value: stats.activeProjects, 
      icon: Activity, 
      gradient: 'from-indigo-500 to-purple-600',
      subtitle: '活跃项目'
    }
  ];

  // 格式化日期显示
  const formatDate = (date: string) => date.slice(5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 时间筛选 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">数据概览</h2>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'today', label: '今日' },
            { key: 'week', label: '本周' },
            { key: 'month', label: '本月' }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setDateRange(btn.key as any)}
              className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                dateRange === btn.key 
                  ? 'bg-white text-purple-600 shadow-sm font-medium' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 核心统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className={`bg-gradient-to-br ${card.gradient} rounded-xl p-4 text-white shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-xs font-medium">{card.title}</span>
              <card.icon className="w-4 h-4 text-white/60" />
            </div>
            <p className="text-2xl font-bold mb-1">{card.value}</p>
            {card.trend && (
              <div className="flex items-center gap-1 text-xs">
                {card.trend.isUp ? (
                  <TrendingUp className="w-3 h-3 text-green-300" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-300" />
                )}
                <span className={card.trend.isUp ? 'text-green-300' : 'text-red-300'}>
                  {card.trend.value.toFixed(0)}%
                </span>
                <span className="text-white/60">{card.subtitle}</span>
              </div>
            )}
            {!card.trend && (
              <p className="text-xs text-white/60">{card.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 用户增长趋势 */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              增长趋势
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={formatDate} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
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
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="projects" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ fill: '#3b82f6', r: 3 }}
                name="创建项目"
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 会员等级分布 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            会员分布
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={levelData.filter(l => l.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
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
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-center text-xs text-gray-500">
            共 {levelData.reduce((sum, l) => sum + l.value, 0)} 位会员
          </div>
        </div>
      </div>

      {/* AI使用趋势 + 最新动态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI使用趋势 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-pink-600" />
              AI使用趋势
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={formatDate} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="aiCalls" fill="#ec4899" radius={[4, 4, 0, 0]} name="AI调用" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 最新动态 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              最新动态
            </h3>
            <button className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1">
              查看全部 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">暂无动态</p>
            ) : (
              activities.map((activity) => {
                const iconConfig = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-8 h-8 rounded-lg ${iconConfig.color} flex items-center justify-center flex-shrink-0`}>
                      <iconConfig.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 快捷操作区 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          快捷操作
        </h3>
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
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all group ${
                action.color === 'purple' ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' :
                action.color === 'blue' ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' :
                action.color === 'green' ? 'border-green-200 hover:border-green-400 hover:bg-green-50' :
                'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <action.icon className={`w-5 h-5 ${
                action.color === 'purple' ? 'text-purple-500 group-hover:text-purple-600' :
                action.color === 'blue' ? 'text-blue-500 group-hover:text-blue-600' :
                action.color === 'green' ? 'text-green-500 group-hover:text-green-600' :
                'text-gray-500 group-hover:text-gray-600'
              }`} />
              <span className={`font-medium text-sm ${
                action.color === 'purple' ? 'text-purple-600' :
                action.color === 'blue' ? 'text-blue-600' :
                action.color === 'green' ? 'text-green-600' :
                'text-gray-600'
              }`}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 待办事项 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: '待处理用户', count: 0, desc: '新注册待审核', color: 'purple' },
          { title: '待审核项目', count: 0, desc: '项目待审批', color: 'blue' },
          { title: '系统告警', count: 0, desc: '异常待处理', color: 'red' }
        ].map((item, idx) => (
          <div 
            key={idx}
            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                item.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                'bg-red-100 text-red-600'
              }`}>
                <span className="text-lg font-bold">{item.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
