import React, { useState, useEffect } from 'react';
import { Folder, Edit2, X, Download, Eye, FileText, Users, Clock, TrendingUp, MoreVertical, Trash2, Archive, CheckCircle } from 'lucide-react';

const API_BASE = '';

interface Project {
  id: string;
  name: string;
  clientName: string;
  status: string;
  industry?: string;
  brandName?: string;
  targetAudience?: string;
  coreMessage?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  _count?: { briefs: number; strategies: number };
}

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  archivedProjects: number;
  thisMonthCreated: number;
  briefsGenerated: number;
  strategiesGenerated: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({
    name: '', clientName: '', status: '', industry: '', brandName: '',
    targetAudience: '', coreMessage: ''
  });
  const [saving, setSaving] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchProjects(pagination.page);
    fetchStats();
  }, [statusFilter, debouncedSearch]);

  const fetchProjects = async (page: number = 1) => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter && { status: statusFilter }),
        ...(debouncedSearch && { search: debouncedSearch })
      });

      const response = await fetch(`${API_BASE}/api/admin/projects?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.data.projects);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || '获取数据失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/projects/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (err) { console.error(err); }
  };

  const handlePageChange = (newPage: number) => {
    fetchProjects(newPage);
  };

  const handleViewProject = async (project: Project) => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE}/api/admin/projects/${project.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setViewingProject(data.data.project);
    } catch (err) { console.error(err); }
    setViewingProject(project);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditForm({
      name: project.name,
      clientName: project.clientName,
      status: project.status,
      industry: project.industry || '',
      brandName: project.brandName || '',
      targetAudience: project.targetAudience || '',
      coreMessage: project.coreMessage || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProject) return;
    const token = localStorage.getItem('adminToken');
    setSaving(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...editForm } : p));
        setEditingProject(null);
      } else {
        alert(data.error || '保存失败');
      }
    } catch (err) {
      alert('网络错误');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('确定要删除这个项目吗？此操作不可恢复。')) {
      return;
    }
    
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProjects(projects.filter(p => p.id !== projectId));
        setPagination({ ...pagination, total: pagination.total - 1 });
        setSelectedProjects(selectedProjects.filter(id => id !== projectId));
      } else {
        alert(data.error || '删除失败');
      }
    } catch (err) {
      alert('网络错误');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedProjects.length === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedProjects.length} 个项目吗？此操作不可恢复。`)) {
      return;
    }
    
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/projects/batch-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ projectIds: selectedProjects })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProjects(projects.filter(p => !selectedProjects.includes(p.id)));
        setPagination({ ...pagination, total: pagination.total - selectedProjects.length });
        setSelectedProjects([]);
      } else {
        alert(data.error || '批量删除失败');
      }
    } catch (err) {
      alert('网络错误');
    }
  };

  const handleBatchUpdateStatus = async (status: string) => {
    if (selectedProjects.length === 0) return;
    
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/projects/batch-update-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ projectIds: selectedProjects, status })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProjects(projects.map(p => 
          selectedProjects.includes(p.id) ? { ...p, status } : p
        ));
        setSelectedProjects([]);
      } else {
        alert(data.error || '批量更新失败');
      }
    } catch (err) {
      alert('网络错误');
    }
  };

  const handleExportProjects = async () => {
    setExportLoading(true);
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/projects/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const csv = [
          ['项目名称', '客户名称', '所属用户', '状态', '行业', '品牌名称', '创建时间'].join(','),
          ...data.data.projects.map((p: Project) => [
            p.name, p.clientName, p.user.username,
            p.status === 'active' ? '进行中' : p.status === 'completed' ? '已完成' : '已归档',
            p.industry || '', p.brandName || '', new Date(p.createdAt).toLocaleDateString('zh-CN')
          ].join(','))
        ].join('\n');
        
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `项目列表_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-green-100', text: 'text-green-700', label: '进行中' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: '已完成' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-600', label: '已归档' }
    };
    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  return (
    <div>
      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Folder className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">项目总数</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">进行中</p>
                <p className="text-xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">已完成</p>
                <p className="text-xl font-bold text-gray-900">{stats.completedProjects}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Archive className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">已归档</p>
                <p className="text-xl font-bold text-gray-900">{stats.archivedProjects}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">本月新增</p>
                <p className="text-xl font-bold text-gray-900">{stats.thisMonthCreated}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">产出内容</p>
                <p className="text-xl font-bold text-gray-900">{stats.briefsGenerated + stats.strategiesGenerated}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 头部操作栏 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="搜索项目名称或客户名称..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1 min-w-[200px]"
        />
        <button
          onClick={handleExportProjects}
          disabled={exportLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exportLoading ? '导出中...' : '导出数据'}
        </button>
        <button
          onClick={handleBatchDelete}
          disabled={selectedProjects.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          批量删除 ({selectedProjects.length})
        </button>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">全部状态</option>
              <option value="active">进行中</option>
              <option value="completed">已完成</option>
              <option value="archived">已归档</option>
            </select>
          </div>
          
          {selectedProjects.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">已选择 {selectedProjects.length} 项</span>
              <button
                onClick={() => handleBatchUpdateStatus('active')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
              >
                设为进行中
              </button>
              <button
                onClick={() => handleBatchUpdateStatus('completed')}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
              >
                设为已完成
              </button>
              <button
                onClick={() => handleBatchUpdateStatus('archived')}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                设为已归档
              </button>
            </div>
          )}
          
          <div className="text-sm text-gray-500">
            共 {pagination.total} 个项目
          </div>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10">
                  <input
                    type="checkbox"
                    checked={selectedProjects.length === projects.length && projects.length > 0}
                    onChange={(e) => setSelectedProjects(e.target.checked ? projects.map(p => p.id) : [])}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">项目名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所属用户</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">加载中...</td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">暂无数据</td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Folder className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{project.name}</p>
                          {project.industry && (
                            <p className="text-xs text-gray-500">{project.industry}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {project.clientName || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{project.user.username}</p>
                        <p className="text-sm text-gray-500">{project.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(project.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(project.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewProject(project)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />查看
                        </button>
                        <button
                          onClick={() => handleEditProject(project)}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />编辑
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {!loading && projects.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              共 {pagination.total} 条记录，第 {pagination.page}/{pagination.totalPages} 页
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 项目详情弹窗 */}
      {viewingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Folder className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewingProject.name}</h3>
                  <p className="text-sm text-gray-500">{viewingProject.clientName || '未设置客户名'}</p>
                </div>
              </div>
              <button onClick={() => setViewingProject(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">基本信息</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">状态</p>
                      <div className="mt-1">{getStatusBadge(viewingProject.status)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">所属用户</p>
                      <p className="font-medium text-gray-900 mt-1">{viewingProject.user.username}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">创建时间</p>
                      <p className="font-medium text-gray-900 mt-1">{new Date(viewingProject.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">更新时间</p>
                      <p className="font-medium text-gray-900 mt-1">{new Date(viewingProject.updatedAt).toLocaleString('zh-CN')}</p>
                    </div>
                  </div>
                </div>

                {/* 项目详情 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">项目详情</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">行业</p>
                      <p className="font-medium text-gray-900 mt-1">{viewingProject.industry || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">品牌名称</p>
                      <p className="font-medium text-gray-900 mt-1">{viewingProject.brandName || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">目标受众</p>
                      <p className="font-medium text-gray-900 mt-1">{viewingProject.targetAudience || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">核心信息</p>
                      <p className="font-medium text-gray-900 mt-1">{viewingProject.coreMessage || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* 统计数据 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">产出统计</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4 flex items-center gap-3">
                      <FileText className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{viewingProject._count?.briefs || 0}</p>
                        <p className="text-sm text-gray-500">已生成Brief</p>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-green-600">{viewingProject._count?.strategies || 0}</p>
                        <p className="text-sm text-gray-500">已生成策略</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <a
                href={`/projects/workspace/${viewingProject.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                进入工作区
              </a>
              <button
                onClick={() => { setViewingProject(null); handleEditProject(viewingProject); }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                编辑项目
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑项目弹窗 */}
      {editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">编辑项目</h3>
              <button onClick={() => setEditingProject(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客户名称</label>
                <input
                  type="text"
                  value={editForm.clientName}
                  onChange={(e) => setEditForm({...editForm, clientName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="archived">已归档</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">行业</label>
                <input
                  type="text"
                  value={editForm.industry}
                  onChange={(e) => setEditForm({...editForm, industry: e.target.value})}
                  placeholder="如：快消品、金融、科技等"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">品牌名称</label>
                <input
                  type="text"
                  value={editForm.brandName}
                  onChange={(e) => setEditForm({...editForm, brandName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目标受众</label>
                <textarea
                  value={editForm.targetAudience}
                  onChange={(e) => setEditForm({...editForm, targetAudience: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">核心信息</label>
                <textarea
                  value={editForm.coreMessage}
                  onChange={(e) => setEditForm({...editForm, coreMessage: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingProject(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectsPage;
