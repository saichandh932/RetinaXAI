import React, { useState } from 'react'
import { useApp } from '../App.jsx'
import { Download, Save, Printer, CheckCircle, AlertTriangle, Info, Eye } from 'lucide-react'
import RetinalViewer from '../components/RetinalViewer.jsx'

const now = new Date()
const REPORT_DATE = now.toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })

export default function ReportPage() {
  const { screeningData } = useApp()
  const [saved, setSaved] = useState(false)

  const result = screeningData?.result || {
    severity: { level: 2, label: 'Moderate NPDR', detail: 'Moderate Non-Proliferative Diabetic Retinopathy' },
    confidence: 0.91,
    lesions: {
      microaneurysms:     { detected: true, count: 14, confidence: 0.89 },
      exudates:           { detected: true, area: 'moderate', confidence: 0.94 },
      hemorrhages:        { detected: true, count: 5, confidence: 0.88 },
      neovascularization: { detected: false, confidence: 0.04 },
    },
    referral: {
      recommended: true,
      priority: 'MEDIUM',
      reason: 'Referable DR suspected based on multiple detected lesions.',
    },
    quality: { score: 87, status: 'GOOD' },
  }

  const form = screeningData?.form || {
    screeningId: 'SCR-20260909-047',
    age: '54',
    sex: 'M',
    diabetesDuration: '8',
    phc: 'PHC Rajnagar',
  }

  const level = result.severity?.level ?? 2
  const DR_LABELS = ['No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'Proliferative DR']
  const DR_COLORS = ['var(--dr-level-0)', 'var(--dr-level-1)', 'var(--dr-level-2)', 'var(--dr-level-3)', 'var(--dr-level-4)']

  const handleSave = () => {
    localStorage.setItem(`dr_report_${form.screeningId}`, JSON.stringify({ form, result, savedAt: new Date().toISOString() }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleExport = () => {
    handleSave()
    window.print()
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Screening Report</h1>
          <p className="page-subtitle">Diabetic Retinopathy Screening — Comprehensive clinical report</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleSave}>
            <Save size={15} /> {saved ? '✓ Saved' : 'Save Result'}
          </button>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={15} /> Print
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
            <Download size={15} /> Export PDF
          </button>
        </div>
      </div>

      {/* Report Content — printable */}
      <div id="report-content" style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {/* Report Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #66b982 100%)',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Eye size={24} color="white" />
              <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'white' }}>DR VisionAI</span>
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'white', marginBottom: 4 }}>
              Diabetic Retinopathy Screening Report
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)' }}>
              Explainable AI Clinical Screening System
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Report Generated</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'white' }}>{REPORT_DATE}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Model: DR-XAI v1.0</div>
          </div>
        </div>

        <div style={{ padding: 32 }}>
          {/* Sections Grid */}
          <div className="grid grid-2 gap-6">

            {/* Section 1: Screening Information */}
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                1. Screening Information
              </div>
              <table style={{ width: '100%', fontSize: 'var(--text-sm)', borderCollapse: 'collapse' }}>
                {[
                  ['Screening ID',      form.screeningId],
                  ['Date / Time',       REPORT_DATE],
                  ['PHC / Location',    form.phc],
                  ['Patient Age',       `${form.age} years`],
                  ['Sex',               form.sex === 'M' ? 'Male' : form.sex === 'F' ? 'Female' : 'Not specified'],
                  ['Diabetes Duration', form.diabetesDuration ? `${form.diabetesDuration} years` : 'Not recorded'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '5px 0', color: 'var(--text-muted)', width: 160 }}>{k}</td>
                    <td style={{ padding: '5px 0', color: 'var(--text-primary)', fontWeight: 500, fontFamily: k === 'Screening ID' ? 'var(--font-mono)' : 'inherit' }}>{v}</td>
                  </tr>
                ))}
              </table>
            </div>

            {/* Section 2: Image Quality */}
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                2. Image Quality
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--color-success)', lineHeight: 1 }}>{result.quality?.score}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ 100</div>
                </div>
                <div style={{ paddingTop: 8 }}>
                  <span className="badge badge-success">{result.quality?.status || 'GOOD'}</span>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                    Image is suitable for reliable AI screening
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: AI Classification */}
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                3. AI Classification
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 56, fontWeight: 800, color: DR_COLORS[level], lineHeight: 1 }}>{level}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: DR_COLORS[level] }}>Level {level}</div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{DR_LABELS[level]}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{result.severity?.detail}</div>
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Confidence: </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>
                      {Math.round((result.confidence ?? 0.91) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Referral */}
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                4. Referral Recommendation
              </div>
              <div style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: result.referral?.recommended ? 'var(--color-referral-bg)' : 'var(--color-success-bg)',
                border: `1px solid ${result.referral?.recommended ? 'rgba(139,92,246,0.4)' : 'rgba(16,185,129,0.4)'}`,
                marginBottom: 8,
              }}>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: result.referral?.recommended ? 'var(--color-referral)' : 'var(--color-success)' }}>
                  {result.referral?.recommended ? '⚑ REFERRAL RECOMMENDED' : '✓ NO REFERRAL REQUIRED'}
                </div>
                {result.referral?.priority && result.referral?.recommended && (
                  <div style={{ marginTop: 4 }}>
                    <span className={`badge priority-${result.referral.priority.toLowerCase()}`}>
                      {result.referral.priority === 'HIGH' ? '⚠ ' : ''}{result.referral.priority} PRIORITY
                    </span>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {result.referral?.reason}
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* Section 5: Clinical Evidence */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
              5. Clinical Evidence
            </div>
            <div className="grid grid-2 gap-4">
              {result.lesions && [
                { key: 'microaneurysms',    label: 'Microaneurysms',     detail: r => r?.count ? `${r.count} candidates` : 'Not detected' },
                { key: 'exudates',          label: 'Hard Exudates',      detail: r => r?.detected ? `${r.area || 'Detected'}` : 'Not detected' },
                { key: 'hemorrhages',       label: 'Haemorrhages',       detail: r => r?.count ? `${r.count} regions` : 'Not detected' },
                { key: 'neovascularization',label: 'Neovascularization', detail: r => r?.detected ? 'Present' : 'Not detected' },
              ].map(({ key, label, detail }) => {
                const lesion = result.lesions[key]
                return (
                  <div key={key} style={{
                    display: 'flex', gap: 12, padding: '10px 14px',
                    background: 'var(--color-surface-2)',
                    border: `1px solid ${lesion?.detected ? 'var(--color-border-light)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    opacity: lesion?.detected ? 1 : 0.55,
                  }}>
                    <div style={{ paddingTop: 2 }}>
                      {lesion?.detected
                        ? <CheckCircle size={16} color="var(--color-danger)" />
                        : <CheckCircle size={16} color="var(--color-success)" style={{ opacity: 0.5 }} />
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{detail(lesion)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Confidence: {Math.round((lesion?.confidence ?? 0) * 100)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 6: Image Panel */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
              6. Retinal Images
            </div>
            <div className="grid grid-2 gap-4">
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>ORIGINAL IMAGE</div>
                <RetinalViewer imageUrl={screeningData?.imagePreview} activeOverlays={{}} result={result} mode="original" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>ANNOTATED IMAGE (GRAD-CAM + LESIONS)</div>
                <RetinalViewer
                  imageUrl={screeningData?.imagePreview}
                  activeOverlays={{ gradcam: true, microaneurysms: true, exudates: true, hemorrhages: true, vessels: true }}
                  result={result}
                  mode="enhanced"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Human Review */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              7. Human Review
            </div>
            <div style={{
              padding: 16,
              background: 'var(--color-surface-2)',
              border: '1px dashed var(--color-border-light)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={14} color="var(--color-warning)" />
                Awaiting ophthalmologist review. Clinical decision not yet recorded.
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            padding: '14px 18px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-warning)',
            borderLeft: '4px solid var(--color-warning)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <Info size={16} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--color-warning)' }}>Clinical Disclaimer: </strong>
              This system is intended as a screening aid and does not replace professional medical diagnosis.
              All AI-generated findings must be validated by a qualified ophthalmologist before clinical decisions are made.
              This report is generated automatically and has not been verified by a clinician unless a human review is recorded above.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
