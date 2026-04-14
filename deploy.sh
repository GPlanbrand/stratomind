#!/bin/bash
# Vercel 快速部署脚本

echo "========================================"
echo "品牌策划工作台 - Vercel 部署脚本"
echo "========================================"

# 检查是否安装 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未安装 npm，请先安装 Node.js"
    exit 1
fi

# 进入项目目录
cd "$(dirname "$0")"

echo "📦 安装依赖..."
npm install

echo "🔧 安装 Vercel CLI..."
npm install -g vercel

echo ""
echo "========================================"
echo "✅ 准备完成！"
echo "========================================"
echo ""
echo "下一步操作："
echo "1. 运行 'vercel login' 登录 Vercel"
echo "2. 运行 'vercel' 部署到预览环境"
echo "3. 运行 'vercel --prod' 部署到生产环境"
echo ""
echo "绑定自定义域名 stratomind.cn："
echo "1. 部署后在 Vercel Dashboard > Settings > Domains"
echo "2. 添加 stratomind.cn"
echo "3. 配置 DNS 记录指向 Vercel"
echo ""
echo "========================================"
