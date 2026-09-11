import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'
import { DR_Backend } from '../backend.js'
import {
  CheckCircle, XCircle, AlertTriangle, RefreshCw, ArrowRight,
  Eye, Sun, Crop, Contrast, Zap, Info
} from 'lucide-react'

const QUALITY_INDICATORS = [
  { key: 'focus',       label: 'Focus',         icon: Eye,      description: 'Image sharpness and retinal detail' },
  { key: 'illumination',label: 'Illumination',  icon: Sun,      description: 'Even lighting across the retinal field' },
  { key: 'fov',         label: 'Field of View', icon: Crop,     description: 'Adequate coverage of retinal area' },
  { key: 'contrast',    label: 'Contrast',       icon: Contrast, description: 'Visibility of retinal features' },
  { key: 'artifacts',   label: 'Artifacts',      icon: Zap,      description: 'Absence of glare, dust, or media opacity' },
]

function QualityBar({ score, status }) {
  const color = score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'
  return (
    <div className="quality-bar-track">
      <div
        className="quality-bar-fill"
        style={{ width: `${score}%`, background: color }}
      />
    </div>
  )
}

function StatusIcon({ status }) {
  if (status === 'good') return <CheckCircle size={15} color="var(--color-success)" />
  if (status === 'acceptable') return <AlertTriangle size={15} color="var(--color-warning)" />
  return <XCircle size={15} color="var(--color-danger)" />
}

