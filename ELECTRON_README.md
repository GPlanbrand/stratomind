# 灵思AI创意工作台 - Electron 桌面版

基于 Electron 的桌面应用，支持 Windows 和 macOS 系统。

## 功能特性

- 🖥️ 桌面原生体验
- 🔔 系统通知支持
- 📌 系统托盘运行
- 🪟 窗口管理（最小化、最大化、关闭）
- 🌐 外部链接自动使用浏览器打开

## 快速开始

### 方式一：使用已构建版本

1. 进入 [release](release/) 目录
2. Windows 用户运行 `.exe` 安装包
3. macOS 用户运行 `.dmg` 安装包

### 方式二：从源码构建

#### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Windows 用户需要 Windows 10+ 和 [WiX Toolset](https://wixtoolset.org/) (自动安装)
- macOS 用户需要 macOS 10.15+

#### 构建步骤

```bash
# 1. 安装依赖
npm install

# 2. 生成应用图标 (需要 sharp)
npm install sharp --save-dev
node scripts/generate-icons.js

# 3. 构建 Electron 应用
npm run build:electron
```

构建完成后，安装包位于 `release/` 目录：

- Windows: `灵思AI创意工作台-x.x.x-windows-setup.exe`
- macOS: `灵思AI创意工作台-x.x.x-macOS.dmg`

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动前端开发服务器 |
| `npm run build` | 构建前端 |
| `npm run preview` | 预览前端构建结果 |
| `npm run build:electron` | 构建 Electron 桌面应用 |
| `npm run start:electron` | 开发模式启动 Electron |
| `npm run start:electron:prod` | 使用已构建版本启动 Electron |

## 开发说明

### 项目结构

```
├── electron/
│   ├── main.ts          # Electron 主进程
│   └── preload.ts       # 预加载脚本
├── build/                # 构建资源 (图标等)
├── public/               # 公共资源
├── dist/                 # 前端构建输出
├── release/              # Electron 打包输出
└── scripts/
    └── generate-icons.js # 图标生成脚本
```

### 渲染进程调用 Electron API

```typescript
// 发送桌面通知
await window.electronAPI.showNotification('标题', '内容');

// 获取应用版本
const version = await window.electronAPI.getAppVersion();

// 获取平台
const platform = await window.electronAPI.getPlatform(); // 'win32' | 'darwin' | 'linux'

// 窗口控制
await window.electronAPI.windowMinimize();
await window.electronAPI.windowMaximize();
await window.electronAPI.windowClose();
```

## 常见问题

### Q: macOS 提示"无法打开，因为来自未识别的开发者"

在"系统偏好设置" > "安全性与隐私" > "通用"中，点击"仍要打开"。

### Q: Windows 杀毒软件报毒

这是 Electron 应用的常见现象。代码完全开源无恶意行为，可放心使用。

### Q: 如何更新应用?

重新运行构建命令，覆盖安装即可。

## 许可证

MIT License
