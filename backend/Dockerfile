FROM node:18-alpine

WORKDIR /app

# 复制所有文件
COPY . .

# 安装依赖并构建
RUN npm install && npx prisma generate && npm run build

# 暴露端口
EXPOSE 3000

# 启动
CMD ["npm", "run", "start"]
