# 灵思AI创意工作台 - 快速入门指南

## 🚀 一键打包

### Windows 用户
```bash
npm install
npm install sharp --save-dev
node scripts/generate-icons.js
npm run build:electron
```

### macOS 用户
```bash
npm install
npm install sharp --save-dev
node scripts/generate-icons.js
npm run build:electron
```

打包完成后，`release/` 文件夹中会有：
- **Windows**: `灵思AI创意工作台-x.x.x-windows-setup.exe`
- **macOS**: `灵思AI创意工作台-x.x.x-macOS.dmg`

## 📁 文件说明

| 文件/目录 | 说明 |
|-----------|------|
| `electron/` | Electron 主进程代码 |
| `electron/main.ts` | 主进程入口 |
| `electron/preload.ts` | 预加载脚本 (安全桥接) |
| `electron-builder.yml` | 打包配置文件 |
| `scripts/` | 构建脚本 |
| `build/` | 应用图标位置 |
| `release/` | 打包输出目录 |

## 🎨 自定义图标

将你的图标图片放到 `build/` 目录：
- `icon.png` - 256x256 PNG (必填)
- `icon.ico` - Windows 图标
- `icon.icns` - macOS 图标

然后运行：
```bash
node scripts/generate-icons.js
```

## 💡 常用命令

```bash
# 开发模式启动
npm run start:electron

# 只构建 Windows 版本
npm run build:electron:win

# 只构建 macOS 版本
npm run build:electron:mac

# 查看所有可用命令
cat package.json | grep -A 20 '"scripts"'
```

## ❓ 常见问题

**Q: 提示找不到 electron?**
```bash
npm install
```

**Q: 提示找不到 sharp?**
```bash
npm install sharp --save-dev
```

**Q: Windows 杀毒软件报警?**
正常现象，Electron 应用都会被误报，代码完全开源安全。

**Q: macOS 无法打开?**
在设置-安全性中允许运行即可。

## 📞 获取帮助

如有问题，请查看完整文档：
- [Electron 使用指南](./ELECTRON_README.md)
- [图标设置指南](./build/README.md)
