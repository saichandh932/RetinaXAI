import React, { useState, useCallback } from 'react'
import { Cpu, Play, RefreshCw, Zap } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const SCENARIOS = {
  NORMAL: {
    label: 'Normal Operation',
    patientsPerDay: 50,
    avgImageSizeMB: 3.5,
    bandwidthMbps: 10,
    aiTimeSeconds: 4,
    ophthalmologists: 2,
    reviewTimeMinutes: 5,
    rejectionRate: 0.08,
  },
  LOW_BANDWIDTH: {
    label: 'Low Bandwidth',
    patientsPerDay: 50,
    avgImageSizeMB: 3.5,
    bandwidthMbps: 1.5,
    aiTimeSeconds: 6,
    ophthalmologists: 2,
    reviewTimeMinutes: 5,
    rejectionRate: 0.1,
  },
  HIGH_LOAD: {
    label: 'High Load (Camp Day)',
    patientsPerDay: 120,
    avgImageSizeMB: 4.0,
    bandwidthMbps: 10,
    aiTimeSeconds: 5,
    ophthalmologists: 2,
    reviewTimeMinutes: 5,
    rejectionRate: 0.12,
  },
  LIMITED_DOCTORS: {
    label: 'Limited Doctors',
    patientsPerDay: 50,
    avgImageSizeMB: 3.5,
    bandwidthMbps: 10,
    aiTimeSeconds: 4,
    ophthalmologists: 1,
    reviewTimeMinutes: 8,
    rejectionRate: 0.08,
  },
}

function simulate(p) {
  const effectivePatients = p.patientsPerDay * (1 - p.rejectionRate)
  const aiThroughput     = (8 * 3600) / p.aiTimeSeconds   // images per 8h day
  const uploadTimeEach   = (p.avgImageSizeMB * 8) / p.bandwidthMbps // seconds
  const uploadThroughput = (8 * 3600) / uploadTimeEach
  const bottleneck       = Math.min(aiThroughput, uploadThroughput)

  const referableCount   = effectivePatients * 0.22
  const reviewCapacity   = p.ophthalmologists * (8 * 60 / p.reviewTimeMinutes)
  const queueLength      = Math.max(0, referableCount - reviewCapacity)
  const avgWaitMin       = queueLength > 0 ? (queueLength / reviewCapacity) * 60 : 0
  const reviewerUtil     = Math.min(100, (referableCount / reviewCapacity) * 100)
  const annualCapacity   = effectivePatients * 250

  return {
    dailyThroughput:     Math.round(Math.min(p.patientsPerDay, bottleneck)),
    queueLength:         Math.round(queueLength),
    avgWaitMinutes:      Math.round(avgWaitMin),
    reviewerUtilization: Math.round(reviewerUtil),
    annualCapacity:      Math.round(annualCapacity),
    uploadTimeEach:      uploadTimeEach.toFixed(1),
    referable:           Math.round(referableCount),
    reviewCapacity:      Math.round(reviewCapacity),
  }
}

const chartStyle = { fontSize: 11, fill: '#4c6b5a', fontFamily: 'Inter, sans-serif' }

