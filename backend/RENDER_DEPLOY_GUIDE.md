# 🚀 灵思AI后端 - Render.com 部署指南

> 适合零基础用户的中文部署教程

---

## 📋 部署前准备

### 你需要准备：
1. **GitHub 账号**（如果没有，请访问 https://github.com 免费注册）
2. **代码已推送到 GitHub**（后端代码仓库）
3. **Render 账号**（使用 GitHub 登录：https://dashboard.render.com）

---

## 🔧 第一步：将代码推送到 GitHub

如果你还没有推送代码到 GitHub，按以下步骤操作：

### 方法 A：使用命令行（推荐）

```bash
# 1. 进入后端目录
cd ./vercel-deploy/backend

# 2. 初始化 Git（如果还没有）
git init

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "Initial commit"

# 5. 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/stratomind-backend.git

# 6. 推送代码
git branch -M main
git push -u origin main
```

### 方法 B：使用 GitHub Desktop
1. 下载 GitHub Desktop：https://desktop.github.com
2. 登录你的 GitHub 账号
3. 点击 "File" → "Add Local Repository"
4. 选择 `./vercel-deploy/backend` 文件夹
5. 点击 "Publish repository"
6. 设置仓库名为 `stratomind-backend`

---

## 🎯 第二步：在 Render 上创建 Web Service

### 步骤 1：登录 Render
1. 打开 https://dashboard.render.com
2. 点击 **"Sign in with GitHub"** 按钮
3. 授权 Render 访问你的 GitHub 仓库

### 步骤 2：创建新的 Web Service
1. 点击 Dashboard 顶部的 **"New +"** 按钮
2. 选择 **"Web Service"**
3. 在 "Connect a repository" 页面：
   - 找到你的 `stratomind-backend` 仓库
   - 点击右侧的 **"Connect"** 按钮

### 步骤 3：配置服务设置

在配置页面填写以下信息：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Name** | `stratomind-api` | 服务的名称，将成为你的 API 地址的一部分 |
| **Region** | `Singapore` | 选择亚太区域，访问 Neon 数据库更快 |
| **Branch** | `main` | 你的代码分支 |
| **Root Directory** | （留空） | 保持默认 |
| **Runtime** | `Node` | 使用 Node.js 环境 |
| **Build Command** | `npm install && npx prisma generate && npm run build` | 安装依赖并构建 |
| **Start Command** | `npm run start` | 启动服务 |
| **Plan** | `Free` | 免费套餐足够测试使用 |

### 步骤 4：设置环境变量

点击 **"Environment"** 部分，添加以下环境变量：

> ⚠️ **重要**：复制以下内容，**不要直接使用示例值**！

```
DATABASE_URL = postgresql://neondb_owner:npg_Fr32cXwVNtAz@ep-delicate-dream-a17q2a53-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

JWT_SECRET = stratomind-2024-jwt-secure-key-abc123

FRONTEND_URL = https://stratomind.vercel.app

NODE_ENV = production
```

### 步骤 5：启动部署

1. 检查所有配置是否正确
2. 点击页面底部的 **"Create Web Service"** 按钮
3. 等待构建完成（通常需要 2-5 分钟）

---

## ⏳ 第三步：等待部署完成

### 观察部署状态：
- **Building**：正在安装依赖和构建项目（🟡 黄色）
- **Deployed**：部署成功（🟢 绿色）
- **Failed**：部署失败（🔴 红色）

### 如果部署失败：
1. 点击失败的构建日志查看具体错误
2. 常见问题及解决方案：

| 错误类型 | 解决方案 |
|---------|---------|
| `npm install failed` | 检查 package.json 是否有语法错误 |
| `prisma generate failed` | 确保 DATABASE_URL 正确 |
| `Cannot connect to database` | 检查 Neon 数据库是否允许 Render 的 IP |
| `Port already in use` | 修改 .env 中的 PORT 设置 |

---

## ✅ 第四步：验证部署成功

### 1. 检查健康状态
在浏览器中打开：
```
https://stratomind-api.onrender.com/health
```

如果返回以下内容，说明部署成功：
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 2. 记录你的 API 地址

部署成功后，你的 API 地址是：
```
https://stratomind-api.onrender.com
```

**保存这个地址**，稍后需要更新前端配置。

---

## 📱 第五步：更新前端配置

### 1. 修改前端的 API 地址配置

找到前端代码中的 API 配置，修改为你的 Render API 地址：

```typescript
// 如果你的前端代码中有 API 配置，更新为：
const API_BASE_URL = 'https://stratomind-api.onrender.com';
```

### 2. 更新 CORS 配置（如果需要）

如果前端域名不在允许列表中，在 Render Dashboard 中修改 `FRONTEND_URL` 环境变量。

---

## 🔒 安全建议

### 1. 修改 JWT_SECRET
> ⚠️ 在生产环境中，**强烈建议**修改 JWT_SECRET 为一个随机字符串：

```bash
# 生成随机密钥（在线工具：https://randomkeygen.com/）
# 选择 "CodeIgniter Encryption Keys" 或 "Laravel Encryption Keys"
```

### 2. 保护 DATABASE_URL
- 在 Render 中，环境变量默认是加密的
- **不要**将 DATABASE_URL 提交到 GitHub

---

## 💡 常见问题 FAQ

### Q1: 免费套餐有什么限制？
- 每月 750 小时免费使用时间
- 服务在 15 分钟无活动后进入休眠
- 再次访问时需要 30 秒启动时间
- 不能绑定自定义域名

### Q2: 如何升级到付费套餐？
1. 在 Render Dashboard 点击你的服务
2. 点击 "Plan" 选项
3. 选择 "Starter" 或 "Pro"
4. 输入信用卡信息

### Q3: 如何查看日志？
1. 在服务页面点击 "Logs" 标签
2. 可以看到实时的构建和运行日志

### Q4: 如何重新部署？
- 方法 1：在 Dashboard 点击 "Manual Deploy" → "Deploy latest commit"
- 方法 2：推送新代码到 GitHub，Render 会自动部署

### Q5: 数据库连接失败怎么办？
1. 确认 Neon 数据库的连接字符串正确
2. 检查 Neon Dashboard 的 Connection Restrictions 设置
3. 如果使用 IP Allowlist，Render 的 IP 可能是动态的

---

## 📞 获取帮助

如果遇到问题：
1. 查看 Render 文档：https://render.com/docs
2. 查看服务日志定位问题
3. 在 GitHub 提交 Issue 寻求帮助

---

## 🎉 恭喜！

如果一切顺利，你的 API 后端已经成功部署到 Render 上了！

**你的 API 地址**：`https://stratomind-api.onrender.com`

**健康检查**：`https://stratomind-api.onrender.com/health`

---

*文档版本：v1.0 | 更新时间：2024年*
