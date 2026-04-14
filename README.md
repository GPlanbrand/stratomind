# 品牌策划工作台 (Brand Craft Workspace)

智能品牌策略规划与管理平台，基于 React + TypeScript + Vercel 构建。

## 🚀 快速部署到 Vercel

### 方法一：使用 Vercel CLI（推荐）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 进入项目目录
cd vercel-deploy

# 4. 部署到预览环境
vercel

# 5. 部署到生产环境
vercel --prod
```

### 方法二：使用 GitHub 集成

1. 将 `vercel-deploy` 文件夹内容推送到 GitHub 仓库
2. 访问 [vercel.com/new](https://vercel.com/new)
3. 导入您的 GitHub 仓库
4. Vercel 会自动检测为 Vite + React 项目
5. 点击 Deploy 部署

### 方法三：直接上传

1. 访问 [vercel.com/new](https://vercel.com/new)
2. 选择 "Import Third-Party Project"
3. 选择 "Deploy via CLI"
4. 按照指示操作

## 🌐 绑定自定义域名

### 步骤 1：获取部署URL

部署成功后，您会获得一个 `.vercel.app` 域名，例如：
```
https://your-project.vercel.app
```

### 步骤 2：配置 DNS

在您的域名 DNS 设置中添加以下记录：

| 类型 | 名称 | 值 |
|------|------|-----|
| CNAME | www | cname.vercel-dns.com |
| A | @ | 76.76.21.21 |

### 步骤 3：在 Vercel 添加域名

1. 进入项目 Dashboard
2. 点击 Settings → Domains
3. 输入您的域名：`stratomind.cn`
4. 点击 Add
5. 验证 DNS 配置
6. 等待 SSL 证书自动生成

### 步骤 4：验证域名

域名配置完成后，访问 `https://stratomind.cn` 确认正常显示。

## 📁 项目结构

```
vercel-deploy/
├── public/
│   └── vite.svg
├── src/
│   ├── components/          # UI 组件
│   │   ├── BriefStep.tsx
│   │   ├── ClientInfoStep.tsx
│   │   ├── CompetitorStep.tsx
│   │   ├── Layout.tsx
│   │   ├── RequirementsStep.tsx
│   │   └── StrategyStep.tsx
│   ├── pages/               # 页面组件
│   │   ├── HomePage.tsx
│   │   └── WorkspacePage.tsx
│   ├── services/            # API 服务
│   │   └── api.ts
│   ├── types/                # TypeScript 类型
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vercel.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## ✨ 功能特性

- 🎯 **5步品牌策划流程**：客户背景 → 项目需求 → 竞品分析 → 创意简报 → 创意策略
- 💾 **本地存储**：使用 LocalStorage 保存数据，开箱即用
- 🎨 **现代化UI**：渐变色卡片、流畅动画、专业品牌策划界面
- 📱 **响应式设计**：适配桌面和移动设备
- 🔒 **数据安全**：所有数据存储在用户本地浏览器

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🔧 环境要求

- Node.js 18+
- npm 9+ 或 pnpm 8+

## 📝 注意事项

1. **数据存储**：当前版本使用浏览器 LocalStorage，适合个人使用。多人协作需要后端支持。
2. **Vercel 域名**：国内访问 Vercel 可能有延迟，建议配合 CDN 或使用国内平台。
3. **SSL 证书**：Vercel 自动提供 Let's Encrypt 证书。

## 🤝 获取帮助

- Vercel 文档：https://vercel.com/docs
- 域名配置指南：https://vercel.com/docs/concepts/projects/domains

---

**Made with ❤️ for Brand Strategy**
