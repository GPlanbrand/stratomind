// 需求确认单条目
export interface RequirementItem {
  id: string;
  clientStatement: string;  // 客户原话
  action: string;           // 执行动作
  priority: 'high' | 'medium' | 'low';  // 优先级
  assignee: string;          // 负责人
  status: 'pending' | 'confirmed';      // 状态
}

// 需求确认单
export interface RequirementDocument {
  id: string;
  projectName: string;      // 项目名
  clientName: string;        // 客户名
  items: RequirementItem[]; // 需求条目
  status: 'draft' | 'confirmed' | 'archived';  // 文档状态
  createdAt: string;
  updatedAt: string;
  createdBy: string;        // 创建人ID
}

// 访客创建限制
export const VISITOR_MAX_REQUIREMENTS = 3;
