FROM node:18-alpine

# 安装 OpenSSL 和构建工具
RUN apk add --no-cache openssl

WORKDIR /app

# 复制 package 文件和 prisma
COPY package*.json ./
COPY prisma ./prisma/

# 安装所有依赖（包括 devDependencies 用于构建）
RUN npm install

# 复制源代码
COPY tsconfig.json ./
COPY src ./src/

# 构建 TypeScript
RUN npm run build

# 删除 devDependencies 减小镜像大小
RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/index.js"]
