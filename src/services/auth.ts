import { User, POINTS_RULES } from '../types/user';
import { RoleType } from '../config/roleConfig';

const STORAGE_KEY = 'stratomind_users';
const CURRENT_USER_KEY = 'stratomind_current_user';
const VERIFY_CODES_KEY = 'stratomind_verify_codes';

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

// 演示模式：自动注册并登录
const demoRegister = (identifier: string): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  
  // 检查是否已有演示账号
  let user = users.find(u => u.username === 'demo' || u.email === 'demo@demo.com');
  if (user) {
    setCurrentUser(user);
    return { success: true, message: '演示登录成功', user };
  }
  
  // 创建演示账号
  const newUser: User = {
    id: generateId(),
    username: 'demo',
    email: 'demo@demo.com',
    password: 'demo123',
    memberLevel: 'vip',
    points: 600,
    createdAt: new Date().toISOString(),
    signInDays: 0,
    inviteCode: generateInviteCode(),
  };
  
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);
  
  return { success: true, message: '演示登录成功', user: newUser };
};

export const login = (identifier: string, password: string): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  
  // 演示模式：demo/demo123 或 任意账号/123456
  if (password === 'demo123' && identifier === 'demo') {
    return demoRegister(identifier);
  }
  
  // 演示模式2：任意账号/123456自动注册
  if (password === '123456') {
    return demoRegister(identifier);
  }
  
  // 正常登录：邮箱或用户名匹配
  let user = users.find(u => 
    (u.email === identifier || u.username === identifier) && u.password === password
  );
  
  if (!user) {
    return { success: false, message: '用户名或密码错误' };
  }
  
  user.lastLoginAt = new Date().toISOString();
  saveUsers(users);
  
  setCurrentUser({ ...user });
  
  return { success: true, message: '登录成功', user };
};

export const logout = (): void => {
  setCurrentUser(null);
};

export const refreshCurrentUser = (): User | null => {
  return getCurrentUser();
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

export const dailySignIn = (): { success: boolean; message: string } => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: '请先登录' };
  }
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex === -1) {
    return { success: false, message: '用户不存在' };
  }
  
  const today = new Date().toDateString();
  const lastSignIn = users[userIndex].lastSignInDate;
  
  if (lastSignIn === today) {
    return { success: false, message: '今日已签到，明天再来吧' };
  }
  
  users[userIndex].points += POINTS_RULES.dailySignIn;
  users[userIndex].signInDays += 1;
  users[userIndex].lastSignInDate = today;
  
  saveUsers(users);
  setCurrentUser({ ...users[userIndex] });
  
  return { success: true, message: `签到成功！获得${POINTS_RULES.dailySignIn}积分` };
};

// 获取用户角色
export const getUserRole = (): RoleType | null => {
  const user = getCurrentUser();
  return user?.role || null;
};

// 更新用户角色
export const updateUserRole = (role: RoleType): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === user.id);
  
  if (userIndex === -1) return false;
  
  users[userIndex].role = role;
  saveUsers(users);
  setCurrentUser(users[userIndex]);
  
  return true;
};

// 检查用户是否已选择角色
export const hasSelectedRole = (): boolean => {
  const user = getCurrentUser();
  return !!user?.role;
};

// 获取用户角色配置
export const getUserRoleConfig = () => {
  const role = getUserRole();
  if (!role) return null;
  
  const { getRoleConfig } = require('../config/roleConfig');
  return getRoleConfig(role);
};

// ==================== 手机号+验证码登录 ====================

// 存储验证码（模拟）
const storeVerifyCode = (phone: string, code: string): void => {
  const codes = JSON.parse(localStorage.getItem(VERIFY_CODES_KEY) || '{}');
  codes[phone] = {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5分钟过期
  };
  localStorage.setItem(VERIFY_CODES_KEY, JSON.stringify(codes));
};

// 获取验证码
const getVerifyCode = (phone: string): string | null => {
  const codes = JSON.parse(localStorage.getItem(VERIFY_CODES_KEY) || '{}');
  const record = codes[phone];
  
  if (!record) return null;
  
  // 检查是否过期
  if (Date.now() > record.expiresAt) {
    delete codes[phone];
    localStorage.setItem(VERIFY_CODES_KEY, JSON.stringify(codes));
    return null;
  }
  
  return record.code;
};

// 清除验证码
const clearVerifyCode = (phone: string): void => {
  const codes = JSON.parse(localStorage.getItem(VERIFY_CODES_KEY) || '{}');
  delete codes[phone];
  localStorage.setItem(VERIFY_CODES_KEY, JSON.stringify(codes));
};

// 发送验证码
export const sendVerificationCode = async (phone: string): Promise<boolean> => {
  // 模拟发送验证码
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 生成6位随机验证码
  const code = Math.random().toString().slice(2, 8);
  storeVerifyCode(phone, code);
  
  console.log(`[模拟] 验证码已发送至 ${phone}: ${code}`);
  
  return true;
};

// 手机号+验证码登录
export const loginWithPhone = (phone: string, code: string): { success: boolean; message: string; user?: User } => {
  // 验证码错误
  const validCode = getVerifyCode(phone);
  if (!validCode || validCode !== code) {
    return { success: false, message: '验证码错误或已过期' };
  }
  
  // 清除已使用的验证码
  clearVerifyCode(phone);
  
  // 查找或创建用户
  const users = getUsers();
  let user = users.find(u => u.phone === phone);
  
  if (!user) {
    // 创建新用户
    const newUser: User = {
      id: generateId(),
      username: `用户${phone.slice(-4)}`,
      email: `${phone}@lisi.com`,
      password: '',
      phone,
      memberLevel: 'normal',
      points: 600,
      createdAt: new Date().toISOString(),
      signInDays: 0,
      inviteCode: generateInviteCode(),
    };
    
    users.push(newUser);
    saveUsers(users);
    user = newUser;
  }
  
  user.lastLoginAt = new Date().toISOString();
  saveUsers(users);
  
  setCurrentUser({ ...user });
  
  return { success: true, message: '登录成功', user };
};

// 检查是否为访客
export const isGuest = (): boolean => {
  const user = getCurrentUser();
  return !user;
};
