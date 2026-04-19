# 灵思工作台 MVP API 文档

## 基础信息

- 基础URL: `https://stratomind.vercel.app/api` (生产环境)
- 本地URL: `http://localhost:3000/api`
- 认证方式: JWT Bearer Token
- 编码: UTF-8
- 通用响应格式: `{ success: true/false, data/message/error: ... }`

---

## 1. 用户认证 API (`/api/auth`)

### POST /api/auth/register
用户注册

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |
| username | string | 是 | 用户名 |

**请求示例:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "123456", "username": "张三"}'
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clm8xxx",
      "email": "user@example.com",
      "username": "张三"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}
```

---

### POST /api/auth/login
用户登录

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |

**请求示例:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "123456"}'
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clm8xxx",
      "email": "user@example.com",
      "username": "张三"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}
```

---

### POST /api/auth/signin
签到（需要登录）

**认证要求:** Bearer Token

**请求示例:**
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Authorization: Bearer <your_token>"
```

**响应示例:**
```json
{
  "success": true,
  "message": "签到成功",
  "data": {
    "points": 10,
    "userId": "clm8xxx"
  }
}
```

---

### GET /api/auth/me
获取当前用户信息（需要登录）

**认证要求:** Bearer Token

**请求示例:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your_token>"
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "clm8xxx",
    "email": "user@example.com",
    "username": "张三"
  }
}
```

---

## 2. 访客临时Token API (`/api/auth/guest`)

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
    "token": "guest_a1b2c3d4",
    "expireAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### GET /api/auth/guest/:token
验证访客Token

**请求示例:**
```bash
curl http://localhost:3000/api/auth/guest/guest_a1b2c3d4
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

---

### PUT /api/auth/guest/:token
更新访客临时数据

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| data | object | 是 | 要存储的临时数据 |

**请求示例:**
```bash
curl -X PUT http://localhost:3000/api/auth/guest/guest_a1b2c3d4 \
  -H "Content-Type: application/json" \
  -d '{"data": {"draftProject": {"name": "测试项目"}}}'
```

**响应示例:**
```json
{
  "success": true,
  "message": "访客数据更新成功"
}
```

---

## 3. 手机号验证码 API (`/api/auth/sms`)

### POST /api/auth/sms/send
发送验证码

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号（1开头11位） |
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
- 开发环境直接返回验证码

---

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
  -d '{"phone": "13800138000", "code": "123456", "guestToken": "guest_a1b2c3d4"}'
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

## 4. AI 对话 API (`/api/ai-chat`)

### POST /api/ai-chat
AI 聊天对话（支持流式响应）

**认证要求:** Bearer Token

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| message | string | 是* | 消息内容（images为空时必填） |
| images | array | 是* | 图片URL数组（message为空时必填） |
| projectId | string | 否 | 关联项目ID |
| projectName | string | 否 | 关联项目名称 |
| history | array | 否 | 历史对话记录 `[{role, content}]` |

**请求示例 (非流式):**
```bash
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "帮我生成一个品牌策略"}'
```

**响应示例 (非流式):**
```json
{
  "success": true,
  "data": {
    "response": "好的，我来帮您制定品牌策略...",
    "provider": "deepseek"
  }
}
```

**请求示例 (流式):**
```bash
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"message": "帮我生成一个品牌策略"}'
```

**流式响应格式:**
```
data: {"content": "好的，"}
data: {"content": "我来"}
data: {"content": "帮您"}
data: {"done": true, "content": "完整回复内容"}
```

**AI提供商配置:**
- DeepSeek: 需要配置 `DEEPSEEK_API_KEY`
- 豆包: 需要配置 `DOUBAO_API_KEY`

---

## 5. AI 功能 API (`/api/ai`)

### POST /api/ai/analyze-competitors
竞品分析

**认证要求:** Bearer Token

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| brandName | string | 是 | 品牌名称 |
| industry | string | 是 | 行业 |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "competitors": ["品牌A", "品牌B", "品牌C"],
    "insights": ["差异化定位机会", "价格策略建议", "目标人群洞察"]
  }
}
```

---

### POST /api/ai/generate-brief
生成创意简报

**认证要求:** Bearer Token

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectName | string | 是 | 项目名称 |
| targetAudience | string | 是 | 目标受众 |
| keyMessage | string | 是 | 核心信息 |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "title": "新品上市创意简报",
    "target": "25-35岁都市白领",
    "keyMessage": "简约、高效、品质",
    "channels": ["社交媒体", "KOL合作", "线下活动"]
  }
}
```

---

### POST /api/ai/generate-strategy
生成创意策略

**认证要求:** Bearer Token

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| brandIdentity | string | 是 | 品牌定位 |
| competitors | array | 否 | 竞品列表 |
| targetAudience | string | 否 | 目标受众 |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "coreMessage": "引领品质生活",
    "creativeDirection": "都市精英风格",
    "tonality": "专业、现代、有温度",
    "keyVisual": "城市天际线+产品特写"
  }
}
```

