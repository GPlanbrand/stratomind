/**
 * 甲乙方传译闭环 - 类型定义
 */

/** 需求条目 */
export interface RequirementItem {
  id: string
  originalPoint: string      // 甲方原文/原图关键点
  inferredIntent: string     // 推测意图
  action: string             // 执行动作
  priority: 'high' | 'medium' | 'low'
  category: 'visual' | 'content' | 'layout' | 'style' | 'deadline' | 'other'
}

/** 解析结果 */
export interface ParsedRequirement {
  sourceType: 'audio' | 'image' | 'text'
  originalContent: string
  keyPoints: RequirementItem[]
  summary: string
  timestamp: string
}

/** 任务条目（用于任务联动） */
export interface TaskItem {
  id: string
  content: string            // 任务内容
  action: string             // 执行动作
  priority: 'high' | 'medium' | 'low'
  category: string
  completed: boolean
  createdAt: string
}

/** 上传文件类型 */
export type UploadFileType = 'audio' | 'image'

/** 支持的文件格式 */
export const SUPPORTED_AUDIO_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a']
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']

/** 文件大小限制 */
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024  // 50MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024  // 10MB
