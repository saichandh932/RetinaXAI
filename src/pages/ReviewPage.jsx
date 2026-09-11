import React, { useState } from 'react'
import { useApp } from '../App.jsx'
import { useLocation } from 'react-router-dom'
import { CheckCircle, XCircle, MessageSquare, AlertTriangle, Eye } from 'lucide-react'
import RetinalViewer from '../components/RetinalViewer.jsx'

const DR_LABELS  = ['No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'Proliferative DR']
const DR_COLORS  = ['var(--dr-level-0)', 'var(--dr-level-1)', 'var(--dr-level-2)', 'var(--dr-level-3)', 'var(--dr-level-4)']

const OVERRIDE_REASONS = [
  'Image artefact affecting AI assessment',
  'Clinical context not captured by model',
  'Additional pathology identified',
  'Model confidence insufficient',
  'Systemic condition affects presentation',
  'Other — see comment',
]

export default function ReviewPage() {
  const { screeningData } = useApp()
  const location = useLocation()
  const [decision, setDecision] = useState(null) // 'accept' | 'override'
  const [overrideGrade, setOverrideGrade] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const result = screeningData?.result || {
    severity: { level: 2, label: 'Moderate NPDR', detail: 'Moderate Non-Proliferative Diabetic Retinopathy' },
    confidence: 0.91,
    lesions: {
      microaneurysms:    { detected: true, count: 14, confidence: 0.89 },
      exudates:          { detected: true, area: 'moderate', confidence: 0.94 },
      hemorrhages:       { detected: true, count: 5, confidence: 0.88 },
      neovascularization:{ detected: false, confidence: 0.04 },
    },
    referral: { recommended: true, priority: 'MEDIUM', reason: 'Referable DR suspected.' },
    quality: { score: 87, status: 'GOOD' },
  }

  const level = result.severity?.level ?? 2
  const pct   = Math.round((result.confidence ?? 0.91) * 100)

  const handleSubmit = () => {
    if (!decision) return
    if (decision === 'override' && (!overrideGrade || !overrideReason)) return
    const finalGrade = decision === 'accept' ? level : parseInt(overrideGrade, 10)
    const screeningId = location.state?.screeningId || screeningData?.form?.screeningId || 'current'
    localStorage.setItem(`dr_review_${screeningId}`, JSON.stringify({
      decision,
      finalGrade,
      reason: overrideReason || null,
      comment,
      recordedAt: new Date().toISOString(),
    }))
    const reviewedIds = JSON.parse(localStorage.getItem('dr_reviewed_queue_ids') || '[]')
    if (!reviewedIds.includes(screeningId)) {
      localStorage.setItem('dr_reviewed_queue_ids', JSON.stringify([...reviewedIds, screeningId]))
      window.dispatchEvent(new CustomEvent('dr-review-completed', { detail: screeningId }))
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20 }}>
        <div style={{ width: 64, height: 64, background: 'var(--color-success-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={32} color="var(--color-success)" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Clinical Review Recorded
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            {decision === 'accept'
              ? 'AI result accepted. Case closed.'
              : `Grade overridden to: Level ${overrideGrade} — ${DR_LABELS[parseInt(overrideGrade)]}`
            }
          </div>
          {comment && (
            <div style={{ marginTop: 12, padding: '10px 16px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-secondary)', maxWidth: 400 }}>
              &ldquo;{comment}&rdquo;
            </div>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setSubmitted(false)}>Review Another Case</button>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ophthalmologist Review</h1>
        <p className="page-subtitle">Clinical validation of AI screening results — human-in-the-loop decision.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px 340px', gap: 20 }}>

        {/* Left: Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Original + Annotated Image
          </div>
          <RetinalViewer
            imageUrl={screeningData?.imagePreview}
            activeOverlays={{ vessels: true, microaneurysms: true, gradcam: true, exudates: true, hemorrhages: true }}
            result={result}
            mode="original"
          />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={12} /> Showing: Original + all detected lesion overlays + Grad-CAM
          </div>
        </div>

        {/* Center: AI Findings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              AI Findings
            </div>

            {/* Severity */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: DR_COLORS[level], lineHeight: 1 }}>{level}</div>
              <div style={{ fontWeight: 700, color: DR_COLORS[level], marginBottom: 2 }}>{DR_LABELS[level]}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI Classification</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: pct >= 85 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                  {pct}%
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>confidence</span>
              </div>
            </div>

            {/* Referral */}
            <div style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: result.referral?.recommended ? 'var(--color-referral-bg)' : 'var(--color-success-bg)',
              border: `1px solid ${result.referral?.recommended ? 'rgba(139,92,246,0.3)' : 'rgba(16,185,129,0.3)'}`,
              textAlign: 'center',
              marginBottom: 14,
            }}>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: result.referral?.recommended ? 'var(--color-referral)' : 'var(--color-success)' }}>
                {result.referral?.recommended ? '⚑ REFER' : '✓ NO REFERRAL'}
              </div>
            </div>

            {/* Detected lesions */}
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Detected Lesions
            </div>
            {result.lesions && [
              ['microaneurysms', 'Microaneurysms', r => r?.count ? `${r.count} candidates` : 'None'],
              ['exudates', 'Exudates', r => r?.detected ? `${r.area}` : 'None'],
              ['hemorrhages', 'Haemorrhages', r => r?.count ? `${r.count} regions` : 'None'],
              ['neovascularization', 'Neovascular.', r => r?.detected ? 'Present' : 'None'],
            ].map(([key, label, fmt]) => {
              const lesion = result.lesions[key]
              return (
                <div key={key} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '5px 0', borderBottom: '1px solid var(--color-border)',
                  fontSize: 12,
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: lesion?.detected ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {fmt(lesion)}
                  </span>
                </div>
              )
            })}

            {/* Quality */}
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Image Quality</span>
              <span className="badge badge-success">{result.quality?.status || 'GOOD'}</span>
            </div>
          </div>
        </div>

        {/* Right: Review Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
              Clinical Review Panel
            </div>

            {/* Decision buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <button
                id="btn-accept"
                className={`btn ${decision === 'accept' ? 'btn-success' : 'btn-secondary'} w-full`}
                onClick={() => setDecision('accept')}
                aria-pressed={decision === 'accept'}
              >
                <CheckCircle size={16} /> Accept AI Result
              </button>
              <button
                id="btn-override"
                className={`btn ${decision === 'override' ? 'btn-warning' : 'btn-secondary'} w-full`}
                onClick={() => setDecision('override')}
                aria-pressed={decision === 'override'}
              >
                <XCircle size={16} /> Override Result
              </button>
            </div>

            {/* Override form */}
            {decision === 'override' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px', background: 'var(--color-surface-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-warning)', marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label required">Clinician Final Grade</label>
                  <select className="form-select" value={overrideGrade} onChange={e => setOverrideGrade(e.target.value)}>
                    <option value="">Select grade</option>
                    {[0,1,2,3,4].map(l => (
                      <option key={l} value={l}>Level {l} — {DR_LABELS[l]}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Reason for Override</label>
                  <select className="form-select" value={overrideReason} onChange={e => setOverrideReason(e.target.value)}>
                    <option value="">Select reason</option>
                    {OVERRIDE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Comment box */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={12} /> Clinician Comment
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>optional</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Enter clinical observations, additional findings, or recommendations…"
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
              />
            </div>

            {/* Submit */}
            <button
              className="btn btn-primary w-full"
              onClick={handleSubmit}
              disabled={!decision || (decision === 'override' && (!overrideGrade || !overrideReason))}
              style={{
                opacity: (!decision || (decision === 'override' && (!overrideGrade || !overrideReason))) ? 0.4 : 1,
                cursor: (!decision || (decision === 'override' && (!overrideGrade || !overrideReason))) ? 'not-allowed' : 'pointer',
              }}
            >
              Submit Clinical Decision
            </button>

            <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The final clinician decision is stored independently of the AI prediction and used for audit and model improvement.
            </div>
          </div>

          {/* Warning */}
          <div className="alert alert-warning">
            <AlertTriangle size={14} className="alert-icon" />
            <div className="alert-content" style={{ fontSize: 11 }}>
              The clinical decision recorded here will be the legally and clinically binding record. Ensure findings are accurately documented.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
