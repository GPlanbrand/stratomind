# Railway自动构建 - 使用Nixpacks
# 此文件仅为占位，实际构建由nixpacks.toml配置
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
