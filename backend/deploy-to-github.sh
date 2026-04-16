#!/bin/bash
# 推送到GitHub的脚本
# 使用方法: ./deploy-to-github.sh YOUR_GITHUB_USERNAME

set -e

GITHUB_USERNAME=${1:-""}

if [ -z "$GITHUB_USERNAME" ]; then
  echo "❌ 请提供GitHub用户名！"
  echo "使用方式: ./deploy-to-github.sh 你的GitHub用户名"
  echo "例如: ./deploy-to-github.sh john"
  exit 1
fi

echo "🚀 开始推送到GitHub..."

# 添加远程仓库
git remote add origin https://github.com/$GITHUB_USERNAME/stratomind-backend.git 2>/dev/null || git remote set-url origin https://github.com/$GITHUB_USERNAME/stratomind-backend.git

# 推送到GitHub
git branch -M main
git push -u origin main --force

echo ""
echo "✅ 推送成功！"
echo ""
echo "📋 下一步操作："
echo "1. 打开 https://github.com/$GITHUB_USERNAME/stratomind-backend 确认代码已上传"
echo "2. 打开 https://railway.app 开始部署"
echo ""
echo "📖 详细部署步骤请查看: DEPLOY_STEPS.md"
