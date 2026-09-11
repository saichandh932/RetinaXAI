import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Clock, ChevronUp, ChevronDown, Filter } from 'lucide-react'

const QUEUE_DATA = [
  { id: 'SCR-20260909-045', phc: 'PHC Rajnagar',  quality: 'GOOD',       grade: 'Level 3', severity: 'Severe NPDR',    referral: true,  confidence: 88, priority: 'HIGH',   status: 'PENDING',   waiting: '52 min' },
  { id: 'SCR-20260909-041', phc: 'PHC Korba',     quality: 'GOOD',       grade: 'Level 4', severity: 'Prolif. DR',    referral: true,  confidence: 93, priority: 'HIGH',   status: 'PENDING',   waiting: '1h 24min' },
  { id: 'SCR-20260909-047', phc: 'PHC Bilaspur',  quality: 'GOOD',       grade: 'Level 2', severity: 'Moderate NPDR', referral: true,  confidence: 91, priority: 'MEDIUM', status: 'PENDING',   waiting: '18 min' },
  { id: 'SCR-20260909-039', phc: 'PHC Raigarh',   quality: 'ACCEPTABLE', grade: 'Level 2', severity: 'Moderate NPDR', referral: true,  confidence: 79, priority: 'MEDIUM', status: 'PENDING',   waiting: '2h 05min' },
  { id: 'SCR-20260909-036', phc: 'PHC Ambikapur', quality: 'GOOD',       grade: 'Level 3', severity: 'Severe NPDR',   referral: true,  confidence: 85, priority: 'HIGH',   status: 'PENDING',   waiting: '3h 12min' },
  { id: 'SCR-20260909-033', phc: 'PHC Jagdalpur', quality: 'GOOD',       grade: 'Level 1', severity: 'Mild NPDR',     referral: false, confidence: 87, priority: 'LOW',    status: 'PENDING',   waiting: '4h 01min' },
  { id: 'SCR-20260909-028', phc: 'PHC Durg',      quality: 'GOOD',       grade: 'Level 2', severity: 'Moderate NPDR', referral: true,  confidence: 90, priority: 'MEDIUM', status: 'IN REVIEW', waiting: '5h 30min' },
]

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 }
const parseWaitMinutes = waiting => {
  const hours = Number(waiting.match(/(\d+)h/)?.[1] || 0)
  const minutes = Number(waiting.match(/(\d+) min/)?.[1] || 0)
  return hours * 60 + minutes
}

export default function QueuePage() {
  const navigate = useNavigate()
  const [sortField, setSortField] = useState('priority')
  const [filterPriority, setFilterPriority] = useState('ALL')

  const sorted = [...QUEUE_DATA]
    .filter(r => filterPriority === 'ALL' || r.priority === filterPriority)
    .sort((a, b) => {
      if (sortField === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (sortField === 'confidence') return b.confidence - a.confidence
      if (sortField === 'waiting') return parseWaitMinutes(a.waiting) - parseWaitMinutes(b.waiting)
      return 0
    })

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Ophthalmologist Review Queue</h1>
          <p className="page-subtitle">
            {QUEUE_DATA.filter(r => r.status === 'PENDING').length} cases pending ·{' '}
            {QUEUE_DATA.filter(r => r.priority === 'HIGH').length} high priority
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <button
              key={p}
              className={`btn btn-sm ${filterPriority === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterPriority(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* High Priority Alert */}
      {QUEUE_DATA.filter(r => r.priority === 'HIGH' && r.status === 'PENDING').length > 0 && (
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} className="alert-icon" />
          <div className="alert-content">
            <div className="alert-title">
              ⚠ {QUEUE_DATA.filter(r => r.priority === 'HIGH' && r.status === 'PENDING').length} HIGH PRIORITY cases require urgent review
            </div>
            <div className="alert-body">
              Cases with Severe NPDR (Level 3) or Proliferative DR (Level 4) are marked high priority.
              Patients with vision-threatening DR should be reviewed within 24 hours.
            </div>
          </div>
        </div>
      )}

      {/* Sort controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Sort by:</span>
        {[
          { key: 'priority',   label: 'Priority' },
          { key: 'confidence', label: 'Confidence' },
          { key: 'waiting',    label: 'Wait Time' },
        ].map(s => (
          <button
            key={s.key}
            className={`btn btn-sm ${sortField === s.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSortField(s.key)}
          >
            {s.label} {sortField === s.key ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        ))}
      </div>

      {/* Queue Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Screening ID</th>
              <th>PHC</th>
              <th>Quality</th>
              <th>AI Grade</th>
              <th>Referral</th>
              <th>Confidence</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Waiting</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <tr key={row.id}
                style={{ cursor: 'pointer', borderLeft: row.priority === 'HIGH' ? '3px solid var(--color-danger)' : 'none' }}
                onClick={() => navigate('/review')}
              >
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-primary-light)' }}>
                  {row.id}
                </td>
                <td style={{ fontSize: 'var(--text-xs)' }}>{row.phc}</td>
                <td>
                  <span className={`badge ${row.quality === 'GOOD' ? 'badge-success' : 'badge-warning'}`}>{row.quality}</span>
                </td>
                <td style={{ fontWeight: 600 }}>{row.grade}</td>
                <td>
                  {row.referral
                    ? <span className="badge badge-referral">⚑ REFER</span>
                    : <span className="badge badge-success">✓ NO REF</span>
                  }
                </td>
                <td>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 600,
                    color: row.confidence >= 85 ? 'var(--color-success)' : row.confidence >= 70 ? 'var(--color-warning)' : 'var(--color-danger)',
                  }}>
                    {row.confidence}%
                  </span>
                </td>
                <td>
                  <span className={`badge priority-${row.priority.toLowerCase()}`}>
                    {row.priority === 'HIGH' ? '⚠ ' : ''}{row.priority}
                  </span>
                </td>
                <td>
                  <span className={`badge ${row.status === 'PENDING' ? 'badge-warning' : 'badge-info'}`}>
                    {row.status}
                  </span>
                </td>
                <td style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  <Clock size={11} />{row.waiting}
                </td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate('/review') }}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary bar */}
      <div style={{ marginTop: 16, display: 'flex', gap: 24, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
        {[
          { label: 'Total in queue', value: QUEUE_DATA.length },
          { label: 'High priority', value: QUEUE_DATA.filter(r => r.priority === 'HIGH').length },
          { label: 'In review', value: QUEUE_DATA.filter(r => r.status === 'IN REVIEW').length },
          { label: 'Avg. wait', value: '2h 04min' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', gap: 6 }}>
            <span>{s.label}:</span>
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
