# 灵思工作台 MVP API 文档

## 基础信息
- 基础URL: `http://localhost:3000`
- 认证方式: JWT Bearer Token
- 编码: UTF-8

---

## 1. 访客临时Token API

### POST /api/auth/guest
生成访客临时Token

**请求示例:**
```bash
curl -X POST http://localhost:3000/api/auth/guest
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "token": "guest_a1b2c3d4e5f6",
    "expireAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /api/auth/guest/:token
验证访客Token

**请求示例:**
```bash
curl http://localhost:3000/api/auth/guest/guest_a1b2c3d4e5f6
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "data": null
  }
}
```

### PUT /api/auth/guest/:token
更新访客临时数据

**请求示例:**
```bash
curl -X PUT http://localhost:3000/api/auth/guest/guest_a1b2c3d4e5f6 \
  -H "Content-Type: application/json" \
  -d '{"data": {"draftProject": {"name": "测试项目"}}}'
```

---

## 2. 手机号验证码 API

### POST /api/auth/sms/send
发送验证码

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| type | string | 否 | 验证码类型，默认 login |

**请求示例:**
```bash
curl -X POST http://localhost:3000/api/auth/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000"}'
```

**响应示例:**
```json
{
  "success": true,
  "message": "验证码发送成功",
  "data": {
    "code": "123456",
    "expireAt": "2024-01-08T10:35:00.000Z"
  }
}
```

**限制说明:**
- 每日最多发送 5 次
- 发送间隔 60 秒
- 验证码有效期 5 分钟

### POST /api/auth/sms/verify
验证码登录/注册

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| code | string | 是 | 6位验证码 |
| guestToken | string | 否 | 访客Token，用于迁移数据 |

**请求示例:**
```bash
curl -X POST http://localhost:3000/api/auth/sms/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "code": "123456", "guestToken": "guest_a1b2c3d4e5f6"}'
```

**响应示例:**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "id": "clm8xxx",
      "phone": "13800138000",
      "nickname": "用户8000",
      "username": "user_13800138",
      "isPaid": false,
      "paidExpireAt": null,
      "memberLevel": "normal",
      "points": 600
    },
    "isNewUser": false,
    "migratedData": null
  }
}
```

---

## 3. 需求确认单 API

**认证要求:** 需要登录 (Bearer Token)

### GET /api/requirements
获取需求确认单列表

**查询参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态: draft, confirmed, archived |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |

**请求示例:**
```bash
curl http://localhost:3000/api/requirements \
  -H "Authorization: Bearer <your_token>"
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": "clm8xxx",
        "userId": "clm7xxx",
        "projectName": "新品上市推广",
        "clientName": "某科技公司",
        "items": [
          {"id": "1", "name": "品牌定位", "value": "年轻化"},
          {"id": "2", "name": "目标受众", "value": "25-35岁"}
        ],
        "status": "draft",
        "createdAt": "2024-01-08T10:00:00.000Z",
        "updatedAt": "2024-01-08T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### GET /api/requirements/:id
获取单个需求确认单详情

**请求示例:**
```bash
curl http://localhost:3000/api/requirements/clm8xxx \
  -H "Authorization: Bearer <your_token>"
```

### POST /api/requirements
创建需求确认单

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectName | string | 是 | 项目名称 |
| clientName | string | 否 | 客户名称 |
| items | array | 否 | 确认单项目数组 |

**请求示例:**
```bash
curl -X POST http://localhost:3000/api/requirements \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "新品上市推广",
    "clientName": "某科技公司",
    "items": [
      {"id": "1", "name": "品牌定位", "value": "年轻化"},
      {"id": "2", "name": "目标受众", "value": "25-35岁"}
    ]
  }'
```

**响应示例:**
```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": "clm8xxx",
    "userId": "clm7xxx",
    "projectName": "新品上市推广",
    "clientName": "某科技公司",
    "items": [...],
    "status": "draft",
    "createdAt": "2024-01-08T10:00:00.000Z",
    "updatedAt": "2024-01-08T10:00:00.000Z"
  }
}
```

### PUT /api/requirements/:id
更新需求确认单

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectName | string | 否 | 项目名称 |
| clientName | string | 否 | 客户名称 |
| items | array | 否 | 确认单项目数组 |
| status | string | 否 | 状态 |

**请求示例:**
```bash
curl -X PUT http://localhost:3000/api/requirements/clm8xxx \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed",
    "items": [
      {"id": "1", "name": "品牌定位", "value": "高端"},
      {"id": "2", "name": "目标受众", "value": "30-40岁"}
    ]
  }'
```

### DELETE /api/requirements/:id
删除需求确认单

**请求示例:**
```bash
curl -X DELETE http://localhost:3000/api/requirements/clm8xxx \
  -H "Authorization: Bearer <your_token>"
```

**响应示例:**
```json
{
  "success": true,
  "message": "删除成功"
}
```

---

## 错误响应格式

```json
{
  "success": false,
  "error": "错误信息描述"
}
```

**常见错误码:**
- 400: 参数错误
- 401: 未登录或登录已过期
- 404: 资源不存在
- 429: 请求过于频繁
- 500: 服务器内部错误

---

## 测试建议

1. **访客流程测试:**
   - POST /api/auth/guest → 获取访客Token
   - PUT /api/auth/guest/:token → 存储临时数据
   - POST /api/auth/sms/send → 发送验证码
   - POST /api/auth/sms/verify (带guestToken) → 登录并迁移数据

2. **需求确认单测试:**
   - POST /api/auth/sms/verify → 登录获取Token
   - POST /api/requirements → 创建确认单
   - GET /api/requirements → 获取列表
   - PUT /api/requirements/:id → 更新确认单
   - DELETE /api/requirements/:id → 删除确认单
