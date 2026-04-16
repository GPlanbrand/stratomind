# Electron 桌面版配置清单

## ✅ 已完成配置

### 1. Electron 主进程
- `electron/main.ts` - 主进程入口，包含窗口管理、系统托盘、桌面通知等
- `electron/preload.ts` - 预加载脚本，安全暴露 API 给渲染进程

### 2. 打包配置
- `electron-builder.yml` - electron-builder 完整配置
- 支持 Windows (.exe) 和 macOS (.dmg)
- 支持 Windows x64 和 macOS x64/arm64

### 3. 构建脚本
- `scripts/generate-icons.js` - 自动生成应用图标
- `scripts/electron-build.js` - 构建辅助脚本

### 4. 配置文件
- `electron/tsconfig.json` - Electron TypeScript 配置
- `package.json` - 已更新，添加 Electron 相关依赖和脚本
- `vite.config.ts` - 已更新，优化 Electron 构建
- `LICENSE.txt` - MIT 许可证

### 5. 文档
- `ELECTRON_README.md` - 完整使用指南
- `ELECTRON_QUICKSTART.md` - 快速入门指南
- `build/README.md` - 图标设置指南

## 🚀 打包命令

### 一条命令打包
```bash
npm run build:electron
```

### 分平台打包
```bash
# 只打包 Windows
npm run build:electron:win

# 只打包 macOS
npm run build:electron:mac
```

### 开发模式
```bash
npm run start:electron
```

## 📦 打包输出

| 平台 | 文件 | 路径 |
|------|------|------|
| Windows | `灵思AI创意工作台-x.x.x-windows-setup.exe` | `release/` |
| macOS | `灵思AI创意工作台-x.x.x-macOS.dmg` | `release/` |

## 🔧 首次打包前

```bash
# 1. 安装依赖 (Electron + electron-builder + sharp)
npm install

# 2. 生成图标 (使用现有 favicon.svg)
npm install sharp --save-dev
node scripts/generate-icons.js

# 3. 开始打包
npm run build:electron
```

## 📁 目录结构

```
vercel-deploy/
├── electron/
│   ├── main.ts              # 主进程
│   ├── preload.ts           # 预加载脚本
│   └── tsconfig.json        # TypeScript 配置
├── scripts/
│   ├── generate-icons.js    # 图标生成脚本
│   └── electron-build.js    # 构建辅助脚本
├── build/
│   ├── icon.png             # 应用图标 (256x256)
│   └── README.md            # 图标设置说明
├── electron-builder.yml     # 打包配置
├── package.json             # 包含 Electron 脚本
└── release/                 # 打包输出目录
```

## 💡 功能特性

- 🖥️ 系统托盘运行（最小化到托盘）
- 🔔 桌面通知支持
- 🪟 窗口控制（最小化/最大化/关闭）
- 🌐 外部链接自动使用浏览器打开
- 📱 支持 Windows x64 和 macOS x64/arm64

## ⚠️ 注意事项

1. 图标生成需要先运行 `npm install sharp --save-dev`
2. Windows 打包需要 Windows 系统，macOS 打包需要 macOS 系统
3. 杀毒软件可能会误报 Electron 应用（正常现象）
