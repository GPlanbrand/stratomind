FROM node:18-alpine

# 安装 OpenSSL 和构建工具
RUN apk add --no-cache openssl

WORKDIR /app

# 复制 package 文件和 prisma
COPY package*.json ./
COPY prisma ./prisma/

# 安装所有依赖
RUN npm install

# 复制源代码
COPY tsconfig.json ./
COPY src ./src/

# 构建 TypeScript
RUN npm run build

# 保留 prisma CLI 用于数据库迁移
# 不要运行 npm prune

EXPOSE 3000

# 启动时先运行数据库迁移，然后启动服务
CMD npx prisma db push --skip-generate && node dist/index.js
