import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'
import { DR_Backend, ANALYSIS_STAGES } from '../backend.js'
import { AlertTriangle, CheckCircle, Loader, Clock } from 'lucide-react'

export default function AnalysisPage() {
  const navigate = useNavigate()
  const { screeningData, setScreeningData } = useApp()
  const [currentStage, setCurrentStage] = useState(null)
  const [completedStages, setCompletedStages] = useState([])
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const input = screeningData?.imageFile || screeningData?.demoCase || 'moderate'

    DR_Backend.runScreening(input, (stageId, stageName, pct) => {
      if (stageId === 'done') {
        setDone(true)
        setProgress(1)
        setCurrentStage(null)
        return
      }
      setCurrentStage(stageId)
      setProgress(pct)
      setCompletedStages(prev => {
        const stageIdx = ANALYSIS_STAGES.findIndex(s => s.id === stageId)
        return ANALYSIS_STAGES.slice(0, stageIdx).map(s => s.id)
      })
    }).then(res => {
      setResult(res)
      setScreeningData(prev => ({ ...prev, result: res }))
    }).catch(err => {
      setError(err.message || 'Unable to complete AI analysis.')
    })
  }, [screeningData?.imageFile, screeningData?.demoCase, setScreeningData])

  useEffect(() => {
    if (done && result) {
      const t = setTimeout(() => navigate('/clinical'), 800)
      return () => clearTimeout(t)
    }
  }, [done, result])

  const progressPct = Math.round(progress * 100)

  if (error) {
    return (
      <div className="alert alert-danger" style={{ maxWidth: 560, margin: '80px auto' }}>
        <AlertTriangle size={18} className="alert-icon" />
        <div className="alert-content">
          <div className="alert-title">AI analysis failed</div>
          <div className="alert-body" style={{ marginTop: 6 }}>{error}</div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={() => navigate('/quality')}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 40 }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 className="page-title" style={{ marginBottom: 8 }}>AI Analysis in Progress</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Processing retinal image through the DR screening pipeline…
        </p>
      </div>

      {/* Step indicators */}
      <div style={{ width: '100%', maxWidth: 640 }}>
        <div className="step-indicator">
          {ANALYSIS_STAGES.map((stage, i) => {
            const isComplete = completedStages.includes(stage.id)
            const isActive   = currentStage === stage.id
            return (
              <div
                key={stage.id}
                className={`step${isActive ? ' active' : ''}${isComplete ? ' completed' : ''}`}
              >
                <div className="step-circle">
                  {isComplete ? <CheckCircle size={14} /> : isActive ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : i + 1}
                </div>
                <div className="step-label">{stage.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          <span>
            {done
              ? '✓ Analysis complete — opening results…'
              : ANALYSIS_STAGES.find(s => s.id === currentStage)?.label || 'Initialising…'
            }
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{progressPct}%</span>
        </div>

        {/* Track */}
        <div style={{
          height: 8,
          background: 'var(--color-surface-3)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: done
              ? 'var(--color-success)'
              : 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease',
            boxShadow: done ? '0 0 10px rgba(16,185,129,0.5)' : '0 0 10px rgba(37,99,235,0.5)',
          }} />
        </div>
      </div>

      {/* Stage details */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 560 }}>
        {ANALYSIS_STAGES.map(stage => {
          const isComplete = completedStages.includes(stage.id)
          const isActive   = currentStage === stage.id
          return (
            <div key={stage.id} style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              background: isComplete
                ? 'var(--color-success-bg)'
                : isActive
                ? 'var(--color-primary-glow)'
                : 'var(--color-surface-2)',
              color: isComplete
                ? 'var(--color-success)'
                : isActive
                ? 'var(--color-primary-light)'
                : 'var(--text-muted)',
              border: `1px solid ${isComplete ? 'rgba(16,185,129,0.3)' : isActive ? 'rgba(37,99,235,0.3)' : 'var(--color-border)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              {isComplete && <CheckCircle size={11} />}
              {isActive   && <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />}
              {!isComplete && !isActive && <Clock size={11} />}
              {stage.label}
            </div>
          )
        })}
      </div>

      {/* Disclaimer */}
      <div style={{ maxWidth: 400, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Processing time is approximately 3–6 seconds per image depending on image size and system load.
        Do not close this screen.
      </div>
    </div>
  )
}
