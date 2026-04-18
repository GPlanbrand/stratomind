#!/bin/bash
# 甲乙方传译闭环功能 - Git推送脚本
# 用于将更新推送到GitHub，然后Vercel自动部署

# 进入vercel-deploy目录
cd vercel-deploy

# 初始化Git（如果还没有）
if [ ! -d .git ]; then
    git init
    git remote add origin https://github.com/GPlanbrand/stratomind.git
fi

# 添加所有更改
git add .

# 提交
git commit -m "feat: Add client requirement parser feature - 甲乙方传译闭环功能

- 新增上传组件，支持.mp3、.jpg、.png格式
- 支持拖拽上传，文件大小限制（音频50MB，图片10MB）
- AI解析服务（音频转文字、图片OCR识别）
- 三列表格展示（甲方原文 | 推测意图 | 执行动作）
- 导出功能（CSV/Word）
- 任务联动功能（创建任务按钮）
- 新路由：/projects/client-requirement-parser"

# 推送到GitHub
git push -u origin main --force

echo "代码已推送到GitHub，Vercel将自动部署"
