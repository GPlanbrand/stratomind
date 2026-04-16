# 灵思AI创意工作台 - 后端API

基于 Express.js + Prisma 的后端API服务，用于支持灵思AI创意工作台的前端应用。

## 技术栈

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT

## 快速部署到 Railway

### 步骤1：创建GitHub仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角 `+` -> `New repository`
3. 仓库名称填写 `stratomind-backend`
4. 选择 `Private`（私有仓库）
5. 点击 `Create repository`

### 步骤2：上传代码到GitHub

在本地终端执行以下命令（或者使用GitHub Desktop）：

```bash
# 进入后端项目目录
cd stratomind-backend

# 初始化git仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: StratoMind Backend API"

# 添加远程仓库（替换 YOUR_USERNAME 为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/stratomind-backend.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

### 步骤3：在Railway部署

1. 访问 [Railway](https://railway.app) 并登录（推荐用GitHub账号登录）
2. 点击 `New Project` -> `Deploy from GitHub repo`
3. 授权GitHub访问，选择 `stratomind-backend` 仓库
4. Railway会自动检测到Node.js项目

### 步骤4：配置环境变量

在Railway项目设置中添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_Fr32cXwVNtAz@ep-delicate-dream-a17q2a53-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require` |
| `JWT_SECRET` | `stratomind-2024-jwt-secure-key-abc123` |
| `FRONTEND_URL` | `https://stratomind.vercel.app` |
| `DEEPSEEK_API_KEY` | 你的DeepSeek API Key（可选） |

### 步骤5：添加数据库

1. 在Railway项目页面点击 `+ New`
2. 选择 `Database` -> `Add PostgreSQL`
3. Railway会自动创建PostgreSQL数据库
4. **重要**：复制新的数据库URL替换上面的 `DATABASE_URL`

### 步骤6：部署

Railway会自动开始部署。等待1-2分钟后，你会获得一个URL，格式如：
```
https://stratomind-backend.up.railway.app
```

这就是你的API地址！

## API端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/signin` - 签到
- `GET /api/auth/me` - 获取当前用户

### 项目
- `GET /api/projects` - 获取项目列表
- `GET /api/projects/:id` - 获取单个项目
- `POST /api/projects` - 创建项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### AI功能
- `POST /api/ai/analyze-competitors` - 竞品分析
- `POST /api/ai/generate-brief` - 生成创意简报
- `POST /api/ai/generate-strategy` - 生成创意策略

### 会员
- `GET /api/member/info` - 获取会员信息
- `GET /api/member/plans` - 获取会员套餐
- `POST /api/member/upgrade` - 升级会员

### 积分
- `GET /api/points/info` - 获取积分信息
- `GET /api/points/history` - 获取积分记录

### 资产库
- `GET /api/assets` - 获取资产列表
- `POST /api/assets` - 上传资产
- `DELETE /api/assets/:id` - 删除资产

### 知识库
- `GET /api/knowledge` - 获取知识列表
- `GET /api/knowledge/:id` - 获取知识详情
- `POST /api/knowledge` - 创建知识
- `PUT /api/knowledge/:id` - 更新知识
- `DELETE /api/knowledge/:id` - 删除知识

### 其他
- `GET /api/init` - 初始化数据库
- `GET /api/health` - 健康检查

## 本地开发

```bash
# 安装依赖
npm install

# 生成Prisma客户端
npx prisma generate

# 推送数据库schema
npx prisma db push

# 启动开发服务器
npm run dev
```

## 前端配置

部署完成后，在前端项目中更新API地址：

在 `vercel-deploy/src/services/api.ts` 中修改 `baseURL`：

```typescript
const api = axios.create({
  baseURL: 'https://你的railway-url.up.railway.app/api',  // 替换为你的Railway URL
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

## 技术支持

如有问题，请检查：
1. Railway部署日志
2. Neon数据库连接状态
3. 环境变量是否正确配置
