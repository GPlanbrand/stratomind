import { Router } from 'express';
import { register, login, getCurrentUser, signIn } from '../routes/auth';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 注册
router.post('/register', register);

// 登录
router.post('/login', login);

// 签到（需要登录）
router.post('/signin', authMiddleware, signIn);

// 获取当前用户（需要登录）
router.get('/me', authMiddleware, getCurrentUser);

export default router;
