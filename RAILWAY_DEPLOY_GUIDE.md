# 🚂 Railway 部署指南（小白版）

## 代码已修复并推送

修复内容：
- ✅ 将 Docker 基础镜像从 `node:18-alpine` 改为 `node:18-slim`（避免网络超时）
- ✅ 优化了 railway.json 配置
- ✅ 简化了 .dockerignore
- ✅ 代码已推送到 GitHub

---

## 📋 Railway 部署步骤

### 第一步：登录 Railway

1. 打开浏览器访问：**https://railway.app**
2. 点击 **"Login"** 登录
3. 选择登录方式（推荐用 **GitHub** 登录，方便后续授权）
4. 授权 Railway 访问你的 GitHub 仓库

### 第二步：创建新项目

1. 登录后，点击 **"New Project"**（新建项目）
2. 选择 **"Deploy from GitHub repo"**（从 GitHub 仓库部署）
3. 在列表中找到你的仓库：`GPlanbrand/stratomind`
4. 点击选中它

### 第三步：配置 Root Directory（关键步骤！）

⚠️ **这步很重要！必须设置！**

1. 项目创建后，进入项目设置页面
2. 找到 **"Root Directory"**（根目录）设置
3. 输入：`backend`
4. 保存设置

### 第四步：配置环境变量

1. 在项目页面，点击 **"Variables"**（变量）标签
2. 点击 **"New Variable"**（新建变量）
3. 逐一添加以下环境变量：

| 变量名 | 值（复制下面的） |
|--------|-----------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_Fr32cXwVNtAz@ep-delicate-dream-a17q2a53-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require` |
| `JWT_SECRET` | `stratomind-2024-jwt-secure-key-abc123` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

4. 每添加一个变量后，记得点击 **"Add Variable"** 或按回车保存

### 第五步：等待构建和部署

1. Railway 会自动检测到 Dockerfile 并开始构建
2. 构建过程大约需要 **2-5 分钟**
3. 你可以看到实时构建日志

### 第六步：获取访问地址

1. 部署成功后，Railway 会分配一个 URL
2. URL 格式类似：`https://stratomind-backend.up.railway.app`
3. 在项目页面 **"Settings"** → **"Networking"** 中可以找到
4. 点击 **"Public Networking"** → **"Generate Domain"** 生成公共域名

---

## ⚠️ 常见问题

### Q1: 构建失败，提示找不到 prisma
**解决方案**：确保设置了 Root Directory = `backend`

### Q2: 构建超时
**解决方案**：这是之前的问题，代码已修复。如果仍超时，点击 **"Redeploy"** 重试一次。

### Q3: 数据库连接失败
**解决方案**：检查 DATABASE_URL 是否正确复制了完整的值

### Q4: 如何查看构建日志？
**解决方案**：点击项目中的 **"Deployments"** 标签 → 点击最新的部署 → 查看日志

---

## ✅ 验证部署成功

部署成功后，访问你的 API 地址，例如：
```
https://xxx.up.railway.app/api/health
```
或
```
https://xxx.up.railway.app/api/users/me
```

如果返回 JSON 响应，说明部署成功！

---

## 📱 下一步

1. 复制 Railway 提供的后端 URL
2. 更新你的前端代码中的 API 地址
3. 部署前端到 Vercel
