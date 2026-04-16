# 灵思AI创意工作台 - 图标设置指南

## 图标要求

Electron 桌面应用需要以下格式的图标：

### Windows (.ico)
- 256x256 像素
- ICO 格式 (包含多个尺寸)

### macOS (.icns)
- 至少 512x512 像素
- ICNS 格式

### Linux
- 多种尺寸: 16, 32, 48, 64, 128, 256, 512 像素
- PNG 格式

## 自动生成 (推荐)

```bash
# 1. 安装 sharp 库
npm install sharp --save-dev

# 2. 运行图标生成脚本
node scripts/generate-icons.js
```

## 手动获取

如果你有设计好的图标，请将它们放置到 `build/` 目录：

```
build/
├── icon.png          # 256x256 PNG (Windows/Mac 基础图标)
├── icon.ico          # Windows ICO 格式
├── icon.icns         # macOS ICNS 格式
└── icons/            # Linux 图标集
    ├── 16x16.png
    ├── 32x32.png
    ├── 48x48.png
    ├── 64x64.png
    ├── 128x128.png
    ├── 256x256.png
    └── 512x512.png
```

## 在线转换工具

如果手动转换图标，可以使用以下在线工具：

### SVG 转 PNG/ICO
- https://www.iloveimg.com/resize-image/resize-svg
- https://convertio.co/png-ico/

### PNG 转 ICO
- https://www.icoconverter.com/
- https://convertio.co/png-ico/

### PNG 转 ICNS
- https://iconvertmac.com/

## 临时图标

如果暂时没有图标，构建过程会自动创建一个默认图标（紫色方块），但建议尽快替换为正式图标。

## 预览图标

生成图标后，可以使用以下命令验证：

```bash
ls -la build/
```
