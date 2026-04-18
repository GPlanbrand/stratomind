import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 路由
import authRoutes from './routes/auth';
import guestRoutes, { createGuestToken, verifyGuestToken, updateGuestData } from './routes/guest';
import smsRoutes, { sendSmsCode, verifySmsCode } from './routes/sms';
import requirementRoutes from './routes/requirement';
import projectRoutes from './routes/project';
import aiRoutes from './routes/ai';
import memberRoutes from './routes/member';
import pointsRoutes from './routes/points';
import assetRoutes from './routes/asset';
import knowledgeRoutes from './routes/knowledge';
import initRoutes from './routes/init';
import adminRoutes from './routes/admin';

// 加载环境变量
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://stratomind.vercel.app',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// 公共路由
app.use('/api/init', initRoutes);

// 认证路由（无需登录）
app.use('/api/auth', authRoutes);

// 访客Token路由（无需登录）
app.post('/api/auth/guest', createGuestToken);
app.get('/api/auth/guest/:token', verifyGuestToken);
app.put('/api/auth/guest/:token', updateGuestData);

// 短信验证码路由（无需登录）
app.post('/api/auth/sms/send', sendSmsCode);
app.post('/api/auth/sms/verify', verifySmsCode);

// 需求确认单路由（需要登录）
app.use('/api/requirements', requirementRoutes);

// 需要登录认证的路由
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
// app.use('/api/ai', aiChatRoutes);
// app.use('/api/search', searchRoutes);
// app.use('/api/share', shareRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// 管理员路由
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'stratomind-api', timestamp: new Date().toISOString() });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 StratoMind API Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
