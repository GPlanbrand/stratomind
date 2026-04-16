# 使用 node:18 镜像，比 alpine 更稳定，镜像拉取更快
FROM node:18-slim

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm install --prefer-offline

# 复制 prisma schema 并生成客户端
COPY prisma ./prisma/
RUN npx prisma generate --schema=./prisma/schema.prisma

# 复制源代码
COPY tsconfig.json ./
COPY src ./src/

# 构建 TypeScript
RUN npm run build

# 创建非 root 用户
RUN useradd -m -u 1000 nodeapp && chown -R nodeapp:nodeapp /app
USER nodeapp

EXPOSE 3000

CMD ["node", "dist/index.js"]
