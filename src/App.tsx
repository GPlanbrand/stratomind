import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import HomeLoginPage from './pages/HomeLoginPage'
import ProjectsPage from './pages/ProjectsPage'
import WorkspacePage from './pages/WorkspacePage'
import AnalysisChartsPage from './pages/AnalysisChartsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MemberPage from './pages/MemberPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import FilesPage from './pages/FilesPage'
import EmailPage from './pages/EmailPage'
import CalendarPage from './pages/CalendarPage'
import KnowledgePage from './pages/KnowledgePage'
import AssistantPage from './pages/AssistantPage'
import Layout from './components/Layout'

function App() {
  return (
    <Routes>
      {/* 官网落地页 */}
      <Route path="/landing" element={<LandingPage />} />
      
      {/* 工作台入口 - 恢复原来的路由 */}
      <Route path="/" element={<HomeLoginPage />} />
      <Route path="/home" element={<HomeLoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/projects" element={<Layout />}>
        <Route index element={<ProjectsPage />} />
        <Route path="workspace/new" element={<WorkspacePage />} />
        <Route path="workspace/:projectId" element={<WorkspacePage />} />
        <Route path="analysis-charts" element={<AnalysisChartsPage />} />
        <Route path="member" element={<MemberPage />} />
        <Route path="files" element={<FilesPage />} />
        <Route path="email" element={<EmailPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Route>
    </Routes>
  )
}

export default App
