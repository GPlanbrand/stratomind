FROM node:18-alpine

WORKDIR /app

# 先复制 prisma 和 package.json
COPY prisma ./prisma/
COPY package.json ./

# 安装依赖
RUN npm install

# 生成Prisma客户端（指定schema路径）
RUN npx prisma generate --schema=./prisma/schema.prisma

# 复制所有其他文件
COPY . .

# 编译TypeScript
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
