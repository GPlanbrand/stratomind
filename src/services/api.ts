import axios from 'axios'
import { Project, ProjectSteps, ClientInfo, Requirements, Competitor, Brief, Strategy, CreateProjectRequest } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 存储配置
const STORAGE_KEY = 'brand_craft_projects'
const STEPS_KEY = 'brand_craft_steps'

// 本地存储操作
function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

function setStoredData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// 生成ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// ============ 项目相关 ============

export async function getProjects(): Promise<Project[]> {
  return new Promise((resolve) => {
    const projects = getStoredData<Project[]>(STORAGE_KEY, [])
    // 按更新时间排序
    projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    resolve(projects)
  })
}

export async function getProject(projectId: string): Promise<Project> {
  const projects = getStoredData<Project[]>(STORAGE_KEY, [])
  const project = projects.find(p => p.id === projectId)
  if (!project) throw new Error('项目不存在')
  return project
}

export async function createProject(data: CreateProjectRequest): Promise<Project> {
  const projects = getStoredData<Project[]>(STORAGE_KEY, [])
  const now = new Date().toISOString()
  const newProject: Project = {
    id: generateId(),
    name: data.name,
    clientName: data.clientName,
    createdAt: now,
    updatedAt: now,
    status: 'active',
  }
  projects.push(newProject)
  setStoredData(STORAGE_KEY, projects)
  
  // 初始化步骤数据
  const steps = getStoredData<Record<string, ProjectSteps>>(STEPS_KEY, {})
  steps[newProject.id] = {}
  setStoredData(STEPS_KEY, steps)
  
  return newProject
}

