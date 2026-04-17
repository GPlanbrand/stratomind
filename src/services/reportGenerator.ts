/**
 * 纸质汇报夹 - 报告生成服务
 * 用于生成可打印的项目阶段汇报文档
 */

import type { Project, ClientInfo, Requirements, Competitor, Brief } from '../types';

// 项目数据接口
export interface ProjectData {
  // 基本信息
  projectId: string;
  projectName: string;
  clientName: string;
  projectStatus: 'active' | 'completed' | 'archived';
  progressPercent: number;
  projectManager: string;
  startDate: string;
  updatedAt: string;
  
  // 客户信息
  clientInfo?: ClientInfo;
  
  // 需求信息
  requirements?: Requirements;
  
  // 竞品分析
  competitors?: Competitor[];
  
  // 创意简报
  brief?: Brief;
  
  // 任务进度
  tasks?: TaskData[];
  
  // 项目文件
  files?: FileData[];
  
  // 聊天摘要
  chatSummary?: string;
  
  // AI洞察
  aiInsights?: AIInsight[];
}

// 任务数据结构
export interface TaskData {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
}

// 文件数据结构
export interface FileData {
  id: string;
  name: string;
  type: 'pdf' | 'word' | 'ppt' | 'excel' | 'image' | 'zip' | 'other';
  size: number;
  uploadedAt: string;
  url?: string;
}

// AI洞察数据结构
export interface AIInsight {
  type: 'summary' | 'risk' | 'suggestion' | 'highlight';
  content: string;
}

// 报告生成选项
export interface ReportOptions {
  includeChatSummary?: boolean;
  includeFiles?: boolean;
  includeTasks?: boolean;
  includeChart?: boolean;
  chartImageUrl?: string;
  aiSummary?: string;
  aiSuggestions?: string[];
}

// 报告生成结果
export interface ReportResult {
  success: boolean;
  html?: string;
  blob?: Blob;
  error?: string;
}

// 状态映射
const STATUS_MAP = {
  active: '进行中',
  completed: '已完成',
  archived: '已归档',
  pending: '待处理',
  in_progress: '进行中',
};

// 获取文件扩展名
function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toUpperCase() || 'FILE';
  const map: Record<string, string> = {
    'PDF': 'PDF',
    'DOC': 'DOC',
    'DOCX': 'DOC',
    'PPT': 'PPT',
    'PPTX': 'PPT',
    'XLS': 'XLS',
    'XLSX': 'XLS',
    'JPG': 'IMG',
    'JPEG': 'IMG',
    'PNG': 'IMG',
    'GIF': 'IMG',
    'ZIP': 'ZIP',
    'RAR': 'ZIP',
  };
  return map[ext] || 'FILE';
}

