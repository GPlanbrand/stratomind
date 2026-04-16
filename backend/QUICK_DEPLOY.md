# 灵思AI创意工作台 - Railway部署指南

## 📦 项目概述

后端API项目已创建完成，包含：
- 用户系统（注册/登录/签到）
- 项目系统（CRUD）
- 会员系统
- 积分系统
- AI日志
- 资产库
- 知识库

---

## 🚀 最简单的部署方式（推荐小白）

### 第一步：创建GitHub仓库

1. 打开 https://github.com 并登录
2. 点击右上角 `+` → `New repository`
3. 仓库名称填：`stratomind-backend`
4. 选择 `Private`
5. 点击 `Create repository`
6. **重要**：创建完成后，复制页面上的仓库地址，类似：
   ```
   https://github.com/你的用户名/stratomind-backend.git
   ```

### 第二步：推送代码

在终端中执行（把 `你的用户名` 替换成你的GitHub用户名）：

```bash
cd stratomind-backend

# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/stratomind-backend.git

# 推送代码
git branch -M main
git push -u origin main
```

推送成功后，刷新GitHub页面就能看到代码了！

### 第三步：Railway部署

1. 打开 https://railway.app
2. 点击 `Login with GitHub`（用GitHub账号登录）
3. 点击 `New Project` → `Deploy from GitHub repo`
4. 选择 `stratomind-backend` 仓库
5. 点击 `Deploy Now`

### 第四步：配置环境变量

1. 部署开始后，点击项目进入详情
2. 点击 `Settings` → `Environment Variables`
3. 点击 `Add Variable`，依次添加：

| 变量名 | 值（直接复制粘贴） |
|--------|------------------|
| DATABASE_URL | `postgresql://neondb_owner:npg_Fr32cXwVNtAz@ep-delicate-dream-a17q2a53-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require` |
| JWT_SECRET | `stratomind-2024-jwt-secure-key-abc123` |
| FRONTEND_URL | `https://stratomind.vercel.app` |

4. 添加完变量后，Railway会自动重新部署

### 第五步：获取API地址

1. 等待1-2分钟部署完成
2. 点击项目 → `Settings` → `Networking`
3. 点击 `Generate Domain`
4. 复制显示的URL，这就是你的API地址！

---

## 📱 修改前端连接后端

部署完成后，修改前端代码：

1. 打开 `vercel-deploy/src/services/api.ts`
2. 找到第5行：
   ```typescript
   baseURL: '/api',
   ```
3. 改成你的Railway URL：
   ```typescript
   baseURL: 'https://你的railway地址.up.railway.app/api',
   ```
4. 保存后重新部署Vercel前端

---

## ✅ 验证部署成功

在浏览器打开：
```
https://你的railway地址.up.railway.app/api/health
```

如果看到 `{"status":"ok"}` 就成功了！

---

## ❓ 常见问题

### Q: Railway显示部署失败怎么办？
A: 点击失败的部署，查看日志。常见错误：
- DATABASE_URL 错误 → 检查环境变量是否完整复制
- Build失败 → 联系助手

### Q: 可以用其他数据库吗？
A: 可以，但需要注册新的数据库服务并替换DATABASE_URL。

### Q: 需要配置DeepSeek API Key吗？
A: 可选。不配置也能使用基础功能，AI分析会返回模拟数据。

---

## 📁 项目文件结构

```
stratomind-backend/
├── src/
│   ├── index.ts          # 主入口
│   ├── middleware/       # 中间件（认证）
│   ├── routes/           # API路由
│   │   ├── auth.ts       # 认证（注册/登录）
│   │   ├── project.ts    # 项目管理
│   │   ├── ai.ts         # AI功能
│   │   ├── member.ts     # 会员系统
│   │   ├── points.ts     # 积分系统
│   │   ├── asset.ts      # 资产库
│   │   ├── knowledge.ts  # 知识库
│   │   └── init.ts       # 数据库初始化
│   └── services/         # 服务层
├── prisma/
│   └── schema.prisma     # 数据库模型
├── railway.json          # Railway配置
├── package.json
└── DEPLOY_STEPS.md       # 详细部署步骤
```

---

有任何问题随时联系助手！🎉
