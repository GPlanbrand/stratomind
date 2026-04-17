/**
 * 纸质汇报夹 - 报告导出组件
 * 支持一键生成可打印的项目阶段汇报文档
 */

import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Eye, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
  ChevronDown,
  ChevronUp,
  FileDown,
  Copy,
  RefreshCw
} from 'lucide-react';
import { 
  generateSingleReport, 
  generateBatchReport, 
  previewReport, 
  downloadReport,
  type ProjectData,
  type ReportOptions,
  type ReportResult 
} from '../services/reportGenerator';

interface ReportExportProps {
  /** 项目数据 */
  projectData: ProjectData;
  /** 是否显示设置面板 */
  showSettings?: boolean;
  /** 自定义标题 */
  title?: string;
  /** 导出按钮文字 */
  buttonText?: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 按钮样式变体 */
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  /** 组件尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示在模态框中 */
  modal?: boolean;
  /** 模态框标题 */
  modalTitle?: string;
  /** 模态框宽度 */
  modalWidth?: string;
  /** 关闭回调 */
  onClose?: () => void;
  /** 成功后回调 */
  onSuccess?: (result: ReportResult) => void;
  /** 失败后回调 */
  onError?: (error: string) => void;
}

interface ExportOption {
  id: keyof ReportOptions;
  label: string;
  description: string;
  defaultValue: boolean;
}

const DEFAULT_OPTIONS: ExportOption[] = [
  {
    id: 'includeChatSummary',
    label: '沟通摘要',
    description: '包含AI总结的关键对话摘要',
    defaultValue: true,
  },
  {
    id: 'includeTasks',
    label: '任务进度',
    description: '包含待办事项完成情况',
    defaultValue: true,
  },
  {
    id: 'includeFiles',
    label: '文件清单',
    description: '包含项目文件列表',
    defaultValue: true,
  },
  {
    id: 'includeChart',
    label: '数据图表',
    description: '包含数据看板截图',
    defaultValue: false,
  },
];

// 进度环组件
const ProgressRing: React.FC<{ percent: number; size?: number }> = ({ 
  percent, 
  size = 60 
}) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="#4CAF50"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: offset,
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="12"
        fontWeight="bold"
        fill="#333"
      >
        {percent}%
      </text>
    </svg>
  );
};

