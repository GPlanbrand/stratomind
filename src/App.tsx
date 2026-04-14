import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import WorkspacePage from './pages/WorkspacePage'
import AnalysisChartsPage from './pages/AnalysisChartsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MemberPage from './pages/MemberPage'
import Layout from './components/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="workspace/:projectId?" element={<WorkspacePage />} />
        <Route path="analysis-charts" element={<AnalysisChartsPage />} />
        <Route path="member" element={<MemberPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}

export default App
