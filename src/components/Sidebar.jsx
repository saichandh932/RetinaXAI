import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../App.jsx'
import {
  Eye, Home, PlusCircle, Activity, FileText, Users,
  BarChart2, Cpu, PlayCircle, Settings, Clock,
  Wifi, WifiOff, RefreshCw, AlertTriangle
} from 'lucide-react'

const NAV_ITEMS = {
  operator: [
    { to: '/home',          icon: Home,        label: 'Dashboard' },
    { to: '/new-screening', icon: PlusCircle,  label: 'New Screening' },
    { to: '/quality',       icon: Eye,         label: 'Image Quality' },
    { to: '/analysis',      icon: Activity,    label: 'Analysis' },
    { to: '/clinical',      icon: FileText,    label: 'Clinical Results' },
    { to: '/settings',      icon: Settings,    label: 'Settings' },
  ],
  ophthalmologist: [
    { to: '/home',          icon: Home,        label: 'Dashboard' },
    { to: '/queue',         icon: Clock,       label: 'Review Queue',  badge: '7' },
    { to: '/review',        icon: Users,       label: 'Patient Review' },
    { to: '/clinical',      icon: FileText,    label: 'Clinical Results' },
    { to: '/xai',           icon: Eye,         label: 'Explainability' },
    { to: '/report',        icon: FileText,    label: 'Reports' },
    { to: '/settings',      icon: Settings,    label: 'Settings' },
  ],
  admin: [
    { to: '/home',          icon: Home,        label: 'Dashboard' },
    { to: '/admin',         icon: BarChart2,   label: 'Analytics' },
    { to: '/simulation',    icon: Cpu,         label: 'Simulation' },
    { to: '/queue',         icon: Clock,       label: 'Review Queue',  badge: '7' },
    { to: '/report',        icon: FileText,    label: 'Reports' },
    { to: '/settings',      icon: Settings,    label: 'Settings' },
  ],
}

const ROLE_LABELS = {
  operator:        'Screening Operator',
  ophthalmologist: 'Ophthalmologist',
  admin:           'Program Administrator',
}

export default function Sidebar() {
  const { role, online, pendingSync, setPendingSync, sidebarOpen } = useApp()
  const location = useLocation()
  const navItems = NAV_ITEMS[role] || NAV_ITEMS.operator

  const handleSync = () => {
    setTimeout(() => setPendingSync(0), 1200)
  }

  return (
    <aside className={`app-sidebar${sidebarOpen ? ' open' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">
          <div className="sidebar-brand-icon">
            <Eye size={20} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">DR VisionAI</span>
            <span className="sidebar-brand-tagline">Retinopathy Screening</span>
          </div>
        </div>
      </div>

      {/* Role indicator */}
      <div style={{ padding: '10px 12px 6px' }}>
        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>
            {ROLE_LABELS[role]}
          </div>
          <div style={{ fontSize: 10, opacity: 0.7 }}>Mode {role === 'operator' ? 'A' : role === 'ophthalmologist' ? 'B' : 'C'}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-section" style={{ flex: 1 }}>
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to ||
            (item.to !== '/home' && location.pathname.startsWith(item.to))
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`sidebar-nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={16} className="nav-icon" />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className="sidebar-nav-badge">{item.badge}</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer — Connectivity */}
      <div className="sidebar-footer">
        {/* Connectivity status */}
        <div className={`connectivity-banner ${online ? 'online' : 'offline'}`}
          style={{ marginBottom: 8 }}>
          <div className="connectivity-banner-dot" />
          {online ? (
            <><Wifi size={12} style={{ marginRight: 4 }} />System Online</>
          ) : (
            <><WifiOff size={12} style={{ marginRight: 4 }} />Offline Mode</>
          )}
        </div>

        {/* Pending sync */}
        {!online && pendingSync > 0 && (
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-warning)',
            background: 'var(--color-warning-bg)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}>
            <span>
              <AlertTriangle size={11} style={{ marginRight: 4, display: 'inline' }} />
              {pendingSync} records pending
            </span>
            <button
              onClick={handleSync}
              style={{
                background: 'none', border: 'none', color: 'var(--color-warning)',
                cursor: 'pointer', fontSize: 10, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 3,
              }}
            >
              <RefreshCw size={10} /> SYNC
            </button>
          </div>
        )}

        {/* Model version */}
        <div style={{
          marginTop: 8,
          fontSize: 10,
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}>
          DR-XAI v1.0 · Updated 2026-09-01
        </div>
      </div>
    </aside>
  )
}
