FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production

COPY prisma ./prisma/
RUN npx prisma generate

COPY src ./src/
COPY tsconfig.json ./
RUN npm install -g typescript && tsc

EXPOSE 3000

CMD ["node", "dist/index.js"]