// 获取文件类型图标颜色
function getFileIconColor(type: string): string {
  const colors: Record<string, string> = {
    pdf: '#e53935',
    word: '#2196f3',
    ppt: '#ff9800',
    excel: '#4caf50',
    image: '#9c27b0',
    zip: '#607d8b',
    other: '#9e9e9e',
  };
  return colors[type] || colors.other;
}

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// 生成报告HTML
export function generateReportHTML(
  projectData: ProjectData,
  options: ReportOptions = {}
): string {
  const {
    includeChatSummary = true,
    includeFiles = true,
    includeTasks = true,
    includeChart = false,
    chartImageUrl = '',
    aiSummary = '',
    aiSuggestions = [],
  } = options;

  // 计算任务进度
  const tasks = projectData.tasks || [];
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').map(t => t.title);

  // 处理文件列表
  const files = projectData.files || [];
  const fileList = files.map(file => ({
    fileName: file.name,
    fileExtension: getFileExtension(file.name),
  }));

  // 生成本周进展（从最近的任务完成情况提取）
  const recentProgress = tasks
    .filter(t => t.status === 'completed' && t.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5)
    .map(t => `完成：${t.title}`);

  // AI洞察
  const insights = projectData.aiInsights || [];
  const summaryInsight = insights.find(i => i.type === 'summary')?.content || aiSummary;
  const suggestionInsights = insights
    .filter(i => i.type === 'suggestion')
    .map(i => i.content)
    .concat(aiSuggestions);
  const riskInsights = insights.filter(i => i.type === 'risk').map(i => i.content);
  const allSuggestions = [...suggestionInsights, ...riskInsights];

  // 构建HTML
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectData.projectName} - 阶段汇报</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: "Microsoft YaHei", "PingFang SC", "SimHei", sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      background: #fff;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }
    
    @page {
      size: A4;
      margin: 15mm;
    }
    
    /* 页眉 */
    .header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    
    .header h1 {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 6px;
    }
    
    .header .date {
      font-size: 11px;
      color: #666;
    }
    
    /* 项目信息区块 */
    .info-section {
      background: #f5f5f5;
      border: 1px solid #ddd;
      padding: 12px;
      margin-bottom: 16px;
      border-radius: 4px;
    }
    
    .info-row {
      display: flex;
      margin-bottom: 6px;
    }
    
    .info-row:last-child {
      margin-bottom: 0;
    }
    
    .info-label {
      font-weight: bold;
      min-width: 90px;
      color: #444;
    }
    
    .info-value {
      flex: 1;
    }
    
    .progress-bar {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      vertical-align: middle;
    }
    
    .progress-track {
      width: 150px;
      height: 14px;
      background: #e0e0e0;
      border-radius: 7px;
      overflow: hidden;
      display: inline-block;
      vertical-align: middle;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #8BC34A);
      border-radius: 7px;
    }
    
    .progress-text {
      font-weight: bold;
      min-width: 45px;
    }
    
    /* 内容区块 */
    .section {
      margin-bottom: 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .section-header {
      background: #333;
      color: #fff;
      padding: 8px 12px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .section-content {
      padding: 12px;
    }
    
    /* 列表样式 */
    .item-list {
      list-style: none;
    }
    
    .item-list li {
      padding: 4px 0;
      padding-left: 16px;
      position: relative;
    }
    
    .item-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #333;
    }
    
    /* 文件列表 */
    .file-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }
    
    .file-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      background: #f9f9f9;
      border: 1px solid #eee;
      border-radius: 3px;
      font-size: 11px;
    }
    
    .file-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e0e0e0;
      border-radius: 3px;
      font-size: 9px;
      font-weight: bold;
      color: #666;
    }
    
    /* AI洞察 */
    .insight-box {
      background: #fff8e1;
      border: 1px solid #ffe082;
      border-radius: 4px;
      padding: 12px;
    }
    
    .insight-item {
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
    }
    
    .insight-item:last-child {
      margin-bottom: 0;
    }
    
    .insight-number {
      position: absolute;
      left: 0;
      top: 0;
      width: 16px;
      height: 16px;
      background: #ff9800;
      color: #fff;
      border-radius: 50%;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* 页脚 */
    .footer {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 10px;
      color: #999;
    }
    
    /* 图表区域 */
    .chart-container {
      text-align: center;
      background: #f9f9f9;
      border: 1px dashed #ccc;
      padding: 10px;
      border-radius: 4px;
    }
    
    .chart-container img {
      max-width: 100%;
      max-height: 150px;
    }
    
    /* 打印控制按钮 */
    .print-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #333;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
    }
    
    .print-btn:hover {
      background: #555;
    }
    
    /* 打印优化 */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .print-btn {
        display: none !important;
      }
      
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- 页眉 -->
  <div class="header">
    <h1>【${projectData.projectName}】阶段汇报</h1>
    <div class="date">生成日期：${formatDate(new Date().toISOString())}</div>
  </div>
  
  <!-- 项目信息 -->
  <div class="info-section">
    <div class="info-row">
      <span class="info-label">项目状态：</span>
      <span class="info-value">
        ${STATUS_MAP[projectData.projectStatus] || projectData.projectStatus}
        <span class="progress-bar">
          <span class="progress-track">
            <span class="progress-fill" style="width: ${projectData.progressPercent}%"></span>
          </span>
          <span class="progress-text">${projectData.progressPercent}%</span>
        </span>
      </span>
    </div>
    <div class="info-row">
      <span class="info-label">负责人：</span>
      <span class="info-value">${projectData.projectManager || '未指定'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">开始日期：</span>
      <span class="info-value">${formatDate(projectData.startDate)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">客户名称：</span>
      <span class="info-value">${projectData.clientName}</span>
    </div>
  </div>
  
  ${includeChatSummary && projectData.chatSummary ? `
  <!-- 聊天摘要 -->
  <div class="section">
    <div class="section-header">
      <span>💬 沟通摘要</span>
    </div>
    <div class="section-content">
      <p>${projectData.chatSummary}</p>
    </div>
  </div>
  ` : ''}
  
  ${recentProgress.length > 0 ? `
  <!-- 本周进展 -->
  <div class="section">
    <div class="section-header">
      <span>📋 本周进展</span>
    </div>
    <div class="section-content">
      <ul class="item-list">
        ${recentProgress.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  </div>
  ` : ''}
  
  ${includeTasks && totalTasks > 0 ? `
  <!-- 待办事项 -->
  <div class="section">
    <div class="section-header">
      <span>📊 待办事项 (${completedTasks}/${totalTasks} 已完成)</span>
    </div>
    <div class="section-content">
      <div class="progress-bar">
        <span class="progress-track" style="width: 200px; height: 20px;">
          <span class="progress-fill" style="width: ${taskCompletionRate}%"></span>
        </span>
        <span class="progress-text">${taskCompletionRate}%</span>
      </div>
      ${pendingTasks.length > 0 ? `
      <div style="margin-top: 10px;">
        <strong>待完成：</strong>
        <ul class="item-list" style="margin-top: 4px;">
          ${pendingTasks.map(task => `<li>${task}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}
  
  ${includeFiles && fileList.length > 0 ? `
  <!-- 项目文件 -->
  <div class="section">
    <div class="section-header">
      <span>📁 项目文件 (${fileList.length}个)</span>
    </div>
    <div class="section-content">
      <div class="file-list">
        ${fileList.map(file => `
        <div class="file-item">
          <span class="file-icon">${file.fileExtension}</span>
          <span>${file.fileName}</span>
        </div>
        `).join('')}
      </div>
    </div>
  </div>
  ` : ''}
  
  ${includeChart && chartImageUrl ? `
  <!-- 数据看板 -->
  <div class="section">
    <div class="section-header">
      <span>📈 数据看板</span>
    </div>
    <div class="section-content">
      <div class="chart-container">
        <img src="${chartImageUrl}" alt="数据图表" />
      </div>
    </div>
  </div>
  ` : ''}
  
  ${(summaryInsight || allSuggestions.length > 0) ? `
  <!-- AI洞察 -->
  <div class="section">
    <div class="section-header" style="background: #ff9800;">
      <span>🤖 AI洞察</span>
    </div>
    <div class="section-content">
      <div class="insight-box">
        ${summaryInsight ? `<p style="margin-bottom: 8px;"><strong>${summaryInsight}</strong></p>` : ''}
        ${allSuggestions.length > 0 ? `
        <p style="margin-bottom: 6px;">建议关注：</p>
        <div>
          ${allSuggestions.map((suggestion, index) => `
          <div class="insight-item">
            <span class="insight-number">${index + 1}</span>
            <span>${suggestion}</span>
          </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    </div>
  </div>
  ` : ''}
  
  <!-- 页脚 -->
  <div class="footer">
    <p>本报告由 灵思AI创意工作台 自动生成 | ${new Date().toLocaleString('zh-CN')}</p>
    <p>如有疑问请联系项目负责人</p>
  </div>
  
  <!-- 打印按钮 -->
  <button class="print-btn" onclick="window.print()">
    🖨️ 打印报告
  </button>
</body>
</html>
  `.trim();
}

// 生成单个项目的报告
export async function generateSingleReport(
  projectData: ProjectData,
  options: ReportOptions = {}
): Promise<ReportResult> {
  try {
    const html = generateReportHTML(projectData, options);
    return {
      success: true,
      html,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '生成报告失败',
    };
  }
}

// 生成批量报告（多个项目合订本）
export async function generateBatchReport(
  projects: ProjectData[],
  options: ReportOptions = {}
): Promise<ReportResult> {
  try {
    if (projects.length === 0) {
      return {
        success: false,
        error: '没有可生成报告的项目',
      };
    }

    const reports = projects.map(p => generateReportHTML(p, options)).join('\n\n<div style="page-break-after: always;"></div>\n\n');

    const fullHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>项目阶段汇报合订本</title>
  <style>
    body {
      font-family: "Microsoft YaHei", "PingFang SC", "SimHei", sans-serif;
    }
    @page {
      size: A4;
      margin: 15mm;
    }
    .print-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #333;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    @media print {
      .print-btn { display: none !important; }
    }
  </style>
</head>
<body>
  ${reports}
  <button class="print-btn" onclick="window.print()">🖨️ 打印全部报告</button>
</body>
</html>
    `.trim();

    return {
      success: true,
      html: fullHTML,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '生成批量报告失败',
    };
  }
}

// 将HTML转换为Blob（用于下载）
export function htmlToBlob(html: string): Blob {
  return new Blob([html], { type: 'text/html;charset=utf-8' });
}

// 下载报告
export function downloadReport(html: string, filename: string = '项目汇报.html'): void {
  const blob = htmlToBlob(html);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 在新窗口打开报告预览
export function previewReport(html: string): void {
  const blob = htmlToBlob(html);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

// 触发浏览器打印
export function printReport(): void {
  window.print();
}

// 从项目数据构造报告数据
export function buildReportDataFromProject(project: Project, extraData?: Partial<ProjectData>): ProjectData {
  return {
    projectId: project.id,
    projectName: project.name,
    clientName: project.clientName,
    projectStatus: project.status,
    progressPercent: 50, // 默认50%
    projectManager: '未指定',
    startDate: project.createdAt,
    updatedAt: project.updatedAt,
    tasks: [],
    files: [],
    ...extraData,
  };
}
