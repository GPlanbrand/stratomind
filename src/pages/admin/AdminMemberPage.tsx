import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Gem, TrendingUp } from 'lucide-react';

const API_BASE = '';

interface LevelStats {
  level: string;
  name: string;
  count: number;
  percentage: number;
}

const AdminMemberPage: React.FC = () => {
  const [stats, setStats] = useState<{ levels: LevelStats[]; total: number }>({
    levels: [],
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/members/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#9ca3af', '#6b7280', '#f59e0b', '#7c3aed'];

  const levelLabels: Record<string, string> = {
    normal: '普通会员',
    silver: '白银会员',
    gold: '黄金会员',
    diamond: '钻石会员'
  };

  return (
    <div className="space-y-6">
      {/* 会员等级概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.levels.map((item, index) => (
          <div key={item.level} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                index === 3 ? 'bg-purple-100' : index === 2 ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                <Gem className={`w-6 h-6 ${
                  index === 3 ? 'text-purple-600' : index === 2 ? 'text-yellow-600' : 'text-gray-500'
                }`} />
              </div>
              <span className="text-sm text-gray-500">占比 {item.percentage}%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{item.count}</p>
            <p className="text-sm text-gray-500 mt-1">{levelLabels[item.level]}</p>
          </div>
        ))}
      </div>

      {/* 会员等级分布图 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">会员等级分布</h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ResponsiveContainer width={280} height={240}>
            <PieChart>
              <Pie
                data={stats.levels.filter(l => l.count > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
              >
                {stats.levels.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-4">
            {stats.levels.map((item, index) => (
              <div key={item.level} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-gray-600">{levelLabels[item.level]}</span>
                <span className="font-semibold text-gray-900">{item.count}人</span>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-500">
                <span>总会员数</span>
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold text-gray-900">{stats.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 会员权益说明 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">会员权益说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gem className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-700">普通会员</span>
            </div>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• 基础功能使用</li>
              <li>• 每日签到积分</li>
              <li>• 邀请好友奖励</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gem className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">白银会员</span>
            </div>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• 普通会员全部权益</li>
              <li>• 优先客服响应</li>
              <li>• 9折积分优惠</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gem className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-700">黄金会员</span>
            </div>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• 白银会员全部权益</li>
              <li>• 专属顾问服务</li>
              <li>• 8折积分优惠</li>
              <li>• 专属皮肤主题</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gem className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-700">钻石会员</span>
            </div>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• 黄金会员全部权益</li>
              <li>• 7折积分优惠</li>
              <li>• 无限云存储</li>
              <li>• 优先体验新功能</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMemberPage;
