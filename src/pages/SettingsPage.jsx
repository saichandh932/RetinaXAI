import React, { useState } from 'react'
import { useApp } from '../App.jsx'
import { DR_Backend } from '../backend.js'
import { Settings, Server, Wifi, Database, Info, CheckCircle, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
  const { role, setRole } = useApp()
  const [backendMode, setBackendMode] = useState(DR_Backend.mode)
  const [restUrl, setRestUrl]   = useState(DR_Backend.restEndpoint)
  const [pythonUrl, setPythonUrl] = useState(DR_Backend.pythonEndpoint)
  const [saved, setSaved]       = useState(false)

  const handleSave = () => {
    DR_Backend.mode             = backendMode
    DR_Backend.restEndpoint     = restUrl
    DR_Backend.pythonEndpoint   = pythonUrl
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const ROLE_OPTIONS = [
    { value: 'operator',        label: 'Mode A — Screening Operator',        desc: 'Basic screening workflow. No clinical details.' },
    { value: 'ophthalmologist', label: 'Mode B — Ophthalmologist',           desc: 'Full clinical evidence and review controls.' },
    { value: 'admin',           label: 'Mode C — Program Administrator',     desc: 'Analytics, simulation, and programme management.' },
  ]

  const BACKEND_OPTIONS = [
    { value: 'python', label: 'Colab / Live Model API', desc: 'Public Flask/FastAPI endpoint serving the trained Colab model.' },
    { value: 'rest',   label: 'REST API Endpoint',     desc: 'Optional deployment endpoint for a production backend service.' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Interface mode, backend connection, and system configuration.</p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* Role / Interface Mode */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings size={16} color="var(--color-primary-light)" />
              Interface Mode
            </h2>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            Select the interface mode appropriate for the current user. The same backend is used for all modes.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ROLE_OPTIONS.map(opt => (
              <div
                key={opt.value}
                role="radio"
                aria-checked={role === opt.value}
                tabIndex={0}
                onClick={() => setRole(opt.value)}
                onKeyDown={e => e.key === 'Enter' && setRole(opt.value)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${role === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: role === opt.value ? 'var(--color-primary-glow)' : 'var(--color-surface-2)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', border: '2px solid',
                  borderColor: role === opt.value ? 'var(--color-primary)' : 'var(--color-border)',
                  background: role === opt.value ? 'var(--color-primary)' : 'transparent',
                  flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {role === opt.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: role === opt.value ? 'var(--color-primary-light)' : 'var(--text-primary)' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backend Configuration */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Server size={16} color="var(--color-primary-light)" />
              Backend Connection
            </h2>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            Select how the frontend connects to the live DR screening backend.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {BACKEND_OPTIONS.map(opt => (
              <div
                key={opt.value}
                role="radio"
                aria-checked={backendMode === opt.value}
                tabIndex={0}
                onClick={() => setBackendMode(opt.value)}
                onKeyDown={e => e.key === 'Enter' && setBackendMode(opt.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${backendMode === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: backendMode === opt.value ? 'var(--color-primary-glow)' : 'var(--color-surface-2)',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', border: '2px solid',
                  borderColor: backendMode === opt.value ? 'var(--color-primary)' : 'var(--color-border)',
                  background: backendMode === opt.value ? 'var(--color-primary)' : 'transparent',
                  flexShrink: 0, marginTop: 1,
                }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: backendMode === opt.value ? 'var(--color-primary-light)' : 'var(--text-primary)' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Endpoint URLs */}
          {backendMode === 'rest' && (
            <div className="form-group">
              <label className="form-label">
                <Server size={12} style={{ display: 'inline', marginRight: 5 }} />
                Production REST API URL
              </label>
              <input className="form-input" value={restUrl} onChange={e => setRestUrl(e.target.value)}
                placeholder="https://your-backend.example.com/api" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }} />
            </div>
          )}
          {backendMode === 'python' && (
            <div className="form-group">
              <label className="form-label">
                <Server size={12} style={{ display: 'inline', marginRight: 5 }} />
                Colab / Live Model API URL
              </label>
              <input className="form-input" value={pythonUrl} onChange={e => setPythonUrl(e.target.value)}
                placeholder="https://your-ngrok-url.ngrok-free.app/api" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }} />
            </div>
          )}
        </div>
      </div>

      {/* Save + System Info */}
      <div className="grid grid-2 gap-6" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-primary btn-lg" onClick={handleSave}>
            {saved ? <><CheckCircle size={16} /> Saved!</> : 'Save Settings'}
          </button>
          {saved && <span className="badge badge-success">Settings applied</span>}
        </div>

        {/* System info */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">System Information</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Model',          value: 'DR-XAI v1.0' },
              { label: 'Architecture',   value: 'EfficientNet-B4 + Grad-CAM' },
              { label: 'Last Updated',   value: '2026-09-01' },
              { label: 'Frontend',       value: 'React + Vite (SPA)' },
              { label: 'Backend API',    value: backendMode === 'demo' ? 'Demo Mode' : backendMode === 'rest' ? restUrl : pythonUrl },
              { label: 'Target Sens.',   value: '>90% (referable DR)' },
              { label: 'Target Spec.',   value: '>85% (referable DR)' },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', padding: '7px 0',
                borderBottom: '1px solid var(--color-border)', fontSize: 12,
              }}>
                <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontFamily: row.label.includes('Backend') || row.label.includes('Frontend') ? 'var(--font-mono)' : 'inherit' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Colab integration guide */}
      <div className="alert alert-info" style={{ marginTop: 20 }}>
        <Info size={16} className="alert-icon" />
        <div className="alert-content">
          <div className="alert-title">Connecting to the Colab backend</div>
          <div className="alert-body">
            To connect to the live model: select <strong>Colab / Live Model API</strong> and enter the public Colab API URL.
            The backend must expose a <code style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '1px 4px', borderRadius: 3 }}>POST /api/screen</code> endpoint,
            accept an uploaded image, and return the JSON structure expected by the clinical dashboard.
            See <code>src/backend.js</code> for the full expected schema.
          </div>
        </div>
      </div>
    </div>
  )
}