export default function QualityPage() {
  const navigate = useNavigate()
  const { screeningData, setScreeningData } = useApp()
  const [assessing, setAssessing] = useState(true)
  const [quality, setQuality] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Run quality assessment using demo data or real image
    const input = screeningData?.imageFile || screeningData?.demoCase || 'moderate'
    DR_Backend.assessQuality(input).then(q => {
      setQuality(q)
      setError(null)
    }).catch(err => {
      setError(err.message || 'Unable to assess image quality.')
    }).finally(() => setAssessing(false))
  }, [screeningData])

  const handleEnhance = () => {
    setScreeningData(prev => ({ ...prev, enhanced: true }))
    navigate('/analysis')
  }

  const handleProceed = () => {
    setScreeningData(prev => ({ ...prev, quality }))
    navigate('/analysis')
  }

  const handleRecapture = () => {
    navigate('/new-screening')
  }

  if (assessing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 24 }}>
        <div style={{
          width: 64, height: 64,
          border: '3px solid var(--color-primary)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Assessing Image Quality
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Evaluating focus, illumination, field of view, and artifacts…
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" style={{ maxWidth: 560, margin: '80px auto' }}>
        <XCircle size={18} className="alert-icon" />
        <div className="alert-content">
          <div className="alert-title">Quality assessment failed</div>
          <div className="alert-body" style={{ marginTop: 6 }}>{error}</div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={() => navigate('/new-screening')}>
            <RefreshCw size={14} /> Try another image
          </button>
        </div>
      </div>
    )
  }

  if (!quality) return null

  const isGood       = quality.status === 'GOOD'
  const isAcceptable = quality.status === 'ACCEPTABLE'
  const isBorderline = quality.status === 'BORDERLINE'
  const isUngradable = quality.status === 'UNGRADABLE'

  const scoreColor = quality.score >= 80
    ? 'var(--color-success)'
    : quality.score >= 60
    ? 'var(--color-warning)'
    : 'var(--color-danger)'

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Image Quality Assessment</h1>
        <p className="page-subtitle">
          Automated quality check before AI analysis begins.
        </p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '280px 1fr' }}>

        {/* Score Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 8, fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Quality Score
            </div>
            <div style={{ fontSize: 72, fontWeight: 800, color: scoreColor, lineHeight: 1, marginBottom: 4 }}>
              {quality.score}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 16 }}>/ 100</div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: 'var(--text-sm)', background: scoreColor + '22', color: scoreColor, border: `1px solid ${scoreColor}44` }}>
              {isGood || isAcceptable ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              {quality.status}
            </div>
          </div>

          {/* Status explanation */}
          <div className={`alert ${isGood || isAcceptable ? 'alert-success' : isBorderline ? 'alert-warning' : 'alert-danger'}`}>
            <div className="alert-icon">{isGood || isAcceptable ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}</div>
            <div className="alert-content">
              <div className="alert-title">
                {isGood       && 'Image is suitable for reliable screening'}
                {isAcceptable && 'Image is acceptable for screening'}
                {isBorderline && 'Image can potentially be enhanced'}
                {isUngradable && 'Image is not suitable for reliable screening'}
              </div>
              {isUngradable && (
                <div className="alert-body" style={{ marginTop: 6 }}>
                  The retinal structures are not sufficiently visible. Please recapture following the instructions.
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {isUngradable ? (
            <button className="btn btn-danger w-full btn-lg" onClick={handleRecapture}>
              <RefreshCw size={16} /> Recapture Image
            </button>
          ) : isBorderline ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-warning w-full" onClick={handleEnhance}>
                ✦ Enhance Image
              </button>
              <button className="btn btn-secondary w-full" onClick={handleProceed}>
                Proceed without enhancement
              </button>
            </div>
          ) : (
            <button className="btn btn-primary w-full btn-lg" onClick={handleProceed}>
              Run AI Analysis <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Indicators Panel */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Detailed Quality Indicators</h2>
          </div>

          <div>
            {QUALITY_INDICATORS.map(ind => {
              const indicator = quality[ind.key]
              if (!indicator) return null
              const Icon = ind.icon
              return (
                <div key={ind.key} className="quality-row">
                  <div className="quality-label" style={{ width: 140 }}>
                    <Icon size={14} />
                    {ind.label}
                  </div>
                  <QualityBar score={indicator.score} status={indicator.status} />
                  <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <StatusIcon status={indicator.status} />
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: indicator.status === 'good' ? 'var(--color-success)' : indicator.status === 'acceptable' ? 'var(--color-warning)' : 'var(--color-danger)',
                    }}>
                      {indicator.score}
                    </span>
                  </div>
                  <div style={{ width: 80, textAlign: 'right' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                      color: indicator.status === 'good' ? 'var(--color-success)' : indicator.status === 'acceptable' ? 'var(--color-warning)' : indicator.status === 'low' ? 'var(--color-success)' : 'var(--color-danger)',
                    }}>
                      {/* For artifacts, "low" is good */}
                      {ind.key === 'artifacts'
                        ? (indicator.status === 'low' ? '✓ Low' : indicator.status === 'high' ? '✗ High' : indicator.status)
                        : (indicator.status === 'good' ? '✓ Good' : indicator.status === 'acceptable' ? '~ OK' : '✗ Poor')
                      }
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recapture instructions for ungradable */}
          {isUngradable && (
            <div className="alert alert-warning" style={{ marginTop: 20 }}>
              <AlertTriangle size={16} className="alert-icon" />
              <div className="alert-content">
                <div className="alert-title">Recapture Instructions</div>
                <ul style={{ marginTop: 8, paddingLeft: 16, fontSize: 'var(--text-sm)', lineHeight: 2 }}>
                  <li>Centre the retina within the camera field of view</li>
                  <li>Improve camera focus before capturing</li>
                  <li>Reduce glare by adjusting the illumination angle</li>
                  <li>Ask the patient to fixate on the internal target light</li>
                  <li>Adjust room lighting to minimise reflections</li>
                </ul>
              </div>
            </div>
          )}

          {/* Info note */}
          <div style={{ marginTop: 20, display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 11, color: 'var(--text-muted)' }}>
            <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Quality thresholds: Score ≥80 = Good · 60–79 = Acceptable/Borderline · &lt;60 = Ungradable. Images scoring below 60 are not suitable for reliable AI screening.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
