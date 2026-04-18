# 灵思工作台 MVP 开发清单

> 版本：MVP v1.0
> 日期：2026年4月18日
> 目标：2周内上线核心功能

---

## 一、设计决策

| 项目 | 决策 |
|-----|------|
| 用户体系 | 两级漏斗：访客 → 付费会员 |
| 存储方案 | 云端存储，访客用临时Token |
| 积分体系 | 砍掉，改为功能次数限制 |
| 付费方式 | 月付29元订阅制 |

---

## 二、MVP功能范围

### P0 必做

| 功能 | 说明 | 状态 |
|-----|------|------|
| 手机号+验证码登录 | 主登录方式，自动注册 | 待开发 |
| 访客临时存储 | 临时Token，云端存储，7天过期 | 待开发 |
| 需求确认单CRUD | 创建/编辑/删除/列表 | 待开发 |
| 需求确认单截图 | 生成图片发客户确认 | 待开发 |
| PDF导出 | 单页导出需求确认单 | 待开发 |
| 访客功能限制 | 最多创建3个需求单 | 待开发 |

### P1 后续迭代

| 功能 | 说明 |
|-----|------|
| 会员订阅支付 | 微信/支付宝支付 |
| 打包下载 | 批量导出项目 |
| 团队协作 | 多人编辑 |

### 已砍掉

| 功能 | 原因 |
|-----|------|
| 积分体系 | 复杂度高，初期不需要 |
| IndexedDB本地存储 | 数据丢失风险大 |
| 三级会员体系 | 中间态鸡肋 |
| 截图标注 | 用户可用其他工具 |

---

## 三、用户流程

### 访客流程
```
1. 首次访问 → 自动生成临时Token
2. 直接进入工作台，可创建需求单
3. 顶部提示条："体验模式，数据保留7天，登录后永久保存"
4. 创建第3个需求单时提示："已达到体验上限，登录解锁更多"
```

### 登录流程
```
1. 点击"登录/注册"
2. 输入手机号
3. 获取验证码
4. 验证成功：
   - 新用户：自动注册，数据从临时Token迁移
   - 老用户：直接登录
```

### 付费流程
```
1. 访客创建第4个需求单时，弹出付费引导
2. 或点击"升级会员"按钮
3. 选择订阅方案：月付29元
4. 支付成功 → 解锁无限创建
```

---

## 四、数据结构

### 用户表
```sql
users:
  id: string (主键)
  phone: string (手机号，唯一)
  nickname: string (昵称)
  is_paid: boolean (是否付费会员)
  paid_expire_at: datetime (会员过期时间)
  created_at: datetime
```

### 临时访客表
```sql
guest_sessions:
  id: string (主键)
  token: string (临时Token，唯一)
  data: json (临时数据)
  expire_at: datetime (过期时间，7天)
  created_at: datetime
```

### 需求确认单表
```sql
requirement_sheets:
  id: string (主键)
  user_id: string (关联用户，或临时Token)
  project_name: string (项目名称)
  client_name: string (客户名称)
  items: json (需求条目列表)
  status: string (draft/confirmed)
  created_at: datetime
  updated_at: datetime
```

### 需求条目结构
```json
{
  "id": "item_xxx",
  "client_said": "客户原话",
  "action": "执行动作",
  "priority": "high/normal/low",
  "assignee": "负责人",
  "status": "pending/confirmed"
}
```

---

## 五、API接口清单

### 认证相关
- POST /api/auth/guest - 创建访客临时Token
- POST /api/auth/sms/send - 发送验证码
- POST /api/auth/sms/verify - 验证码登录/注册

### 需求确认单
- GET /api/requirements - 获取列表
- POST /api/requirements - 创建
- PUT /api/requirements/:id - 更新
- DELETE /api/requirements/:id - 删除
- POST /api/requirements/:id/screenshot - 生成截图
- POST /api/requirements/:id/export-pdf - 导出PDF

### 用户相关
- GET /api/user/profile - 获取用户信息
- PUT /api/user/profile - 更新用户信息
- POST /api/user/subscribe - 订阅会员

---

## 六、前端页面

### 新增页面
1. `/requirements` - 需求确认单列表
2. `/requirements/new` - 创建需求确认单
3. `/requirements/:id` - 编辑需求确认单

### 修改页面
1. 顶部增加提示条（访客模式）
2. 登录弹窗改为手机号+验证码
3. 增加需求确认单入口

---

## 七、开发排期

| 天数 | 任务 |
|-----|------|
| Day 1-2 | 后端：认证API + 需求单CRUD |
| Day 3-4 | 前端：需求确认单页面 |
| Day 5 | 截图生成 + PDF导出 |
| Day 6 | 访客限制逻辑 + 提示条 |
| Day 7 | 联调测试 |
| Day 8-10 | Buffer + 修复Bug |

---

*MVP版本，专注核心功能，快速验证*
