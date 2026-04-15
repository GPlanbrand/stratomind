#!/bin/bash
# GitHub 自动化部署脚本

echo "=========================================="
echo "灵思AI创意工作台 - GitHub Actions 部署"
echo "=========================================="

# 创建 .github/workflows 目录
mkdir -p .github/workflows

# 创建部署配置文件
cat > .github/workflows/deploy.yml << 'YAML'
name: Deploy to Vercel

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
YAML

echo "GitHub Actions 配置已创建"
echo ""
echo "下一步:"
echo "1. 推送到 GitHub"
echo "2. 在 GitHub 仓库设置中添加 secrets:"
echo "   - VERCEL_TOKEN"
echo "   - VERCEL_ORG_ID" 
echo "   - VERCEL_PROJECT_ID"
echo ""
echo "或手动运行: vercel login && vercel --prod"
