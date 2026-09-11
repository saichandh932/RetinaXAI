import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'
import {
  Eye, ZoomIn, ZoomOut, RotateCcw, Layers, ChevronRight,
  AlertTriangle, CheckCircle, Info, FileText
} from 'lucide-react'
import RetinalViewer from '../components/RetinalViewer.jsx'

const DR_LABELS = ['No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'Proliferative DR']
const DR_COLORS = ['var(--dr-level-0)', 'var(--dr-level-1)', 'var(--dr-level-2)', 'var(--dr-level-3)', 'var(--dr-level-4)']

const OVERLAY_OPTIONS = [
  { key: 'vessels',           label: 'Blood Vessels',      color: '#60a5fa' },
  { key: 'opticDisc',         label: 'Optic Disc',         color: '#fbbf24' },
  { key: 'fovea',             label: 'Fovea',              color: '#f472b6' },
  { key: 'microaneurysms',    label: 'Microaneurysms',     color: '#ef4444' },
  { key: 'exudates',          label: 'Exudates',           color: '#86efac' },
  { key: 'hemorrhages',       label: 'Haemorrhages',       color: '#dc2626' },
  { key: 'neovascularization',label: 'Neovascularization', color: '#f97316' },
  { key: 'gradcam',           label: 'Grad-CAM Attention', color: '#a78bfa' },
]

function ConfidenceRing({ value }) {
  const pct = Math.round(value * 100)
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const color = pct >= 85 ? 'var(--color-success)' : pct >= 70 ? 'var(--color-warning)' : 'var(--color-danger)'

  return (
    <div className="confidence-ring" style={{ width: 96, height: 96 }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth="7" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="confidence-ring-value">
        <span className="confidence-number" style={{ color }}>{pct}</span>
        <span className="confidence-pct">%</span>
      </div>
    </div>
  )
}

export default function ClinicalPage() {
  const navigate = useNavigate()
  const { screeningData } = useApp()
  const [activeOverlays, setActiveOverlays] = useState({ vessels: true })
  const [viewMode, setViewMode] = useState('original') // 'original' | 'enhanced'

  // Use demo data if available
  const result = screeningData?.result || {
    severity: { level: 2, label: 'Moderate NPDR', detail: 'Moderate Non-Proliferative Diabetic Retinopathy' },
    confidence: 0.91,
    lesions: {
      microaneurysms:    { detected: true, count: 14, confidence: 0.89 },
      exudates:          { detected: true, area: 'moderate', confidence: 0.94 },
      hemorrhages:       { detected: true, count: 5, confidence: 0.88 },
      neovascularization:{ detected: false, confidence: 0.04 },
      vessels:           { detected: true },
      opticDisc:         { detected: true },
      fovea:             { detected: true },
    },
    referral: {
      recommended: true,
      priority: 'MEDIUM',
      reason: 'Referable DR suspected based on multiple detected lesions including microaneurysms, haemorrhages, and exudates.',
    },
    quality: { score: 87, status: 'GOOD' },
  }

  const toggleOverlay = (key) => {
    setActiveOverlays(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const level    = result.severity?.level ?? 0
  const levelColor = DR_COLORS[level]
  const pct      = Math.round((result.confidence ?? 0.91) * 100)

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Clinical Analysis</h1>
          <p className="page-subtitle">Retinal image with AI-detected lesion overlays and severity classification.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/xai')}>
            <Layers size={15} /> Explainability
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/report')}>
            <FileText size={15} /> Generate Report
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* Left: Retinal Image Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* View mode toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="tab-nav">
              <button className={`tab-btn${viewMode === 'original' ? ' active' : ''}`} onClick={() => setViewMode('original')}>
                Original
              </button>
              <button className={`tab-btn${viewMode === 'enhanced' ? ' active' : ''}`} onClick={() => setViewMode('enhanced')}>
                Enhanced
              </button>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Scroll to zoom · Drag to pan
            </span>
          </div>

          {/* Image viewer */}
          <RetinalViewer
            imageUrl={screeningData?.imagePreview}
            activeOverlays={activeOverlays}
            result={result}
            mode={viewMode}
          />

          {/* Overlay controls */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 12 }}>
              <h2 className="card-title">
                <Layers size={14} style={{ display: 'inline', marginRight: 6 }} />
                Overlay Controls
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveOverlays({})}>Clear all</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {OVERLAY_OPTIONS.map(opt => {
                const lesion = result.lesions?.[opt.key]
                const detected = opt.key === 'gradcam' || opt.key === 'vessels' || lesion?.detected
                const isOn = !!activeOverlays[opt.key]
                return (
                  <div
                    key={opt.key}
                    className={`overlay-toggle${isOn ? ' active' : ''}`}
                    onClick={() => toggleOverlay(opt.key)}
                    role="checkbox"
                    aria-checked={isOn}
                    tabIndex={0}
                    onKeyDown={e => e.key === ' ' && toggleOverlay(opt.key)}
                  >
                    <div className="overlay-swatch" style={{ background: opt.color, opacity: isOn ? 1 : 0.3 }} />
                    <span className="overlay-toggle-label">{opt.label}</span>
                    {!detected && opt.key !== 'gradcam' && opt.key !== 'vessels' && opt.key !== 'opticDisc' && opt.key !== 'fovea' && (
                      <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 'auto' }}>—</span>
                    )}
                    <div className={`toggle-switch${isOn ? ' on' : ''}`} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* DR Severity Card */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              DR Severity
            </div>

            <div style={{ fontSize: 72, fontWeight: 800, color: levelColor, lineHeight: 1 }}>
              {level}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 6 }}>Level</div>

            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: levelColor, marginBottom: 4 }}>
              {DR_LABELS[level]}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 16 }}>
              {result.severity?.detail}
            </div>

            {/* Confidence */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              <ConfidenceRing value={result.confidence ?? 0.91} />
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Confidence</div>
            </div>

            {/* Referral */}
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: result.referral?.recommended ? 'var(--color-referral-bg)' : 'var(--color-success-bg)',
              border: `1px solid ${result.referral?.recommended ? 'rgba(139,92,246,0.3)' : 'rgba(16,185,129,0.3)'}`,
              marginBottom: 8,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Referral Decision
              </div>
              <div style={{
                fontSize: 'var(--text-lg)', fontWeight: 800,
                color: result.referral?.recommended ? 'var(--color-referral)' : 'var(--color-success)',
              }}>
                {result.referral?.recommended ? '⚑ REFER' : '✓ NO REFERRAL'}
              </div>
              {result.referral?.priority && result.referral.recommended && (
                <span className={`badge priority-${result.referral.priority.toLowerCase()}`} style={{ marginTop: 6 }}>
                  {result.referral.priority === 'HIGH' ? '⚠ ' : ''}
                  {result.referral.priority} PRIORITY
                </span>
              )}
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'left' }}>
              {result.referral?.reason}
            </div>
          </div>

          {/* Clinical Evidence */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 12 }}>
              <h2 className="card-title">Detected Evidence</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/xai')}>
                XAI <ChevronRight size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.lesions && Object.entries({
                microaneurysms:    { label: 'Microaneurysms',     colorKey: 'microaneurysms' },
                hemorrhages:       { label: 'Haemorrhages',       colorKey: 'hemorrhages' },
                exudates:          { label: 'Hard Exudates',      colorKey: 'exudates' },
                neovascularization:{ label: 'Neovascularization', colorKey: 'neovascularization' },
              }).map(([key, meta]) => {
                const lesion = result.lesions[key]
                if (!lesion) return null
                const overlay = OVERLAY_OPTIONS.find(o => o.key === key)
                return (
                  <div key={key} className="evidence-item" style={{
                    opacity: lesion.detected ? 1 : 0.45,
                    borderColor: lesion.detected ? 'var(--color-border-light)' : 'var(--color-border)',
                  }}>
                    <div className="evidence-icon" style={{
                      background: `${overlay?.color}22`,
                      border: `1px solid ${overlay?.color}44`,
                    }}>
                      {lesion.detected
                        ? <CheckCircle size={14} color={overlay?.color} />
                        : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                      }
                    </div>
                    <div className="evidence-body">
                      <div className="evidence-name">{meta.label}</div>
                      <div className="evidence-detail">
                        {lesion.detected
                          ? (lesion.count ? `${lesion.count} candidates · ` : lesion.area ? `${lesion.area} · ` : 'Detected · ')
                          : 'Not detected · '
                        }
                        <span className="evidence-confidence">
                          Conf. {Math.round((lesion.confidence ?? 0) * 100)}%
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '3px 6px', fontSize: 9 }}
                      onClick={() => toggleOverlay(key)}
                      title={`Toggle ${meta.label} overlay`}
                    >
                      <Eye size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Trust / Calibration Panel */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 10 }}>
              <h2 className="card-title">Confidence &amp; Trust</h2>
              <span title="AI output is a screening aid. Always verify with a qualified clinician." className="info-icon">i</span>
            </div>
            {[
              { label: 'Prediction Confidence', value: `${pct}%`, status: pct >= 85 ? 'good' : 'warn' },
              { label: 'Image Quality',         value: result.quality?.status || 'GOOD', status: 'good' },
              { label: 'Calibration',           value: 'ACCEPTABLE', status: 'good' },
              { label: 'Model Version',         value: 'DR-XAI v1.0', status: 'info' },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--text-xs)',
              }}>
                <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{
                  fontWeight: 600, fontFamily: 'var(--font-mono)',
                  color: row.status === 'good' ? 'var(--color-success)' : row.status === 'warn' ? 'var(--color-warning)' : 'var(--text-secondary)',
                }}>
                  {row.value}
                </span>
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <Info size={10} style={{ display: 'inline', marginRight: 4 }} />
              AI output is a screening aid and does not replace professional medical diagnosis.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
