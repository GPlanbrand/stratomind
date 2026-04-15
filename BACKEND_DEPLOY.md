# 后端部署指南

## 1. 创建Vercel Postgres数据库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目 `stratomind`
3. 点击 **Storage** 标签
4. 点击 **Create Database**
5. 选择 **Postgres**
6. 数据库名：`stratomind-db`
7. 区域：选择离你最近的（如 Hong Kong）
8. 点击 **Create**

## 2. 获取数据库连接字符串

创建完成后，Vercel会自动添加环境变量：
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`（使用这个）
- `POSTGRES_URL_NON_POOLING`

**复制 `POSTGRES_PRISMA_URL` 的值**

## 3. 配置本地环境变量

1. 复制 `.env.example` 为 `.env`
2. 将 `DATABASE_URL` 替换为你的数据库连接字符串
3. 修改 `JWT_SECRET` 为随机字符串（可用 `openssl rand -base64 32` 生成）

## 4. 初始化数据库

```bash
# 安装依赖
npm install

# 生成Prisma Client
npm run db:generate

# 推送数据库结构（开发环境）
npm run db:push

# 或使用迁移（生产环境推荐）
npm run db:migrate
```

## 5. 本地测试

```bash
# 启动开发服务器
npm run dev

# 测试API
curl http://localhost:5173/api/auth/register -X POST -H "Content-Type: application/json" -d '{"username":"test","email":"test@test.com","password":"123456"}'
```

## 6. 部署到Vercel

Vercel会自动部署，只需确保：
1. 在Vercel后台配置环境变量 `DATABASE_URL` 和 `JWT_SECRET`
2. 数据库已创建

## API接口列表

### 认证相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/me | 获取当前用户 |
| POST | /api/auth/signin | 每日签到 |

### 项目相关
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/projects | 获取项目列表 |
| POST | /api/projects | 创建项目 |
| GET | /api/projects/:id | 获取项目详情 |
| PUT | /api/projects/:id | 更新项目 |
| DELETE | /api/projects/:id | 删除项目 |
| GET | /api/projects/:id/steps | 获取步骤数据 |
| PUT | /api/projects/:id/steps | 保存步骤数据 |

## 数据库结构

```
users（用户表）
├── id, username, email, password_hash
├── member_level, points
├── sign_in_days, last_sign_in_date
└── invite_code, invited_by

projects（项目表）
├── id, user_id
├── name, client_name, status
└── created_at, updated_at

project_steps（项目步骤表）
├── project_id
├── client_info（JSON）
├── requirements（JSON）
├── competitors（JSON）
├── brief（JSON）
└── strategy（JSON）

points_transactions（积分流水表）
├── user_id, type, amount
├── balance_after, source
└── description
```