---

### GET /api/ai/logs
获取AI使用记录

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "data": [
    {"id": "1", "type": "strategy", "prompt": "生成品牌策略", "result": "策略已生成", "createdAt": "2024-01-08T10:00:00.000Z"}
  ]
}
```

---

## 6. 资产管理 API (`/api/assets`)

### GET /api/assets
获取资产列表

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "data": [
    {"id": "1", "name": "logo.png", "type": "image", "size": 1024, "url": "/uploads/logo.png", "createdAt": "2024-01-08T10:00:00.000Z"}
  ]
}
```

---

### POST /api/assets/upload
上传资产

**认证要求:** Bearer Token

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 文件名 |
| type | string | 是 | 文件类型 |
| size | number | 是 | 文件大小(字节) |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "3",
    "name": "banner.jpg",
    "type": "image",
    "size": 2048,
    "url": "/uploads/banner.jpg",
    "createdAt": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### DELETE /api/assets/:id
删除资产

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "message": "删除成功"
}
```

---

## 7. 会员管理 API (`/api/member`)

### GET /api/member/info
获取会员信息

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "data": {
    "level": "pro",
    "expireDate": "2025-12-31",
    "features": ["unlimited_projects", "ai_generation", "priority_support"]
  }
}
```

---

### GET /api/member/plans
获取会员套餐（无需登录）

**响应示例:**
```json
{
  "success": true,
  "data": [
    {"id": "free", "name": "免费版", "price": 0, "features": ["3个项目", "基础AI"]},
    {"id": "pro", "name": "专业版", "price": 99, "features": ["无限项目", "高级AI", "优先支持"]},
    {"id": "enterprise", "name": "企业版", "price": 299, "features": ["团队协作", "API访问", "专属客服"]}
  ]
}
```

---

### POST /api/member/upgrade
升级会员

**认证要求:** Bearer Token

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| planId | string | 是 | 套餐ID |

**响应示例:**
```json
{
  "success": true,
  "message": "升级成功",
  "data": {"planId": "pro"}
}
```

---

## 8. 积分系统 API (`/api/points`)

### GET /api/points/info
获取积分信息

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "data": {
    "balance": 1250,
    "totalEarned": 5000,
    "totalSpent": 3750,
    "level": "gold"
  }
}
```

---

### GET /api/points/history
获取积分记录

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "data": [
    {"id": "1", "type": "earn", "amount": 100, "reason": "完成项目", "createdAt": "2024-01-08T10:00:00.000Z"},
    {"id": "2", "type": "spend", "amount": 50, "reason": "使用AI功能", "createdAt": "2024-01-08T09:00:00.000Z"}
  ]
}
```

---

## 9. 项目管理 API (`/api/projects`)

### GET /api/projects
获取项目列表

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "data": [
    {"id": "1", "name": "品牌升级方案", "status": "active", "createdAt": "2024-01-08T10:00:00.000Z"},
    {"id": "2", "name": "新品上市计划", "status": "draft", "createdAt": "2024-01-07T10:00:00.000Z"}
  ]
}
```

---

### GET /api/projects/:id
获取单个项目

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "品牌升级方案",
    "status": "active",
    "createdAt": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### GET /api/projects/:id/steps
获取项目步骤数据

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "data": ["市场调研", "竞品分析", "策略制定", "创意产出", "执行落地"]
}
```

---

### POST /api/projects
创建项目

**认证要求:** Bearer Token

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 项目名称 |
| description | string | 否 | 项目描述 |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "3",
    "name": "新项目",
    "description": "项目描述",
    "status": "draft",
    "createdAt": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### PUT /api/projects/:id
更新项目

**认证要求:** Bearer Token

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 项目名称 |
| status | string | 否 | 项目状态 |

---

### DELETE /api/projects/:id
删除项目

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "message": "删除成功"
}
```

---

## 10. 知识库 API (`/api/knowledge`)

### GET /api/knowledge
获取知识库列表

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "data": [
    {"id": "1", "title": "品牌策略指南", "content": "品牌策略核心要点...", "category": "strategy", "createdAt": "2024-01-08T10:00:00.000Z"}
  ]
}
```

---

