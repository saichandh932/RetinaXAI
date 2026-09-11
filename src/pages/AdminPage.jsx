import React, { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, BarChart2, Filter } from 'lucide-react'

// Synthetic district-level data
const DAILY_DATA = [
  { day: 'Mon', screenings: 38, referable: 7, rejected: 3 },
  { day: 'Tue', screenings: 51, referable: 10, rejected: 5 },
  { day: 'Wed', screenings: 44, referable: 9, rejected: 4 },
  { day: 'Thu', screenings: 63, referable: 13, rejected: 6 },
  { day: 'Fri', screenings: 47, referable: 8, rejected: 3 },
  { day: 'Sat', screenings: 29, referable: 5, rejected: 2 },
  { day: 'Sun', screenings: 18, referable: 3, rejected: 1 },
]

const SEVERITY_DIST = [
  { name: 'No DR (L0)',   value: 156, color: 'var(--dr-level-0)' },
  { name: 'Mild (L1)',    value:  68, color: 'var(--dr-level-1)' },
  { name: 'Moderate (L2)',value:  47, color: 'var(--dr-level-2)' },
  { name: 'Severe (L3)', value:  16, color: 'var(--dr-level-3)' },
  { name: 'PDR (L4)',    value:   7, color: 'var(--dr-level-4)' },
]

const QUALITY_DIST = [
  { name: 'Good (≥80)',       value: 248, color: 'var(--color-success)' },
  { name: 'Acceptable (≥60)', value:  38, color: 'var(--color-warning)' },
  { name: 'Rejected (<60)',   value:  24, color: 'var(--color-danger)' },
]

const PHC_DATA = [
  { phc: 'PHC Rajnagar',  district: 'Raipur', screenings: 87, refRate: 23 },
  { phc: 'PHC Korba',     district: 'Korba', screenings: 64, refRate: 19 },
  { phc: 'PHC Bilaspur',  district: 'Bilaspur', screenings: 52, refRate: 17 },
  { phc: 'PHC Raigarh',   district: 'Raigarh', screenings: 48, refRate: 21 },
  { phc: 'PHC Ambikapur', district: 'Surguja', screenings: 39, refRate: 15 },
]

const METRICS = [
  { label: 'Total Screenings',        value: '290',    delta: '+12%', up: true,  color: 'var(--color-primary-light)' },
  { label: 'Daily Throughput',        value: '41.4',   delta: '+8%',  up: true,  color: 'var(--color-info)' },
  { label: 'Referable Cases',         value: '70',     delta: '+3%',  up: false, color: 'var(--color-warning)' },
  { label: 'Rejection Rate',          value: '8.3%',   delta: '-2%',  up: true,  color: 'var(--color-success)' },
  { label: 'Avg Processing Time',     value: '4.1s',   delta: '-0.3s',up: true,  color: 'var(--color-success)' },
  { label: 'Avg Review Time',         value: '3.2 min',delta: '-12%', up: true,  color: 'var(--color-success)' },
  { label: 'Pending Reviews',         value: '7',      delta: 'high', up: false, color: 'var(--color-danger)' },
]

const chartStyle = { fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }

export default function AdminPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [district, setDistrict]   = useState('All Districts')
  const rangeFactor = { '7d': 1, '30d': 4, '90d': 12 }[dateRange]
  const filteredPHC = PHC_DATA
    .filter(item => district === 'All Districts' || item.district === district)
    .map(item => ({ ...item, screenings: item.screenings * rangeFactor }))
  const visibleMetrics = METRICS.map(metric => {
    if (metric.label === 'Total Screenings') return { ...metric, value: String(290 * rangeFactor) }
    if (metric.label === 'Referable Cases') return { ...metric, value: String(70 * rangeFactor) }
    return metric
  })

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">District Analytics Dashboard</h1>
          <p className="page-subtitle">Program-level performance metrics — Chhattisgarh DR Screening Programme</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select className="form-select" value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select className="form-select" value={district} onChange={e => setDistrict(e.target.value)} style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}>
            <option>All Districts</option>
            <option>Bilaspur</option>
            <option>Raipur</option>
            <option>Korba</option>
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metric-cards" style={{ marginBottom: 24 }}>
        {visibleMetrics.map(m => (
          <div key={m.label} className="metric-card">
            <div className="metric-card-label">{m.label}</div>
            <div className="metric-card-value" style={{ color: m.color, fontSize: 28 }}>{m.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11 }}>
              {m.up ? <TrendingUp size={11} color="var(--color-success)" /> : <TrendingDown size={11} color="var(--color-danger)" />}
              <span style={{ color: m.up ? 'var(--color-success)' : 'var(--color-danger)' }}>{m.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-2 gap-5" style={{ marginBottom: 20 }}>

        {/* Screenings per day */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 16 }}>
            <h2 className="card-title">
              <BarChart2 size={14} style={{ display: 'inline', marginRight: 6 }} />
              Screenings per Day
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={DAILY_DATA}>
              <defs>
                <linearGradient id="gradScreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2f855a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2f855a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRef" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#66b982" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#66b982" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#c9dfd0" />
              <XAxis dataKey="day" tick={chartStyle} axisLine={false} tickLine={false} />
              <YAxis tick={chartStyle} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #c9dfd0', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#173b2b' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#4c6b5a' }} />
              <Area type="monotone" dataKey="screenings" stroke="#2f855a" fill="url(#gradScreen)" strokeWidth={2} name="Total Screenings" />
              <Area type="monotone" dataKey="referable"  stroke="#66b982" fill="url(#gradRef)"    strokeWidth={2} name="Referable Cases" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* DR Severity Distribution */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 16 }}>
            <h2 className="card-title">DR Severity Distribution</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={SEVERITY_DIST}
                  cx="50%" cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {SEVERITY_DIST.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #c9dfd0', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SEVERITY_DIST.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{s.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-2 gap-5">

        {/* PHC-level breakdown */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 16 }}>
            <h2 className="card-title">PHC-Level Screening Volume</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={filteredPHC} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#c9dfd0" horizontal={false} />
              <XAxis type="number" tick={chartStyle} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="phc" tick={{ ...chartStyle, width: 100 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #c9dfd0', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="screenings" fill="#2f855a" name="Screenings" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Image Quality Distribution */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 16 }}>
            <h2 className="card-title">Image Quality Distribution</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width={180} height={160}>
              <PieChart>
                <Pie data={QUALITY_DIST} cx="50%" cy="50%" innerRadius={40} outerRadius={72} paddingAngle={3} dataKey="value">
                  {QUALITY_DIST.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #c9dfd0', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {QUALITY_DIST.map(q => (
                <div key={q.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: q.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{q.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{q.value}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                Rejection rate: <strong style={{ color: 'var(--color-warning)' }}>7.8%</strong>
                {' '}(target: &lt;10%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
