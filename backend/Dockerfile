# 使用 node:18 镜像，比 alpine 更稳定，镜像拉取更快
FROM node:18-slim

WORKDIR /app

# 先复制 prisma 目录（npm install 的 postinstall 需要它）
COPY prisma ./prisma/

# 复制 package 文件
COPY package*.json ./

# 安装依赖（postinstall 会自动运行 prisma generate）
RUN npm install --prefer-offline

# 复制源代码
COPY tsconfig.json ./
COPY src ./src/

# 构建 TypeScript
RUN npm run build

# 创建非 root 用户（使用已存在的 node 用户）
RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]