### GET /api/knowledge/:id
获取单个知识项

**认证要求:** Bearer Token

---

### POST /api/knowledge
创建知识项

**认证要求:** Bearer Token

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 标题 |
| content | string | 是 | 内容 |
| category | string | 是 | 分类 |

---

### PUT /api/knowledge/:id
更新知识项

**认证要求:** Bearer Token

---

### DELETE /api/knowledge/:id
删除知识项

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "message": "删除成功"
}
```

---

## 11. 搜索 API (`/api/search`)

### GET /api/search
全局搜索

**认证要求:** Bearer Token

**查询参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |
| type | string | 否 | 搜索类型: project, knowledge, history |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {"id": "1", "name": "品牌升级方案", "type": "project", "path": "/projects/files?id=1"}
    ],
    "knowledge": [
      {"id": "k1", "title": "品牌策略指南", "type": "knowledge", "path": "/projects/knowledge"}
    ],
    "history": [
      {"id": "h1", "content": "生成品牌策略", "type": "history", "path": "/projects/assistant"}
    ]
  }
}
```

---

### GET /api/search/history
获取搜索历史

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "data": [
    {"id": "1", "query": "品牌策略", "timestamp": 1704672000000}
  ]
}
```

---

### DELETE /api/search/history
清除搜索历史

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "message": "搜索历史已清除"
}
```

---

## 12. 分享 API (`/api/share`)

### POST /api/share
创建项目分享链接

**认证要求:** Bearer Token

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectId | string | 是 | 项目ID |
| projectName | string | 否 | 项目名称 |
| expiresInDays | number | 否 | 过期天数，默认7天 |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "shareCode": "Abc123XY",
    "shareUrl": "https://stratomind.vercel.app/shared/Abc123XY",
    "expiresAt": "2024-01-15T10:00:00.000Z",
    "projectName": "品牌升级方案"
  }
}
```

---

### GET /api/share/:shareCode
获取分享内容（无需登录）

**响应示例:**
```json
{
  "success": true,
  "data": {
    "projectId": "1",
    "projectName": "品牌升级方案",
    "createdAt": "2024-01-08T10:00:00.000Z",
    "viewCount": 5
  }
}
```

---

### GET /api/share/:shareCode/verify
验证分享链接

**响应示例:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "projectName": "品牌升级方案",
    "expiresAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### DELETE /api/share/:shareCode
删除分享链接

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "message": "分享链接已删除"
}
```

---

### GET /api/share
获取我的分享链接列表

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "shareCode": "Abc123XY",
      "shareUrl": "https://stratomind.vercel.app/shared/Abc123XY",
      "projectId": "1",
      "projectName": "品牌升级方案",
      "createdAt": "2024-01-08T10:00:00.000Z",
      "expiresAt": "2024-01-15T10:00:00.000Z",
      "viewCount": 5,
      "isExpired": false
    }
  ]
}
```

---

## 13. 需求确认单 API (`/api/requirements`)

### GET /api/requirements
获取需求确认单列表

**认证要求:** Bearer Token

**查询参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态: draft, confirmed, archived |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |

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

---

### GET /api/requirements/:id
获取单个需求确认单详情

**认证要求:** Bearer Token

---

### POST /api/requirements
创建需求确认单

**认证要求:** Bearer Token

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectName | string | 是 | 项目名称 |
| clientName | string | 否 | 客户名称 |
| items | array | 否 | 确认单项目数组 |

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

---

### PUT /api/requirements/:id
更新需求确认单

**认证要求:** Bearer Token

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectName | string | 否 | 项目名称 |
| clientName | string | 否 | 客户名称 |
| items | array | 否 | 确认单项目数组 |
| status | string | 否 | 状态 |

---

### DELETE /api/requirements/:id
删除需求确认单

**认证要求:** Bearer Token

**响应示例:**
```json
{
  "success": true,
  "message": "删除成功"
}
```

---

## 14. 管理员 API (`/api/admin`)

### POST /api/admin/login
管理员登录

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "admin": {
      "username": "admin",
      "role": "admin"
    }
  }
}
```

**默认账号:**
- 超级管理员: `SUPERADMIN_USERNAME` / `SUPERADMIN_PASSWORD` (环境变量)
- 普通管理员: `admin` / `admin123`

---

### GET /api/admin/stats
获取统计数据

**认证要求:** 管理员 Token

