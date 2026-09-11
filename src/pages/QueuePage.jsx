import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Clock, ChevronUp, ChevronDown, Filter } from 'lucide-react'
import { REVIEW_QUEUE, getReviewedQueueIds } from '../data/reviewQueue.js'

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
  const [reviewedIds, setReviewedIds] = useState(() => {
    return getReviewedQueueIds()
  })

  React.useEffect(() => {
    const handleReviewCompleted = event => {
      setReviewedIds(previous => previous.includes(event.detail) ? previous : [...previous, event.detail])
    }
    window.addEventListener('dr-review-completed', handleReviewCompleted)
    return () => window.removeEventListener('dr-review-completed', handleReviewCompleted)
  }, [])

  const pendingRows = REVIEW_QUEUE.filter(row => !reviewedIds.includes(row.id))

  const sorted = [...pendingRows]
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
            {pendingRows.filter(r => r.status === 'PENDING').length} cases pending ·{' '}
            {pendingRows.filter(r => r.priority === 'HIGH').length} high priority
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
      {pendingRows.filter(r => r.priority === 'HIGH' && r.status === 'PENDING').length > 0 && (
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} className="alert-icon" />
          <div className="alert-content">
            <div className="alert-title">
              ⚠ {pendingRows.filter(r => r.priority === 'HIGH' && r.status === 'PENDING').length} HIGH PRIORITY cases require urgent review
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
                onClick={() => navigate('/review', { state: { screeningId: row.id } })}
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
                  <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate('/review', { state: { screeningId: row.id } }) }}>
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
          { label: 'Total in queue', value: pendingRows.length },
          { label: 'High priority', value: pendingRows.filter(r => r.priority === 'HIGH').length },
          { label: 'In review', value: pendingRows.filter(r => r.status === 'IN REVIEW').length },
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
