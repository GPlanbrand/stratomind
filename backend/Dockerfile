FROM node:18-alpine

WORKDIR /app

# 复制所有文件
COPY . .

# 安装依赖
RUN npm install

# 生成Prisma客户端
RUN npx prisma generate

# 编译TypeScript
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
