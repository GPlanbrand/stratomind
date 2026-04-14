# 品牌策划工作台 Vercel 部署指南

## 📦 已完成的交付物

**项目位置**：`./vercel-deploy/`

### 项目结构
```
vercel-deploy/
├── README.md              # 完整部署文档
├── deploy.sh              # 快速部署脚本
├── vercel.json            # Vercel 配置文件
├── package.json           # 依赖配置
├── vite.config.ts         # Vite 构建配置
├── tailwind.config.js     # Tailwind CSS 配置
├── index.html             # 入口 HTML
├── src/
│   ├── components/        # 6个UI组件
│   ├── pages/             # 2个页面组件
│   ├── services/          # API服务（本地存储）
│   └── types/             # TypeScript类型定义
```

---

## 🚀 部署步骤（3选1）

### 方案一：Vercel CLI（推荐）

```bash
# 1. 进入项目目录
cd vercel-deploy

# 2. 登录 Vercel
vercel login

# 3. 部署预览版
vercel

# 4. 部署正式版
vercel --prod
```

### 方案二：GitHub 集成

1. 将 `vercel-deploy` 内容推送到 GitHub 仓库
2. 访问 https://vercel.com/new
3. 导入仓库，自动检测为 Vite 项目
4. 点击 Deploy

### 方案三：拖拽上传

1. 访问 https://vercel.com/new
2. 选择 "Import Third-Party Project"
3. 将项目文件夹拖入

---

## 🌐 绑定域名 stratomind.cn

### 步骤1：部署后获取 URL
部署成功后会获得：`https://xxx.vercel.app`

### 步骤2：DNS 配置
在域名 stratomind.cn 的 DNS 设置中添加：

| 类型 | 主机记录 | 记录值 |
|------|----------|--------|
| CNAME | www | cname.vercel-dns.com |
| A | @ | 76.76.21.21 |

### 步骤3：Vercel 添加域名
1. 进入项目 Dashboard
2. Settings → Domains
3. 添加 `stratomind.cn`
4. 验证并等待 SSL 证书（自动生成）

---

## ✅ Vercel 优势

| 特性 | 说明 |
|------|------|
| 免费额度 | Hobby 计划免费使用 |
| 自动 HTTPS | Let's Encrypt 证书 |
| 全球 CDN | 近实时部署 |
| 自定义域名 | 免费绑定 stratomind.cn |
| 国内访问 | 使用 Vercel 中国镜像（vercel-cn.com）或配置 CDN |

---

## 📝 注意事项

1. **数据存储**：当前版本使用 LocalStorage，适合个人/小团队使用
2. **多人协作**：需要后续添加后端服务
3. **国内访问**：Vercel 在国内速度一般，可考虑：
   - 使用 Vercel 中国站（需备案）
   - 接入国内 CDN
   - 使用 Netlify/Vercel + Cloudflare

---

## 🎯 后续建议

1. **数据库**：可选 Supabase（免费）/ MongoDB Atlas
2. **用户系统**：可选 Auth0 / Supabase Auth
3. **国内部署**：如需更好国内访问，可迁移到：
   - 阿里云 OSS + CDN
   - 腾讯云 COS + CDN
   - Cloudflare Pages（国内访问较慢）

---

**部署完成时间**：约5-10分钟
**技术支持**：Vercel 官方文档 https://vercel.com/docs
