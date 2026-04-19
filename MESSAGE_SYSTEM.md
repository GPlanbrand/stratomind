# 灵思智能体 - 消息系统 API 文档

## 概述

灵思智能体消息系统提供完整的用户通知功能，支持多种消息类型、定时任务和个性化配置。

## 基础配置

### 数据库表

#### Message (消息表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 消息ID (cuid) |
| userId | String | 接收用户ID |
| title | String | 消息标题 |
| content | String | 消息内容 |
| type | String | 消息类型 |
| link | String? | 跳转链接 |
| isRead | Boolean | 是否已读 |
| priority | String | 优先级 |
| metadata | String? | 额外数据(JSON) |
| senderId | String? | 发送者ID |
| createdAt | DateTime | 创建时间 |
| readAt | DateTime? | 阅读时间 |

**type 可选值:**
- `system` - 系统通知
- `project` - 项目动态
- `reminder` - 待办提醒
- `news` - 行业资讯
- `tip` - 使用技巧

**priority 可选值:**
- `low` - 低优先级
- `normal` - 普通
- `high` - 紧急

#### ScheduledTask (定时任务表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 任务ID |
| name | String | 任务名称 |
| type | String | 任务类型 |
| cron | String | Cron表达式 |
| config | String | 任务配置(JSON) |
| isActive | Boolean | 是否启用 |
| lastRunAt | DateTime? | 上次执行时间 |
| nextRunAt | DateTime? | 下次执行时间 |

#### LingsiProfile (灵思Profile)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | Profile ID |
| name | String | 名称 |
| avatar | String? | 头像URL |
| title | String | 头衔 |
| description | String? | 简介 |
| greeting | String? | 欢迎语 |
| systemPrompt | String? | 系统提示词 |
| settings | String? | 个性化设置 |
| isActive | Boolean | 是否启用 |

## API 接口

### 消息接口

#### 获取消息列表
```
GET /api/messages
```

**Query 参数:**
- `page` - 页码 (默认: 1)
- `pageSize` - 每页数量 (默认: 20, 最大: 100)
- `type` - 消息类型筛选
- `isRead` - 已读状态筛选

**响应:**
```json
{
  "success": true,
  "data": {
    "messages": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    },
    "unreadCount": 5
  }
}
```

#### 获取未读消息数量
```
GET /api/messages/unread-count
```

**响应:**
```json
{
  "success": true,
  "data": { "count": 5 }
}
```

#### 标记单条消息已读
```
PUT /api/messages/:id/read
```

#### 标记所有消息已读
```
PUT /api/messages/read-all
```

#### 删除消息
```
DELETE /api/messages/:id
```

#### 发送消息 (管理员)
```
POST /api/messages/send
```

**Body:**
```json
{
  "userId": "user_id",
  "title": "消息标题",
  "content": "消息内容",
  "type": "system",
  "link": "/projects/123",
  "priority": "normal",
  "metadata": {}
}
```

#### 批量发送消息 (管理员)
```
POST /api/messages/broadcast
```

**Body:**
```json
{
  "userIds": ["user1", "user2"],
  "title": "消息标题",
  "content": "消息内容",
  "type": "news"
}
```

### 灵思Profile接口

#### 获取灵思Profile
```
GET /api/messages/profile/lingsi
```

#### 更新灵思Profile (管理员)
```
PUT /api/messages/profile/lingsi
```

### 定时任务接口 (管理员)

#### 获取定时任务列表
```
GET /api/messages/scheduled-tasks
```

#### 创建定时任务
```
POST /api/messages/scheduled-tasks
```

#### 更新定时任务
```
PUT /api/messages/scheduled-tasks/:id
```

#### 删除定时任务
```
DELETE /api/messages/scheduled-tasks/:id
```

## 前端组件

### MessageCenter
消息中心组件，提供完整的消息列表、筛选、已读管理功能。

**使用方式:**
```tsx
import MessageCenter from '@/components/MessageCenter';

const [showMessageCenter, setShowMessageCenter] = useState(false);

// 在Header中添加消息按钮
<button onClick={() => setShowMessageCenter(true)}>
  <Bell />
  {unreadCount > 0 && <span>{unreadCount}</span>}
</button>

// 渲染消息中心
<MessageCenter
  isOpen={showMessageCenter}
  onClose={() => setShowMessageCenter(false)}
/>
```

### ContactLingsi
联系灵思入口组件，支持多种变体。

**变体:**
- `button` - 按钮样式
- `modal` - 模态框样式
- `floating` - 浮动按钮样式

**使用方式:**
```tsx
import ContactLingsi from '@/components/ContactLingsi';

// 按钮样式
<ContactLingsi variant="button" />

// 浮动按钮
<ContactLingsi variant="floating" />

// 模态框入口
<ContactLingsi variant="modal" />
```

## 定时任务脚本

### 定时任务类型

1. **sendDailyNewsDigest** - 每日行业新闻推送
2. **sendProjectReminders** - 项目进度提醒
3. **sendWeeklyReportReminder** - 周报生成提醒
4. **sendPointsLowReminder** - 积分不足提醒
5. **sendUsageTips** - 使用技巧推送

### 执行方式

#### 方式一: 直接运行
```bash
npx ts-node src/scripts/scheduledTasks.ts
```

#### 方式二: 指定任务类型
```bash
npx ts-node src/scripts/scheduledTasks.ts news
npx ts-node src/scripts/scheduledTasks.ts weekly
```

#### 方式三: 使用外部调度器
配合 GitHub Actions 或 cron-job.org 等服务进行定时调用。

## 配置说明

### LINGSI_DEFAULT_PROFILE
灵思的默认配置，可在管理后台动态修改：

```ts
{
  name: '灵思',
  avatar: '/lingsi-avatar.svg',
  title: '您的智能创意伙伴',
  greeting: '你好！我是灵思...',
  settings: {
    tone: 'professional',
    proactiveSuggestions: true,
    notificationPrefs: {...}
  },
  quickActions: [...]
}
```

## 注意事项

1. 所有消息接口都需要用户登录认证
2. 管理接口需要管理员权限
3. 批量发送消息时注意频率限制
4. 建议设置合理的消息过期策略