export default function SimulationPage() {
  const [activeScenario, setActiveScenario] = useState(null)
  const [params, setParams] = useState({ ...SCENARIOS.NORMAL })
  const [results, setResults]   = useState(null)
  const [running, setRunning]   = useState(false)

  const loadScenario = (key) => {
    setActiveScenario(key)
    setParams({ ...SCENARIOS[key] })
    setResults(null)
  }

  const handleParam = (key, val) => {
    setParams(prev => ({ ...prev, [key]: Number(val) }))
    setActiveScenario(null)
  }

  const runSim = useCallback(async () => {
    setRunning(true)
    setResults(null)
    await new Promise(r => setTimeout(r, 800))
    setResults(simulate(params))
    setRunning(false)
  }, [params])

  // Comparative scenario data for chart
  const compareData = Object.entries(SCENARIOS).map(([key, s]) => {
    const r = simulate(s)
    return { name: s.label.replace(' (Camp Day)', ''), throughput: r.dailyThroughput, queue: r.queueLength, util: r.reviewerUtilization }
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Resource Simulation</h1>
        <p className="page-subtitle">
          Model the telemedicine screening pipeline — image acquisition, AI throughput, bandwidth constraints, and reviewer capacity.
        </p>
      </div>

      {/* Scenario Buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={13} /> Presets:
        </span>
        {Object.entries(SCENARIOS).map(([key, s]) => (
          <button
            key={key}
            className={`btn ${activeScenario === key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => loadScenario(key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '320px 1fr' }}>

        {/* Inputs */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={14} /> Simulation Inputs
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'patientsPerDay',     label: 'Patients per Day',          min: 1,   max: 500,  step: 1    },
              { key: 'avgImageSizeMB',     label: 'Avg Image Size (MB)',        min: 0.5, max: 20,   step: 0.5  },
              { key: 'bandwidthMbps',      label: 'Bandwidth (Mbps)',           min: 0.5, max: 100,  step: 0.5  },
              { key: 'aiTimeSeconds',      label: 'AI Processing Time (s)',     min: 1,   max: 30,   step: 0.5  },
              { key: 'ophthalmologists',   label: 'Ophthalmologists Available', min: 1,   max: 20,   step: 1    },
              { key: 'reviewTimeMinutes',  label: 'Avg Review Time (min)',      min: 1,   max: 60,   step: 1    },
              { key: 'rejectionRate',      label: 'Image Rejection Rate (0–1)', min: 0,   max: 0.5,  step: 0.01 },
            ].map(field => (
              <div key={field.key} className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label className="form-label" style={{ margin: 0 }}>{field.label}</label>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 700,
                    fontSize: 'var(--text-sm)', color: 'var(--color-primary-light)',
                  }}>{params[field.key]}</span>
                </div>
                <input
                  type="range"
                  min={field.min} max={field.max} step={field.step}
                  value={params[field.key]}
                  onChange={e => handleParam(field.key, e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
              </div>
            ))}

            <button
              className="btn btn-primary w-full"
              onClick={runSim}
              disabled={running}
            >
              {running
                ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Simulating…</>
                : <><Play size={15} /> Run Simulation</>
              }
            </button>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {results && (
            <div className="card animate-fade-in-up">
              <div className="card-header">
                <h2 className="card-title">Simulation Results</h2>
                <span className="badge badge-success">Complete</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Daily Throughput',       value: `${results.dailyThroughput} patients/day`,          status: results.dailyThroughput >= params.patientsPerDay * 0.9 ? 'good' : 'warn' },
                  { label: 'Referable Cases/day',    value: `${results.referable} patients`,                   status: 'info' },
                  { label: 'Reviewer Capacity/day',  value: `${results.reviewCapacity} reviews`,               status: results.reviewCapacity >= results.referable ? 'good' : 'warn' },
                  { label: 'Queue Length (end of day)',value: `${results.queueLength} cases`,                   status: results.queueLength === 0 ? 'good' : 'warn' },
                  { label: 'Avg Waiting Time',       value: results.avgWaitMinutes === 0 ? 'None' : `${results.avgWaitMinutes} min`, status: results.avgWaitMinutes < 30 ? 'good' : 'danger' },
                  { label: 'Reviewer Utilisation',   value: `${results.reviewerUtilization}%`,                 status: results.reviewerUtilization < 90 ? 'good' : 'warn' },
                  { label: 'Upload Time / Image',    value: `${results.uploadTimeEach}s`,                      status: parseFloat(results.uploadTimeEach) < 5 ? 'good' : 'warn' },
                  { label: 'Est. Annual Capacity',   value: `${results.annualCapacity.toLocaleString()} patients/year`, status: 'info' },
                ].map(row => (
                  <div key={row.label} className="sim-result-row">
                    <span className="sim-result-label">{row.label}</span>
                    <span className="sim-result-value" style={{
                      color: row.status === 'good' ? 'var(--color-success)' :
                             row.status === 'warn' ? 'var(--color-warning)' :
                             row.status === 'danger' ? 'var(--color-danger)' :
                             'var(--text-primary)',
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparative Chart */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 16 }}>
              <h2 className="card-title">Scenario Comparison</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={compareData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c9dfd0" />
                <XAxis dataKey="name" tick={{ ...chartStyle, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={chartStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #c9dfd0', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#4c6b5a' }} />
                <Bar dataKey="throughput" name="Throughput" fill="#2f855a" radius={[3,3,0,0]} />
                <Bar dataKey="queue"      name="Queue Length" fill="#66b982" radius={[3,3,0,0]} />
                <Bar dataKey="util"       name="Reviewer Util %" fill="#218b5a" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {!results && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', gap: 10 }}>
              <Cpu size={36} style={{ opacity: 0.3 }} />
              <span style={{ fontSize: 'var(--text-sm)' }}>Select a preset or adjust parameters, then run the simulation</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
