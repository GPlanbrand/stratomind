import { User, POINTS_RULES } from '../types/user';

const STORAGE_KEY = 'stratomind_users';
const CURRENT_USER_KEY = 'stratomind_current_user';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const generateInviteCode = (): string => {
  return 'SM' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const register = (username: string, email: string, password: string, inviteCode?: string): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  
  if (users.some(u => u.email === email)) {
    return { success: false, message: '该邮箱已被注册' };
  }
  
  if (users.some(u => u.username === username)) {
    return { success: false, message: '该用户名已被使用' };
  }
  
  let invitedBy: string | undefined;
  if (inviteCode) {
    const inviter = users.find(u => u.inviteCode === inviteCode);
    if (!inviter) {
      return { success: false, message: '无效的邀请码' };
    }
    invitedBy = inviter.id;
  }
  
  const newUser: User = {
    id: generateId(),
    username,
    email,
    password,
    memberLevel: 'normal',
    points: POINTS_RULES.register,
    createdAt: new Date().toISOString(),
    signInDays: 0,
    inviteCode: generateInviteCode(),
    invitedBy
  };
  
  users.push(newUser);
  saveUsers(users);
  
  if (invitedBy) {
    const inviterIndex = users.findIndex(u => u.id === invitedBy);
    if (inviterIndex !== -1) {
      users[inviterIndex].points += POINTS_RULES.invite;
      saveUsers(users);
    }
  }
  
  setCurrentUser(newUser);
  
  return { success: true, message: '注册成功！已赠送600积分', user: newUser };
};

export const login = (email: string, password: string): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  let user = users.find(u => u.email === email && u.password === password);
  
  // 演示模式：密码123456自动创建用户并登录
  if (!user && password === '123456') {
    const newEmail = email.includes('@') ? email : email + '@demo.com';
    const regResult = register(email, newEmail, '123456');
    if (regResult.success) {
      return { success: true, message: '登录成功（演示模式）', user: regResult.user };
    }
  }
  
  if (!user) {
    return { success: false, message: '邮箱或密码错误' };
  }
  
  user.lastLoginAt = new Date().toISOString();
  saveUsers(users);
  
  setCurrentUser({ ...user });
  
  return { success: true, message: '登录成功', user };
};

export const logout = (): void => {
  setCurrentUser(null);
};

export const updateUser = (updates: Partial<User>): User | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex === -1) return null;
  
  const updatedUser = { ...users[userIndex], ...updates };
  users[userIndex] = updatedUser;
  saveUsers(users);
  
  setCurrentUser(updatedUser);
  return updatedUser;
};

export const dailySignIn = (): { success: boolean; message: string; points?: number; streakDays?: number } => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: '请先登录' };
  }
  
  const today = new Date().toISOString().split('T')[0];
  
  if (currentUser.lastSignInDate === today) {
    return { success: false, message: '今日已签到，明天再来吧~' };
  }
  
  let newStreakDays = 1;
  if (currentUser.lastSignInDate) {
    const lastSignIn = new Date(currentUser.lastSignInDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastSignIn.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
      newStreakDays = currentUser.signInDays + 1;
    }
  }
  
  let pointsEarned = POINTS_RULES.dailySignIn;
  if (newStreakDays > 0 && newStreakDays % 7 === 0) {
    pointsEarned += POINTS_RULES.signInStreak;
  }
  
  const updatedUser = updateUser({
    points: currentUser.points + pointsEarned,
    lastSignInDate: today,
    signInDays: newStreakDays
  });
  
  if (!updatedUser) {
    return { success: false, message: '签到失败' };
  }
  
  return { 
    success: true, 
    message: `签到成功！获得${pointsEarned}积分${newStreakDays > 1 ? `（连续${newStreakDays}天签到）` : ''}`,
    points: pointsEarned,
    streakDays: newStreakDays
  };
};

export const consumePoints = (amount: number): { success: boolean; message: string; remainingPoints?: number } => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: '请先登录' };
  }
  
  if (currentUser.points < amount) {
    return { success: false, message: `积分不足，当前余额：${currentUser.points}` };
  }
  
  const updatedUser = updateUser({
    points: currentUser.points - amount
  });
  
  if (!updatedUser) {
    return { success: false, message: '扣减积分失败' };
  }
  
  return { success: true, message: `消耗${amount}积分`, remainingPoints: updatedUser.points };
};

export const refreshCurrentUser = (): User | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  const users = getUsers();
  const user = users.find(u => u.id === currentUser.id);
  
  if (user) {
    setCurrentUser(user);
    return user;
  }
  
  return null;
};