export async function updateProject(projectId: string, data: Partial<Project>): Promise<Project> {
  const projects = getStoredData<Project[]>(STORAGE_KEY, [])
  const index = projects.findIndex(p => p.id === projectId)
  if (index === -1) throw new Error('项目不存在')
  
  projects[index] = {
    ...projects[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  setStoredData(STORAGE_KEY, projects)
  return projects[index]
}

export async function deleteProject(projectId: string): Promise<void> {
  const projects = getStoredData<Project[]>(STORAGE_KEY, [])
  const filtered = projects.filter(p => p.id !== projectId)
  setStoredData(STORAGE_KEY, filtered)
  
  // 删除步骤数据
  const steps = getStoredData<Record<string, ProjectSteps>>(STEPS_KEY, {})
  delete steps[projectId]
  setStoredData(STEPS_KEY, steps)
}

export async function getProjectSteps(projectId: string): Promise<ProjectSteps> {
  const steps = getStoredData<Record<string, ProjectSteps>>(STEPS_KEY, {})
  return steps[projectId] || {}
}

// ============ 客户背景信息 ============

export async function saveClientInfo(projectId: string, data: Partial<ClientInfo>): Promise<void> {
  const steps = getStoredData<Record<string, ProjectSteps>>(STEPS_KEY, {})
  if (!steps[projectId]) steps[projectId] = {}
  steps[projectId] = {
    ...steps[projectId],
    clientInfo: { ...steps[projectId].clientInfo, ...data } as ClientInfo,
  }
  setStoredData(STEPS_KEY, steps)
  await updateProject(projectId, {})
}

// ============ 项目需求 ============

export async function saveRequirements(projectId: string, data: Partial<Requirements>): Promise<void> {
  const steps = getStoredData<Record<string, ProjectSteps>>(STEPS_KEY, {})
  if (!steps[projectId]) steps[projectId] = {}
  steps[projectId] = {
    ...steps[projectId],
    requirements: { ...steps[projectId].requirements, ...data } as Requirements,
  }
  setStoredData(STEPS_KEY, steps)
  await updateProject(projectId, {})
}

// ============ 竞品分析 ============

export async function saveCompetitors(projectId: string, competitors: Competitor[]): Promise<void> {
  const steps = getStoredData<Record<string, ProjectSteps>>(STEPS_KEY, {})
  if (!steps[projectId]) steps[projectId] = {}
  steps[projectId] = { ...steps[projectId], competitors }
  setStoredData(STEPS_KEY, steps)
  await updateProject(projectId, {})
}

// ============ 创意简报 ============

export async function saveBrief(projectId: string, data: Partial<Brief>): Promise<void> {
  const steps = getStoredData<Record<string, ProjectSteps>>(STEPS_KEY, {})
  if (!steps[projectId]) steps[projectId] = {}
  steps[projectId] = {
    ...steps[projectId],
    brief: { ...steps[projectId].brief, ...data } as Brief,
  }
  setStoredData(STEPS_KEY, steps)
  await updateProject(projectId, {})
}

// ============ 创意策略 ============

export async function saveStrategy(projectId: string, data: Partial<Strategy>): Promise<void> {
  const steps = getStoredData<Record<string, ProjectSteps>>(STEPS_KEY, {})
  if (!steps[projectId]) steps[projectId] = {}
  steps[projectId] = {
    ...steps[projectId],
    strategy: { ...steps[projectId].strategy, ...data } as Strategy,
  }
  setStoredData(STEPS_KEY, steps)
  await updateProject(projectId, {})
}

// ============ 项目文件 ============

const FILES_KEY = 'brand_craft_files'

export interface ProjectFile {
  id: string
  projectId: string
  name: string
  type: string
  size: number
  url?: string
  createdAt: string
  uploadedAt: string
}

export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const allFiles = getStoredData<ProjectFile[]>(FILES_KEY, [])
  return allFiles.filter(f => f.projectId === projectId)
}

export async function saveProjectFile(file: Omit<ProjectFile, 'id' | 'createdAt'>): Promise<ProjectFile> {
  const allFiles = getStoredData<ProjectFile[]>(FILES_KEY, [])
  const newFile: ProjectFile = {
    ...file,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  allFiles.push(newFile)
  setStoredData(FILES_KEY, allFiles)
  return newFile
}

export async function deleteProjectFile(fileId: string): Promise<void> {
  const allFiles = getStoredData<ProjectFile[]>(FILES_KEY, [])
  const filtered = allFiles.filter(f => f.id !== fileId)
  setStoredData(FILES_KEY, filtered)
}

// ============ 项目任务 ============

const TASKS_KEY = 'brand_craft_tasks'

export interface ProjectTask {
  id: string
  projectId: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
  completedAt?: string
}

export async function getProjectTasks(projectId: string): Promise<ProjectTask[]> {
  const allTasks = getStoredData<ProjectTask[]>(TASKS_KEY, [])
  return allTasks.filter(t => t.projectId === projectId)
}

export async function createProjectTask(task: Omit<ProjectTask, 'id' | 'createdAt'>): Promise<ProjectTask> {
  const allTasks = getStoredData<ProjectTask[]>(TASKS_KEY, [])
  const newTask: ProjectTask = {
    ...task,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  allTasks.push(newTask)
  setStoredData(TASKS_KEY, allTasks)
  return newTask
}

export async function updateProjectTask(taskId: string, data: Partial<ProjectTask>): Promise<ProjectTask> {
  const allTasks = getStoredData<ProjectTask[]>(TASKS_KEY, [])
  const index = allTasks.findIndex(t => t.id === taskId)
  if (index === -1) throw new Error('任务不存在')
  
  allTasks[index] = { ...allTasks[index], ...data }
  if (data.status === 'completed') {
    allTasks[index].completedAt = new Date().toISOString()
  }
  setStoredData(TASKS_KEY, allTasks)
  return allTasks[index]
}

export async function deleteProjectTask(taskId: string): Promise<void> {
  const allTasks = getStoredData<ProjectTask[]>(TASKS_KEY, [])
  const filtered = allTasks.filter(t => t.id !== taskId)
  setStoredData(TASKS_KEY, filtered)
}
