import React, { useState, useEffect } from 'react';
import { getCurrentUser, dailySignIn, logout, refreshCurrentUser } from '../services/auth';
import { MEMBER_LEVELS, MEMBER_PLANS, POINTS_RULES, User } from '../types/user';

const MemberPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'benefits' | 'plans'>('overview');
  const [signInLoading, setSignInLoading] = useState(false);

  useEffect(() => {
    const currentUser = refreshCurrentUser();
    setUser(currentUser);
  }, []);

  const handleSignIn = async () => {
    if (!user) return;
    setSignInLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = dailySignIn();
    if (result.success) {
      setUser(refreshCurrentUser());
      alert(result.message);
    } else {
      alert(result.message);
    }
    setSignInLoading(false);
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      window.location.href = '/';
    }
  };

  const handleCopyInviteCode = () => {
    if (user) {
      navigator.clipboard.writeText(user.inviteCode);
      alert('邀请码已复制！');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  const memberInfo = MEMBER_LEVELS[user.memberLevel];
  const today = new Date().toISOString().split('T')[0];
  const hasSignedToday = user.lastSignInDate === today;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部信息卡片 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            {/* 用户信息 */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-medium text-gray-600">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user.username}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-sm rounded-full ${memberInfo.bgColor} ${memberInfo.color}`}>
                    {memberInfo.icon} {memberInfo.name}
                  </span>
                </div>
              </div>
            </div>

            {/* 积分显示 */}
            <div className="text-right">
              <p className="text-sm text-gray-500">积分余额</p>
              <p className="text-3xl font-semibold text-gray-900">{user.points}</p>
            </div>
          </div>

          {/* 签到区域 */}
          <div className="mt-6 flex items-center justify-between bg-gray-50 rounded-xl p-4">
            <div>
              <p className="text-gray-700 font-medium">每日签到</p>
              <p className="text-gray-500 text-sm mt-0.5">
                连续签到 <span className="text-blue-600 font-medium">{user.signInDays}</span> 天
                | 签到 +{POINTS_RULES.dailySignIn}积分
              </p>
            </div>
            <button
              onClick={handleSignIn}
              disabled={hasSignedToday || signInLoading}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                hasSignedToday
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {signInLoading ? '签到中...' : hasSignedToday ? '已签到' : '立即签到'}
            </button>
          </div>
        </div>
      </div>

      {/* 导航标签 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-8">
            {(['overview', 'benefits', 'plans'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab === 'overview' ? '账户概览' : tab === 'benefits' ? '会员权益' : '会员套餐'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 账户信息 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">账户信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">邮箱</span>
                  <span className="text-gray-900">{user.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">会员等级</span>
                  <span className={`font-medium ${memberInfo.color}`}>{memberInfo.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">注册时间</span>
                  <span className="text-gray-900">{new Date(user.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">邀请码</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-mono">{user.inviteCode}</span>
                    <button
                      onClick={handleCopyInviteCode}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      复制
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 积分规则 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">积分规则</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">新用户注册</span>
                  <span className="text-green-600 font-medium">+{POINTS_RULES.register}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">每日签到</span>
                  <span className="text-green-600 font-medium">+{POINTS_RULES.dailySignIn}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">邀请好友</span>
                  <span className="text-green-600 font-medium">+{POINTS_RULES.invite}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">连续签到7天</span>
                  <span className="text-green-600 font-medium">+{POINTS_RULES.signInStreak}额外</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(MEMBER_LEVELS).map(([key, level]) => (
              <div
                key={key}
                className={`bg-white rounded-xl border-2 p-6 ${
                  user.memberLevel === key ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="text-3xl mb-3">{level.icon}</div>
                <h3 className={`text-lg font-semibold ${level.color}`}>{level.name}</h3>
                <ul className="mt-4 space-y-2">
                  {level.benefits.map((benefit, index) => (
                    <li key={index} className="text-gray-600 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
                {user.memberLevel === key && (
                  <div className="mt-4 text-center text-blue-600 text-sm font-medium">
                    当前等级
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(MEMBER_PLANS).map(([key, plan]) => (
              <div
                key={key}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  {key === 'annual' && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      推荐
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">¥{plan.price}</span>
                  <span className="text-gray-500 text-sm">
                    /{plan.period === 'year' ? '年' : '月'}
                  </span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-gray-600 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all">
                  立即购买
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 退出登录 */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <button
          onClick={handleLogout}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
        >
          退出登录
        </button>
      </div>
    </div>
  );
};

export default MemberPage;
