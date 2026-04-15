#!/bin/bash
# 一键部署脚本

echo "开始部署到 Vercel..."

# 检查是否有 Vercel token
if [ -z "$VERCEL_TOKEN" ]; then
    echo "请设置 VERCEL_TOKEN 环境变量"
    echo "或者手动运行: vercel login && vercel --prod"
    exit 1
fi

# 部署
npx vercel --token=$VERCEL_TOKEN --prod --yes
