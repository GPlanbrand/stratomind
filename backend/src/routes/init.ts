import { Router } from 'express';
import { initDatabase } from '../services/database';

const router = Router();

// 初始化数据库 - GET /api/init
router.get('/', initDatabase);

export default router;
