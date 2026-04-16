# Railway 部署指南 - 小白专用

## 🚀 一共只需要5步！

### 第一步：创建GitHub仓库（5分钟）

1. 打开浏览器访问 https://github.com
2. 点击右上角的 `+` 按钮
3. 选择 `New repository`
4. 在 `Repository name` 里填：`stratomind-backend`
5. 选择 `Private`（这样别人看不到你的代码）
6. 点击绿色的 `Create repository` 按钮
7. **重要**：在页面下方找到 "…or push an existing repository from the command line"，复制显示的命令备用

### 第二步：上传代码到GitHub（3分钟）

打开电脑的终端（Mac按Command+空格，搜索"终端"；Windows按Win+R，输入"cmd"），依次执行：

```bash
# 1. 进入后端项目目录
cd stratomind-backend

# 2. 初始化Git仓库（如果还没初始化）
git init

# 3. 添加所有文件
git add .

# 4. 提交代码
git commit -m "Initial commit"

# 5. 把下面的 YOUR_GITHUB_USERNAME 替换成你的GitHub用户名，然后执行
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/stratomind-backend.git

# 6. 推送代码
git branch -M main
git push -u origin main
```

推送成功后，去GitHub刷新刚才创建的仓库页面，就能看到代码了！

### 第三步：在Railway注册并连接GitHub（3分钟）

1. 打开浏览器访问 https://railway.app
2. 点击 `Login` 按钮，用 **GitHub账号登录**（推荐，方便后续操作）
3. 授权GitHub访问
4. 进入主界面后，点击 `New Project`
5. 选择 `Deploy from GitHub repo`
6. 在列表中找到 `stratomind-backend`，点击选中
7. 点击 `Deploy Now`

Railway会自动开始部署！🎉

### 第四步：配置环境变量（2分钟）

部署开始后，你会看到项目页面。按以下步骤添加环境变量：

1. 点击项目卡片进入详情
2. 点击右上角的 `Settings`（设置）
3. 找到 `Environment Variables`（环境变量）
4. 依次添加以下变量（点击 `Add Variable` 每次添加一个）：

| Variable Name (变量名) | Value (值) |
|----------------------|------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_Fr32cXwVNtAz@ep-delicate-dream-a17q2a53-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require` |
| `JWT_SECRET` | `stratomind-2024-jwt-secure-key-abc123` |
| `FRONTEND_URL` | `https://stratomind.vercel.app` |

添加完后，Railway会自动重新部署。

### 第五步：获取API地址（1分钟）

1. 等待部署完成（大约1-2分钟）
2. 点击项目 -> `Settings` -> `Networking`
3. 找到 `Public Networking`，点击 `Generate Domain`
4. 复制显示的URL，类似：`https://stratomind-backend.up.railway.app`

**这就是你的后端API地址！** 记下来，后面修改前端代码时会用到。

---

## ⚠️ 重要提醒

### 数据库说明
代码里已经配置好了你的Neon Postgres数据库（新加坡节点），无需额外创建。

### 如果部署失败
1. 点击项目页面下方的 `Deployments`
2. 点击失败的部署，查看错误日志
3. 常见问题：
   - "DATABASE_URL" 错误 → 检查环境变量是否正确复制
   - Build失败 → 检查GitHub仓库代码是否完整

---

## 📱 部署完成后要做什么

### 修改前端代码

部署完成后，你需要告诉前端在哪里找后端API：

1. 打开文件：`vercel-deploy/src/services/api.ts`
2. 找到第5行左右的内容：
   ```typescript
   const api = axios.create({
     baseURL: '/api',  // ← 把这里改成你的Railway URL
   ```
3. 把 `'/api'` 改成：
   ```
   'https://你的railway地址.up.railway.app/api'
   ```
   例如：`'https://stratomind-backend.up.railway.app/api'`

4. 保存文件，重新部署Vercel前端

### 测试API是否正常

在浏览器中访问：
```
https://你的railway地址.up.railway.app/api/health
```

如果看到 `{"status":"ok",...}` 说明部署成功！

---

## 🎉 恭喜完成！

你现在拥有：
- ✅ 后端API运行在Railway
- ✅ 数据库连接Neon Postgres
- ✅ 前端连接后端API

有任何问题，把错误截图发给助手帮忙看！
