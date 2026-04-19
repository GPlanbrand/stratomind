/**
 * 纸质汇报夹 - 项目报告页面
 * 用于展示和导出单个项目的阶段汇报
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Eye, 
  Settings,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  RefreshCw,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import {
  generateSingleReport,
  previewReport,
  downloadReport,
  type ProjectData,
  type TaskData,
  type FileData,
  type AIInsight,
  type ReportOptions,
} from '../services/reportGenerator';
import { 
  getProject, 
  getProjectSteps, 
  getProjectFiles,
  getProjectTasks,
} from '../services/api';
import { Project, ClientInfo, Requirements, Competitor, Brief, Strategy } from '../types';
import AIDialog from '../components/AIDialog';

// 项目报告页面组件
const ProjectReportPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  // 加载状态
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  
  // 项目数据
  const [project, setProject] = useState<Project | null>(null);
  const [clientInfo, setClientInfo] = useState<Partial<ClientInfo>>({});
  const [requirements, setRequirements] = useState<Partial<Requirements>>({});
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [brief, setBrief] = useState<Partial<Brief>>({});
  const [strategy, setStrategy] = useState<Partial<Strategy>>({});
  const [files, setFiles] = useState<FileData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  
  // 报告选项
  const [showSettings, setShowSettings] = useState(true);
  const [options, setOptions] = useState<ReportOptions>({
    includeChatSummary: true,
    includeTasks: true,
    includeFiles: true,
    includeChart: false,
  });
  const [aiSummary, setAiSummary] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  // 加载项目数据
  const loadProjectData = useCallback(async () => {
    if (!projectId || projectId === 'new') {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // 加载项目基本信息
      const projectData = await getProject(projectId);
      setProject(projectData);
      
      // 加载项目详情
      const stepsData = await getProjectSteps(projectId);
      if (stepsData) {
        setClientInfo(stepsData.clientInfo || {});
        setRequirements(stepsData.requirements || {});
        setCompetitors(stepsData.competitors || []);
        setBrief(stepsData.brief || {});
        setStrategy(stepsData.strategy || {});
      }
      
      // 加载文件列表
      try {
        const filesData = await getProjectFiles(projectId);
        setFiles((filesData || []).map((f) => ({
          id: f.id,
          name: f.name,
          type: (f.type || 'other') as string,
          size: f.size || 0,
          uploadedAt: f.uploadedAt || f.createdAt,
          url: f.url,
        })));
      } catch (e) {
        console.warn('加载文件列表失败:', e);
      }
      
      // 加载任务列表
      try {
        const tasksData = await getProjectTasks(projectId);
        setTasks((tasksData || []).map((t) => ({
          id: t.id,
          title: t.title,
          status: (t.status || 'pending') as string,
          completedAt: t.completedAt,
        })));
      } catch (e) {
        console.warn('加载任务列表失败:', e);
      }
      
    } catch (error) {
      console.error('加载项目数据失败:', error);
      setResult({ success: false, message: '加载项目数据失败' });
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  // 初始化加载
  React.useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);
  
  // 切换选项
  const toggleOption = useCallback((optionId: keyof ReportOptions) => {
    setOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  }, []);
  
  // 添加AI建议
  const addSuggestion = useCallback(() => {
    setAiSuggestions(prev => [...prev, '']);
  }, []);
  
  // 移除AI建议
  const removeSuggestion = useCallback((index: number) => {
    setAiSuggestions(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // 更新AI建议
  const updateSuggestion = useCallback((index: number, value: string) => {
    setAiSuggestions(prev => prev.map((s, i) => i === index ? value : s));
  }, []);
  
  // 构建报告数据
  const reportData = useMemo((): ProjectData => {
    if (!project) {
      return {
        projectId: projectId || '',
        projectName: '未命名项目',
        clientName: clientInfo.companyName || '未知客户',
        projectStatus: 'active',
        progressPercent: 50,
        projectManager: '未指定',
        startDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks,
        files,
      };
    }
    
    // 计算项目进度
    const totalSteps = 5;
    let completedSteps = 0;
    if (clientInfo.companyName) completedSteps++;
    if (requirements.projectType) completedSteps++;
    if (competitors.length > 0) completedSteps++;
    if (brief.projectOverview) completedSteps++;
    if (strategy.overallStrategy) completedSteps++;
    const progressPercent = Math.round((completedSteps / totalSteps) * 100);
    
    // 构建AI洞察
    const aiInsights: AIInsight[] = [];
    if (brief.projectOverview) {
      aiInsights.push({
        type: 'highlight',
        content: `项目定位：${brief.projectOverview}`,
      });
    }
    if (requirements.coreMessage) {
      aiInsights.push({
        type: 'summary',
        content: `核心信息：${requirements.coreMessage}`,
      });
    }
    if (competitors.length > 0) {
      aiInsights.push({
        type: 'risk',
        content: `竞品分析已完成，识别出${competitors.length}个主要竞品`,
      });
    }
    
    return {
      projectId: project.id,
      projectName: project.name,
      clientName: project.clientName,
      projectStatus: project.status,
      progressPercent,
      projectManager: '未指定',
      startDate: project.createdAt,
      updatedAt: project.updatedAt,
      clientInfo,
      requirements,
      competitors,
      brief,
      strategy,
      tasks,
      files,
      chatSummary: aiSummary || undefined,
      aiInsights,
    };
  }, [project, projectId, clientInfo, requirements, competitors, brief, strategy, tasks, files, aiSummary]);
  
  // 生成并执行操作
  const handleExport = useCallback(async (action: 'preview' | 'download' | 'print') => {
    setGenerating(true);
    setResult(null);
    
    try {
      const exportOptions: ReportOptions = {
        ...options,
        aiSummary: aiSummary || undefined,
        aiSuggestions: aiSuggestions.filter(Boolean),
      };
      
      const reportResult = await generateSingleReport(reportData, exportOptions);
      
      if (reportResult.success && reportResult.html) {
        setResult({ success: true, message: '报告生成成功！' });
        
        switch (action) {
          case 'preview':
            previewReport(reportResult.html);
            break;
          case 'download':
            downloadReport(reportResult.html, `${reportData.projectName}-阶段汇报.html`);
            break;
          case 'print':
            previewReport(reportResult.html);
            break;
        }
      } else {
        setResult({ success: false, message: reportResult.error || '生成失败' });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : '生成报告失败' 
      });
    } finally {
      setGenerating(false);
    }
  }, [reportData, options, aiSummary, aiSuggestions]);
  
  // 计算统计数据
  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const fileTypes: Record<string, number> = {};
    files.forEach(f => {
      fileTypes[f.type] = (fileTypes[f.type] || 0) + 1;
    });
    
    return {
      totalTasks,
      completedTasks,
      taskRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalFiles: files.length,
      fileTypes,
    };
  }, [tasks, files]);
  
  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">加载项目数据...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/projects/workspace/${projectId}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回项目</span>
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <h1 className="text-lg font-bold">纸质汇报夹</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadProjectData()}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="刷新数据"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              {/* AI对话框开关 */}
              <button
                onClick={() => setShowAIDialog(!showAIDialog)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  showAIDialog 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                }`}
                title="AI对话助手"
              >
                <Sparkles className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">AI助手</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 主内容 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 项目信息卡片 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{reportData.projectName}</h2>
              <p className="text-gray-500 mt-1">{reportData.clientName}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  reportData.projectStatus === 'active' 
                    ? 'bg-green-100 text-green-700'
                    : reportData.projectStatus === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {reportData.projectStatus === 'active' ? '进行中' : 
                   reportData.projectStatus === 'completed' ? '已完成' : '已归档'}
                </span>
                <span className="text-sm text-gray-500">
                  项目进度：{reportData.progressPercent}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{reportData.progressPercent}%</div>
              <div className="text-sm text-gray-500">完成度</div>
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="mt-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                style={{ width: `${reportData.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.completedTasks}/{stats.totalTasks}</div>
            <div className="text-sm text-gray-500 mt-1">任务完成</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalFiles}</div>
            <div className="text-sm text-gray-500 mt-1">项目文件</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{competitors.length}</div>
            <div className="text-sm text-gray-500 mt-1">竞品分析</div>
          </div>
        </div>
        
        {/* 设置面板 */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="font-medium">导出设置</span>
            </div>
            {showSettings ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showSettings && (
            <div className="px-6 pb-6 border-t border-gray-100">
              {/* 导出选项 */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeChatSummary}
                    onChange={() => toggleOption('includeChatSummary')}
                    className="mt-1 w-4 h-4"
                  />
                  <div>
                    <div className="font-medium text-sm">沟通摘要</div>
                    <div className="text-xs text-gray-500">包含AI总结的关键对话</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeTasks}
                    onChange={() => toggleOption('includeTasks')}
                    className="mt-1 w-4 h-4"
                  />
                  <div>
                    <div className="font-medium text-sm">任务进度</div>
                    <div className="text-xs text-gray-500">包含待办事项完成情况</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeFiles}
                    onChange={() => toggleOption('includeFiles')}
                    className="mt-1 w-4 h-4"
                  />
                  <div>
                    <div className="font-medium text-sm">文件清单</div>
                    <div className="text-xs text-gray-500">包含项目文件列表</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeChart}
                    onChange={() => toggleOption('includeChart')}
                    className="mt-1 w-4 h-4"
                  />
                  <div>
                    <div className="font-medium text-sm">数据图表</div>
                    <div className="text-xs text-gray-500">包含数据看板截图</div>
                  </div>
                </label>
              </div>
              
              {/* AI洞察设置 */}
              <div className="mt-6">
                <label className="block font-medium text-sm mb-2">AI洞察总结（可选）</label>
                <textarea
                  value={aiSummary}
                  onChange={(e) => setAiSummary(e.target.value)}
                  placeholder="输入项目亮点总结，将自动添加到报告中..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                  rows={3}
                />
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-sm">建议关注项（可选）</label>
                  <button
                    onClick={addSuggestion}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    添加
                  </button>
                </div>
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={suggestion}
                      onChange={(e) => updateSuggestion(index, e.target.value)}
                      placeholder={`建议 ${index + 1}...`}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                    <button
                      onClick={() => removeSuggestion(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* 结果提示 */}
        {result && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            result.success 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {result.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{result.message}</span>
          </div>
        )}
        
        {/* 导出操作 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium mb-4">导出方式</h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleExport('preview')}
              disabled={generating}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Eye className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-medium">预览报告</span>
              <span className="text-xs text-gray-500">在新窗口查看</span>
            </button>
            
            <button
              onClick={() => handleExport('download')}
              disabled={generating}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
              ) : (
                <Download className="w-6 h-6 text-gray-600" />
              )}
              <span className="text-sm font-medium">下载HTML</span>
              <span className="text-xs text-gray-500">保存到本地</span>
            </button>
            
            <button
              onClick={() => handleExport('print')}
              disabled={generating}
              className="flex flex-col items-center gap-2 p-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Printer className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">打印报告</span>
              <span className="text-xs text-gray-400">A4纸张最佳</span>
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p>💡 提示：生成的报告支持直接打印（Ctrl+P / Cmd+P），推荐使用Chrome浏览器以获得最佳打印效果。</p>
            <p className="mt-1">报告采用黑白打印友好设计，无需彩色打印机即可清晰阅读。</p>
          </div>
        </div>

        {/* AI助手提示卡片 */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">需要AI帮助优化报告？</h3>
              <p className="text-sm text-gray-600 mb-3">点击右上角的"AI助手"按钮，可以通过对话方式调整报告内容、补充项目亮点、生成执行摘要等。</p>
              <button
                onClick={() => setShowAIDialog(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                打开AI对话助手
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI对话框 */}
      {showAIDialog && (
        <AIDialog 
          projectId={projectId} 
          projectName={project?.name || '未命名项目'}
          onAction={(action, data) => {
            if (action === 'update-summary' && data) {
              setAiSummary(data);
            }
          }}
        />
      )}
    </div>
  );
};

export default ProjectReportPage;