// 预览卡片组件
const ReportPreviewCard: React.FC<{ projectData: ProjectData }> = ({ projectData }) => {
  const tasks = projectData.tasks || [];
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const files = projectData.files || [];

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      background: '#f9fafb',
      fontSize: '12px',
    }}>
      {/* 标题 */}
      <div style={{
        borderBottom: '2px solid #333',
        paddingBottom: '8px',
        marginBottom: '12px',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
          【{projectData.projectName}】阶段汇报
        </h3>
        <p style={{ color: '#666', margin: '4px 0 0', fontSize: '11px' }}>
          生成日期：{new Date().toLocaleDateString('zh-CN')}
        </p>
      </div>

      {/* 项目信息 */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold', minWidth: '70px' }}>项目状态：</span>
          <span>
            {projectData.projectStatus === 'active' ? '进行中' : 
             projectData.projectStatus === 'completed' ? '已完成' : '已归档'}
            <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#4CAF50' }}>
              ({projectData.progressPercent}%)
            </span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold', minWidth: '70px' }}>客户名称：</span>
          <span>{projectData.clientName}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontWeight: 'bold', minWidth: '70px' }}>待办事项：</span>
          <span>{completedTasks}/{tasks.length} 已完成</span>
        </div>
        {files.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontWeight: 'bold', minWidth: '70px' }}>项目文件：</span>
            <span>{files.length} 个文件</span>
          </div>
        )}
      </div>

      {/* AI洞察预览 */}
      {(projectData.aiInsights && projectData.aiInsights.length > 0) && (
        <div style={{
          background: '#fff8e1',
          border: '1px solid #ffe082',
          borderRadius: '4px',
          padding: '8px',
          fontSize: '11px',
        }}>
          <span style={{ fontWeight: 'bold' }}>🤖 AI洞察：</span>
          {projectData.aiInsights.slice(0, 2).map((insight, i) => (
            <div key={i} style={{ marginTop: '4px' }}>• {insight.content}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// 批量选择组件
const BatchProjectSelector: React.FC<{
  projects: ProjectData[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}> = ({ projects, selectedIds, onToggle, onSelectAll, onDeselectAll }) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px' 
      }}>
        <span style={{ fontWeight: 'bold' }}>
          选择项目 ({selectedIds.length}/{projects.length})
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onSelectAll}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            全选
          </button>
          <button
            onClick={onDeselectAll}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            取消全选
          </button>
        </div>
      </div>
      <div style={{ 
        maxHeight: '200px', 
        overflowY: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
      }}>
        {projects.map(project => (
          <label
            key={project.projectId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
              background: selectedIds.includes(project.projectId) ? '#f0fdf4' : '#fff',
            }}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(project.projectId)}
              onChange={() => onToggle(project.projectId)}
              style={{ width: '16px', height: '16px' }}
            />
            <span style={{ flex: 1, fontSize: '12px' }}>{project.projectName}</span>
            <span style={{ fontSize: '10px', color: '#666' }}>
              {project.clientName}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

// 主组件
const ReportExport: React.FC<ReportExportProps> = ({
  projectData,
  showSettings: initialShowSettings = true,
  title = '纸质汇报夹',
  buttonText = '导出报告',
  showIcon = true,
  variant = 'default',
  size = 'md',
  modal = false,
  modalTitle = '生成项目汇报',
  modalWidth = '600px',
  onClose,
  onSuccess,
  onError,
}) => {
  const [isOpen, setIsOpen] = useState(modal);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(initialShowSettings);
  const [showPreview, setShowPreview] = useState(false);
  const [options, setOptions] = useState<ReportOptions>({
    includeChatSummary: true,
    includeTasks: true,
    includeFiles: true,
    includeChart: false,
    chartImageUrl: '',
  });
  const [aiSummary, setAiSummary] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [result, setResult] = useState<ReportResult | null>(null);

  // 批量导出相关状态
  const [batchMode, setBatchMode] = useState(false);
  const [batchProjects, setBatchProjects] = useState<ProjectData[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // 切换选项
  const toggleOption = useCallback((optionId: keyof ReportOptions) => {
    setOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  }, []);

  // 处理导出
  const handleExport = useCallback(async (action: 'preview' | 'download' | 'print') => {
    setIsGenerating(true);
    setResult(null);

    try {
      const exportOptions: ReportOptions = {
        ...options,
        aiSummary: aiSummary || undefined,
        aiSuggestions: aiSuggestions.filter(Boolean),
      };

      const reportResult = await generateSingleReport(projectData, exportOptions);

      if (reportResult.success && reportResult.html) {
        setResult(reportResult);
        
        switch (action) {
          case 'preview':
            previewReport(reportResult.html);
            break;
          case 'download':
            downloadReport(reportResult.html, `${projectData.projectName}-阶段汇报.html`);
            break;
          case 'print':
            previewReport(reportResult.html);
            break;
        }
        
        onSuccess?.(reportResult);
      } else {
        onError?.(reportResult.error || '生成报告失败');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '生成报告失败';
      setResult({ success: false, error: errorMsg });
      onError?.(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  }, [projectData, options, aiSummary, aiSuggestions, onSuccess, onError]);

  // 处理批量导出
  const handleBatchExport = useCallback(async (action: 'preview' | 'download' | 'print') => {
    if (selectedProjectIds.length === 0) {
      onError?.('请至少选择一个项目');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const selectedProjects = batchProjects.filter(p => 
        selectedProjectIds.includes(p.projectId)
      );

      const exportOptions: ReportOptions = {
        ...options,
        aiSummary: aiSummary || undefined,
        aiSuggestions: aiSuggestions.filter(Boolean),
      };

      const reportResult = await generateBatchReport(selectedProjects, exportOptions);

      if (reportResult.success && reportResult.html) {
        setResult(reportResult);
        
        switch (action) {
          case 'preview':
            previewReport(reportResult.html);
            break;
          case 'download':
            downloadReport(reportResult.html, `项目汇报合订本-${selectedProjectIds.length}个项目.html`);
            break;
          case 'print':
            previewReport(reportResult.html);
            break;
        }
        
        onSuccess?.(reportResult);
      } else {
        onError?.(reportResult.error || '生成批量报告失败');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '生成批量报告失败';
      setResult({ success: false, error: errorMsg });
      onError?.(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  }, [batchProjects, selectedProjectIds, options, aiSummary, aiSuggestions, onSuccess, onError]);

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

  // 按钮样式
  const getButtonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s',
    };

    // 尺寸
    switch (size) {
      case 'sm':
        baseStyle.padding = '6px 12px';
        baseStyle.fontSize = '12px';
        break;
      case 'lg':
        baseStyle.padding = '12px 24px';
        baseStyle.fontSize = '16px';
        break;
      default:
        baseStyle.padding = '10px 18px';
        baseStyle.fontSize = '14px';
    }

    // 变体
    switch (variant) {
      case 'primary':
        baseStyle.background = '#333';
        baseStyle.color = '#fff';
        break;
      case 'secondary':
        baseStyle.background = '#f5f5f5';
        baseStyle.color = '#333';
        baseStyle.border = '1px solid #ddd';
        break;
      case 'outline':
        baseStyle.background = 'transparent';
        baseStyle.color = '#333';
        baseStyle.border = '1px solid #333';
        break;
      default:
        baseStyle.background = '#333';
        baseStyle.color = '#fff';
    }

    return baseStyle;
  };

  // 触发按钮
  const TriggerButton = () => (
    <button
      style={getButtonStyle()}
      onClick={() => setIsOpen(true)}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 size={16} className="animate-spin" />
      ) : showIcon ? (
        <FileText size={16} />
      ) : null}
      {buttonText}
    </button>
  );

  // 弹窗内容
  const ModalContent = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={() => onClose?.()}>
      <div 
        style={{
          background: '#fff',
          borderRadius: '12px',
          width: modalWidth,
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={() => {
              setIsOpen(false);
              onClose?.();
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
            }}
          >
            ×
          </button>
        </div>

        {/* 内容区 */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* 模式切换 */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '16px',
            padding: '4px',
            background: '#f5f5f5',
            borderRadius: '8px',
          }}>
            <button
              onClick={() => setBatchMode(false)}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: !batchMode ? '#fff' : 'transparent',
                color: !batchMode ? '#333' : '#666',
                fontWeight: !batchMode ? 'bold' : 'normal',
                cursor: 'pointer',
                boxShadow: !batchMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              单项目报告
            </button>
            <button
              onClick={() => setBatchMode(true)}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: batchMode ? '#fff' : 'transparent',
                color: batchMode ? '#333' : '#666',
                fontWeight: batchMode ? 'bold' : 'normal',
                cursor: 'pointer',
                boxShadow: batchMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              批量合订本
            </button>
          </div>

          {/* 批量模式：项目选择 */}
          {batchMode && (
            <BatchProjectSelector
              projects={batchProjects}
              selectedIds={selectedProjectIds}
              onToggle={(id) => {
                setSelectedProjectIds(prev =>
                  prev.includes(id) 
                    ? prev.filter(i => i !== id)
                    : [...prev, id]
                );
              }}
              onSelectAll={() => setSelectedProjectIds(batchProjects.map(p => p.projectId))}
              onDeselectAll={() => setSelectedProjectIds([])}
            />
          )}

          {/* 设置面板 */}
          <div style={{ marginBottom: '16px' }}>
            <div
              onClick={() => setShowSettings(!showSettings)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <Settings size={16} />
              <span style={{ fontWeight: 'bold' }}>导出设置</span>
              {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {showSettings && (
              <div style={{ padding: '12px 0' }}>
                {/* 导出选项 */}
                <div style={{ marginBottom: '16px' }}>
                  {DEFAULT_OPTIONS.map(option => (
                    <label
                      key={option.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '8px 0',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={options[option.id] as boolean}
                        onChange={() => toggleOption(option.id)}
                        style={{ width: '16px', height: '16px', marginTop: '2px' }}
                      />
                      <div>
                        <div style={{ fontWeight: '500' }}>{option.label}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* AI洞察设置 */}
                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                    AI洞察总结（可选）
                  </label>
                  <textarea
                    value={aiSummary}
                    onChange={(e) => setAiSummary(e.target.value)}
                    placeholder="输入项目亮点总结..."
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '12px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />

                  <div style={{ marginTop: '12px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}>
                      <label style={{ fontWeight: 'bold' }}>建议关注项（可选）</label>
                      <button
                        onClick={addSuggestion}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          background: '#f5f5f5',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        + 添加
                      </button>
                    </div>
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ 
                          width: '20px', 
                          height: '20px',
                          background: '#ff9800',
                          color: '#fff',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          flexShrink: 0,
                        }}>
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={suggestion}
                          onChange={(e) => updateSuggestion(index, e.target.value)}
                          placeholder={`建议 ${index + 1}...`}
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}
                        />
                        <button
                          onClick={() => removeSuggestion(index)}
                          style={{
                            padding: '4px 8px',
                            background: '#fee',
                            border: '1px solid #fcc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#c00',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 预览面板 */}
          <div style={{ marginBottom: '16px' }}>
            <div
              onClick={() => setShowPreview(!showPreview)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <Eye size={16} />
              <span style={{ fontWeight: 'bold' }}>报告预览</span>
              {showPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {showPreview && (
              <div style={{ padding: '12px 0' }}>
                {batchMode && selectedProjectIds.length > 0 ? (
                  batchProjects
                    .filter(p => selectedProjectIds.includes(p.projectId))
                    .slice(0, 3)
                    .map(project => (
                      <div key={project.projectId} style={{ marginBottom: '12px' }}>
                        <ReportPreviewCard projectData={project} />
                      </div>
                    ))
                ) : (
                  <ReportPreviewCard projectData={projectData} />
                )}
                {batchMode && selectedProjectIds.length > 3 && (
                  <p style={{ textAlign: 'center', color: '#666', fontSize: '11px' }}>
                    还有 {selectedProjectIds.length - 3} 个项目...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 结果提示 */}
          {result && (
            <div style={{
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: result.success ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`,
            }}>
              {result.success ? (
                <>
                  <CheckCircle size={16} color="#22c55e" />
                  <span style={{ color: '#166534', fontSize: '12px' }}>
                    报告生成成功！浏览器将自动打开打印预览。
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} color="#ef4444" />
                  <span style={{ color: '#991b1b', fontSize: '12px' }}>
                    {result.error || '生成失败，请重试'}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            取消
          </button>
          <button
            onClick={() => batchMode 
              ? handleBatchExport('preview') 
              : handleExport('preview')
            }
            disabled={isGenerating}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              background: '#f5f5f5',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isGenerating ? 0.6 : 1,
            }}
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
            预览
          </button>
          <button
            onClick={() => batchMode 
              ? handleBatchExport('download') 
              : handleExport('download')
            }
            disabled={isGenerating}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              background: '#333',
              color: '#fff',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isGenerating ? 0.6 : 1,
            }}
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            下载HTML
          </button>
          <button
            onClick={() => batchMode 
              ? handleBatchExport('print') 
              : handleExport('print')
            }
            disabled={isGenerating}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              background: '#4CAF50',
              color: '#fff',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isGenerating ? 0.6 : 1,
            }}
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
            打印报告
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染
  if (modal) {
    if (!isOpen) return <TriggerButton />;
    return <ModalContent />;
  }

  return (
    <div>
      <TriggerButton />
      {isOpen && <ModalContent />}
    </div>
  );
};

// 便捷导出函数
export const exportProjectReport = (
  projectData: ProjectData,
  options?: ReportOptions
): Promise<ReportResult> => {
  return generateSingleReport(projectData, options);
};

export const exportBatchReports = (
  projects: ProjectData[],
  options?: ReportOptions
): Promise<ReportResult> => {
  return generateBatchReport(projects, options);
};

export default ReportExport;