**响应示例:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "totalProjects": 250,
    "todayNewUsers": 5,
    "todayNewProjects": 12,
    "activeProjects": 80,
    "todayAILogs": 50,
    "totalAILogs": 5000
  }
}
```

---

### GET /api/admin/stats/daily
获取每日统计数据

**认证要求:** 管理员 Token

**查询参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| range | number | 否 | 时间范围: 7或30天，默认7天 |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "daily": [
      {"date": "2024-01-01", "users": 5, "projects": 10, "aiCalls": 100}
    ],
    "levels": [
      {"name": "普通会员", "value": 80},
      {"name": "白银会员", "value": 10},
      {"name": "黄金会员", "value": 7},
      {"name": "钻石会员", "value": 3}
    ],
    "recentUsers": [...],
    "recentProjects": [...]
  }
}
```

---

### GET /api/admin/stats/dashboard
获取仪表盘完整数据

**认证要求:** 管理员 Token

**响应示例:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "totalProjects": 250,
    "todayNewUsers": 5,
    "todayNewProjects": 12,
    "weekNewUsers": 30,
    "weekNewProjects": 80,
    "monthNewUsers": 120,
    "monthNewProjects": 200,
    "activeProjects": 80,
    "todayAILogs": 50,
    "weekAILogs": 300,
    "monthAILogs": 1000,
    "totalAILogs": 5000,
    "todayRecharges": 3,
    "weekRecharges": 15,
    "monthRecharges": 60,
    "totalRecharges": 50000,
    "vipUsers": 10
  }
}
```

---

### GET /api/admin/stats/trend
获取趋势数据

**认证要求:** 管理员 Token

**查询参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| range | string | 否 | today/week/month，默认week |

---

### GET /api/admin/activities
获取最新动态

**认证要求:** 管理员 Token

**查询参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 返回数量，默认10 |

**响应示例:**
```json
{
  "success": true,
  "data": [
    {"id": "user-xxx", "type": "user", "title": "用户 张三 注册了账号", "description": "user@example.com", "time": "5分钟前"}
  ]
}
```

---

### GET /api/admin/users
获取用户列表

**认证要求:** 管理员 Token

**查询参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |
| search | string | 否 | 搜索关键词 |
| level | string | 否 | 会员等级 |

---

### PUT /api/admin/users/:id
更新用户信息

**认证要求:** 管理员 Token

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| points | number | 否 | 积分 |
| memberLevel | string | 否 | 会员等级 |
| memberExpiresAt | string | 否 | 会员过期时间 |
| province | string | 否 | 省份 |
| city | string | 否 | 城市 |

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
- 403: 权限不足
- 404: 资源不存在
- 410: 资源已过期
- 429: 请求过于频繁
- 500: 服务器内部错误

---

## 测试建议

### 1. 访客流程测试
```bash
# 1. 获取访客Token
curl -X POST http://localhost:3000/api/auth/guest

# 2. 存储临时数据
curl -X PUT http://localhost:3000/api/auth/guest/guest_xxx \
  -H "Content-Type: application/json" \
  -d '{"data": {"draftProject": {"name": "测试项目"}}}'

# 3. 发送验证码
curl -X POST http://localhost:3000/api/auth/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000"}'

# 4. 验证码登录并迁移数据
curl -X POST http://localhost:3000/api/auth/sms/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "code": "123456", "guestToken": "guest_xxx"}'
```

### 2. AI对话测试
```bash
# 非流式对话
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "帮我生成一个品牌策略"}'

# 流式对话
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"message": "帮我生成一个品牌策略"}'
```

### 3. 需求确认单测试
```bash
# 1. 登录获取Token
curl -X POST http://localhost:3000/api/auth/sms/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "code": "123456"}'

# 2. 创建确认单
curl -X POST http://localhost:3000/api/requirements \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"projectName": "新品上市推广", "clientName": "某公司"}'

# 3. 获取列表
curl http://localhost:3000/api/requirements \
  -H "Authorization: Bearer <your_token>"

# 4. 更新确认单
curl -X PUT http://localhost:3000/api/requirements/<id> \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

---

## 环境变量配置

| 变量名 | 说明 | 必填 |
|--------|------|------|
| DATABASE_URL | PostgreSQL数据库连接地址 | 是 |
| JWT_SECRET | JWT签名密钥 | 是 |
| ADMIN_JWT_SECRET | 管理员JWT签名密钥 | 否 |
| DEEPSEEK_API_KEY | DeepSeek API密钥 | AI功能需要 |
| DOUBAO_API_KEY | 豆包API密钥 | AI功能需要 |
| SUPERADMIN_USERNAME | 超级管理员用户名 | 否 |
| SUPERADMIN_PASSWORD | 超级管理员密码 | 否 |
| FRONTEND_URL | 前端地址（用于生成分享链接） | 否 |
