# 后端API URL 配置说明

## 部署完成后需要修改的内容

当你完成Railway部署后，会获得一个类似这样的URL：
```
https://stratomind-backend.up.railway.app
```

### 修改前端API地址

在 `vercel-deploy/src/services/api.ts` 文件中，将：

```typescript
const api = axios.create({
  baseURL: '/api',  // ← 修改这里
  // ...
})
```

改为：

```typescript
const api = axios.create({
  baseURL: 'https://你的railway-url.up.railway.app/api',  // ← 替换为你的Railway URL
  // ...
})
```

### 推荐的修改方式

为了方便以后切换，建议在 `.env` 文件中配置：

```bash
# vercel-deploy/.env
VITE_API_URL=https://stratomind-backend.up.railway.app/api
```

然后在 `api.ts` 中使用：

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // ...
})
```

## Railway URL 格式

- 预览URL: `https://stratomind-backend.up.railway.app`
- 生产URL: 类似 `https://stratomind-backend.railway.app`

部署完成后，在Railway控制台的Settings -> Networking -> Public Networking可以看到完整的URL。
