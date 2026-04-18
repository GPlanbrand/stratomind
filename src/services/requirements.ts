import { RequirementDocument, RequirementItem, VISITOR_MAX_REQUIREMENTS } from '../types/requirement';

const STORAGE_KEY = 'stratomind_requirements';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 获取所有需求确认单
export const getRequirements = (): RequirementDocument[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// 获取单个需求确认单
export const getRequirementById = (id: string): RequirementDocument | null => {
  const requirements = getRequirements();
  return requirements.find(r => r.id === id) || null;
};

// 保存需求确认单
export const saveRequirement = (requirement: RequirementDocument): void => {
  const requirements = getRequirements();
  const existingIndex = requirements.findIndex(r => r.id === requirement.id);
  
  if (existingIndex >= 0) {
    requirements[existingIndex] = { ...requirement, updatedAt: new Date().toISOString() };
  } else {
    requirements.push({ ...requirement, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requirements));
};

// 创建新需求确认单
export const createRequirement = (data: { projectName: string; clientName: string; createdBy: string }): RequirementDocument => {
  const requirement: RequirementDocument = {
    id: generateId(),
    projectName: data.projectName,
    clientName: data.clientName,
    items: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: data.createdBy
  };
  
  saveRequirement(requirement);
  return requirement;
};

// 添加需求条目
export const addRequirementItem = (requirementId: string): RequirementItem => {
  const requirement = getRequirementById(requirementId);
  if (!requirement) throw new Error('需求确认单不存在');
  
  const newItem: RequirementItem = {
    id: generateId(),
    clientStatement: '',
    action: '',
    priority: 'medium',
    assignee: '',
    status: 'pending'
  };
  
  requirement.items.push(newItem);
  saveRequirement(requirement);
  
  return newItem;
};

// 更新需求条目
export const updateRequirementItem = (requirementId: string, itemId: string, updates: Partial<RequirementItem>): void => {
  const requirement = getRequirementById(requirementId);
  if (!requirement) throw new Error('需求确认单不存在');
  
  const itemIndex = requirement.items.findIndex(item => item.id === itemId);
  if (itemIndex < 0) throw new Error('需求条目不存在');
  
  requirement.items[itemIndex] = { ...requirement.items[itemIndex], ...updates };
  saveRequirement(requirement);
};

// 删除需求条目
export const deleteRequirementItem = (requirementId: string, itemId: string): void => {
  const requirement = getRequirementById(requirementId);
  if (!requirement) throw new Error('需求确认单不存在');
  
  requirement.items = requirement.items.filter(item => item.id !== itemId);
  saveRequirement(requirement);
};

// 删除需求确认单
export const deleteRequirement = (id: string): void => {
  const requirements = getRequirements();
  const filtered = requirements.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

// 检查访客限制
export const checkVisitorLimit = (userId?: string): { allowed: boolean; count: number; limit: number } => {
  // 如果有用户ID，则不限制
  if (userId) {
    return { allowed: true, count: 0, limit: -1 };
  }
  
  // 访客检查
  const requirements = getRequirements();
  const visitorRequirements = requirements.filter(r => !r.createdBy);
  const count = visitorRequirements.length;
  
  return {
    allowed: count < VISITOR_MAX_REQUIREMENTS,
    count,
    limit: VISITOR_MAX_REQUIREMENTS
  };
};

// 获取访客需求单数量
export const getVisitorRequirementCount = (userId?: string): number => {
  if (userId) return 0;
  
  const requirements = getRequirements();
  return requirements.filter(r => !r.createdBy).length;
};

// 判断是否为访客
export const isVisitor = (userId?: string): boolean => {
  return !userId;
};
