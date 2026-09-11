import React, { createContext, useContext, useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import HomePage from './pages/HomePage.jsx'
import NewScreeningPage from './pages/NewScreeningPage.jsx'
import QualityPage from './pages/QualityPage.jsx'
import AnalysisPage from './pages/AnalysisPage.jsx'
import ClinicalPage from './pages/ClinicalPage.jsx'
import ExplainabilityPage from './pages/ExplainabilityPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import ReviewPage from './pages/ReviewPage.jsx'
import QueuePage from './pages/QueuePage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import SimulationPage from './pages/SimulationPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

// ─── App Context ─────────────────────────────────────────────────────────────
export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export default function App() {
  const [role, setRole] = useState('operator') // 'operator' | 'ophthalmologist' | 'admin'
  const [demoMode, setDemoMode] = useState(false)
  const [screeningData, setScreeningData] = useState(null)
  const [online, setOnline] = useState(navigator.onLine)
  const [pendingSync, setPendingSync] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const handleOnline  = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const ctx = {
    role, setRole,
    demoMode, setDemoMode,
    screeningData, setScreeningData,
    online, pendingSync, setPendingSync,
    sidebarOpen, setSidebarOpen,
  }

  return (
    <AppContext.Provider value={ctx}>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Topbar />
          <div className="app-content">
            <Routes>
              <Route path="/"              element={<Navigate to="/home" replace />} />
              <Route path="/home"          element={<HomePage />} />
              <Route path="/new-screening" element={<NewScreeningPage />} />
              <Route path="/quality"       element={<QualityPage />} />
              <Route path="/analysis"      element={<AnalysisPage />} />
              <Route path="/clinical"      element={<ClinicalPage />} />
              <Route path="/xai"           element={<ExplainabilityPage />} />
              <Route path="/report"        element={<ReportPage />} />
              <Route path="/review"        element={<ReviewPage />} />
              <Route path="/queue"         element={<QueuePage />} />
              <Route path="/admin"         element={<AdminPage />} />
              <Route path="/simulation"    element={<SimulationPage />} />
              <Route path="/settings"      element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </AppContext.Provider>
  )
}
