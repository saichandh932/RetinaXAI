import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'
import {
  Eye, PlusCircle, Clock, FileText, BarChart2,
  Cpu, TrendingUp, CheckCircle, XCircle,
  AlertTriangle, Users, Activity
} from 'lucide-react'

const METRICS = [
  { label: 'Patients Screened Today', value: '47', sub: '+12% vs yesterday', icon: Users, color: 'var(--color-primary-light)', bg: 'var(--color-primary-glow)' },
  { label: 'Images Accepted', value: '43', sub: '91.5% acceptance rate', icon: CheckCircle, color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  { label: 'Images Rejected', value: '4', sub: 'Ungradable — recaptured', icon: XCircle, color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
  { label: 'Referable Cases', value: '9', sub: 'DR Level 2+ detected', icon: AlertTriangle, color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  { label: 'Pending Review', value: '7', sub: 'Awaiting ophthalmologist', icon: Clock, color: 'var(--color-referral)', bg: 'var(--color-referral-bg)' },
]

const RECENT_SCREENINGS = [
  { id: 'SCR-20260909-047', time: '10:31 AM', quality: 'GOOD',  grade: 'Level 2', severity: 'Moderate NPDR', referral: true,  status: 'PENDING REVIEW', priority: 'MEDIUM' },
  { id: 'SCR-20260909-046', time: '10:14 AM', quality: 'GOOD',  grade: 'Level 0', severity: 'No DR',          referral: false, status: 'COMPLETE',       priority: 'LOW' },
  { id: 'SCR-20260909-045', time: '09:58 AM', quality: 'GOOD',  grade: 'Level 3', severity: 'Severe NPDR',   referral: true,  status: 'PENDING REVIEW', priority: 'HIGH' },
  { id: 'SCR-20260909-044', time: '09:42 AM', quality: 'POOR',  grade: '—',       severity: 'Ungradable',    referral: null,  status: 'RECAPTURE',      priority: '—' },
  { id: 'SCR-20260909-043', time: '09:20 AM', quality: 'GOOD',  grade: 'Level 1', severity: 'Mild NPDR',     referral: false, status: 'COMPLETE',       priority: 'LOW' },
]

const SEVERITY_COLORS = { 0: 'var(--dr-level-0)', 1: 'var(--dr-level-1)', 2: 'var(--dr-level-2)', 3: 'var(--dr-level-3)', 4: 'var(--dr-level-4)' }

export default function HomePage() {
  const { role } = useApp()
  const navigate = useNavigate()
  const [reviewedIds, setReviewedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dr_reviewed_queue_ids') || '[]')
    } catch {
      return []
    }
  })
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pendingReviewCount = RECENT_SCREENINGS.filter(row => row.status === 'PENDING REVIEW' && !reviewedIds.includes(row.id)).length

  useEffect(() => {
    const handleReviewCompleted = event => {
      setReviewedIds(previous => previous.includes(event.detail) ? previous : [...previous, event.detail])
    }
    window.addEventListener('dr-review-completed', handleReviewCompleted)
    return () => window.removeEventListener('dr-review-completed', handleReviewCompleted)
  }, [])

  return (
    <div>
      {/* Page header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{dateStr} · PHC Rajnagar, Chhattisgarh</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/new-screening')}>
            <PlusCircle size={16} /> Start New Screening
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metric-cards" style={{ marginBottom: 24 }}>
        {METRICS.map((m) => {
          const Icon = m.icon
          const metric = m.label === 'Pending Review' ? { ...m, value: pendingReviewCount } : m
          return (
            <div key={m.label} className="metric-card animate-fade-in-up">
              <div className="metric-card-icon">
                <div className="metric-card-icon-box" style={{ background: metric.bg }}>
                  <Icon size={18} color={metric.color} />
                </div>
              </div>
              <div className="metric-card-label">{metric.label}</div>
              <div className="metric-card-value" style={{ color: metric.color }}>{metric.value}</div>
              <div className="metric-card-sub">{metric.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Main grid: recent screenings + quick actions */}
      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: '1fr 340px' }}>

        {/* Recent Screenings Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Activity size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Recent Screenings
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/queue')}>
              View all
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Screening ID</th>
                  <th>Time</th>
                  <th>Quality</th>
                  <th>AI Grade</th>
                  <th>Referral</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_SCREENINGS.filter(row => !reviewedIds.includes(row.id)).map(row => (
                  <tr key={row.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/clinical')}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-primary-light)' }}>{row.id}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{row.time}</td>
                    <td>
                      <span className={`badge ${row.quality === 'GOOD' ? 'badge-success' : 'badge-danger'}`}>
                        {row.quality}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{row.grade}</td>
                    <td>
                      {row.referral === true  && <span className="badge badge-referral">⚑ REFER</span>}
                      {row.referral === false && <span className="badge badge-success">✓ NO REFERRAL</span>}
                      {row.referral === null  && <span className="badge badge-muted">—</span>}
                    </td>
                    <td>
                      <span className={`badge ${
                        row.status === 'COMPLETE'       ? 'badge-success' :
                        row.status === 'PENDING REVIEW' ? 'badge-warning' :
                        row.status === 'RECAPTURE'      ? 'badge-danger'  : 'badge-muted'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions + System Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-primary w-full" onClick={() => navigate('/new-screening')}>
                <PlusCircle size={15} /> New Screening
              </button>
              <button className="btn btn-secondary w-full" onClick={() => navigate('/queue')}>
                <Clock size={15} /> Review Queue <span className="sidebar-nav-badge" style={{ marginLeft: 'auto' }}>{pendingReviewCount}</span>
              </button>
              <button className="btn btn-secondary w-full" onClick={() => navigate('/report')}>
                <FileText size={15} /> Reports
              </button>
              <button className="btn btn-secondary w-full" onClick={() => navigate('/simulation')}>
                <Cpu size={15} /> Simulation
              </button>
              {role === 'admin' && (
                <button className="btn btn-secondary w-full" onClick={() => navigate('/admin')}>
                  <BarChart2 size={15} /> Analytics Dashboard
                </button>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">System Status</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'AI Model', value: 'Online', status: 'good' },
                { label: 'Model Version', value: 'DR-XAI v1.0', status: 'info' },
                { label: 'Last Updated', value: '2026-09-01', status: 'info' },
                { label: 'Processing Queue', value: '0 pending', status: 'good' },
                { label: 'Connectivity', value: 'LAN · 12 Mbps', status: 'good' },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 0', borderBottom: '1px solid var(--color-border)',
                }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{
                    fontSize: 'var(--text-xs)', fontWeight: 600,
                    color: row.status === 'good' ? 'var(--color-success)' : 'var(--text-secondary)'
                  }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DR screening disclaimer */}
          <div className="disclaimer-box">
            <strong>Clinical Reminder:</strong> This system is a screening aid only.
            All referable cases must be reviewed by a qualified ophthalmologist.
            AI output does not constitute a clinical diagnosis.
          </div>
        </div>
      </div>
    </div>
  )
}
