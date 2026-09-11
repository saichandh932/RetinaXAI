import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'
import { Info, FileText } from 'lucide-react'
import RetinalViewer from '../components/RetinalViewer.jsx'

export default function ExplainabilityPage() {
  const navigate  = useNavigate()
  const { screeningData } = useApp()

  const result = screeningData?.result || {
    severity: { level: 2, label: 'Moderate NPDR' },
    confidence: 0.91,
    lesions: {
      microaneurysms:    { detected: true, count: 14, confidence: 0.89 },
      exudates:          { detected: true, area: 'moderate', confidence: 0.94 },
      hemorrhages:       { detected: true, count: 5, confidence: 0.88 },
      neovascularization:{ detected: false, confidence: 0.04 },
    },
  }

  const XAI_PANELS = [
    {
      key: 'original',
      label: 'ORIGINAL',
      subtitle: 'Unmodified fundus image as captured',
      overlays: {},
      color: '#94a3b8',
    },
    {
      key: 'gradcam',
      label: 'GRAD-CAM',
      subtitle: 'Class activation mapping — model attention',
      overlays: { gradcam: true },
      color: '#a78bfa',
    },
    {
      key: 'lesion',
      label: 'LESION MAP',
      subtitle: 'Independently detected retinal abnormalities',
      overlays: { microaneurysms: true, exudates: true, hemorrhages: true, neovascularization: true },
      color: '#ef4444',
    },
    {
      key: 'combined',
      label: 'COMBINED',
      subtitle: 'Structural + Grad-CAM + lesion overlays',
      overlays: { gradcam: true, vessels: true, microaneurysms: true, exudates: true, opticDisc: true },
      color: '#10b981',
    },
  ]

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Explainability View</h1>
          <p className="page-subtitle">
            AI transparency: model attention, detected lesions, and combined clinical evidence.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/report')}>
          <FileText size={15} /> Generate Report
        </button>
      </div>

      {/* Important caveat */}
      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        <Info size={16} className="alert-icon" />
        <div className="alert-content">
          <div className="alert-title">About This View</div>
          <div className="alert-body">
            Highlighted regions indicate areas that contributed strongly to the model prediction.
            Lesion overlays show independently detected retinal abnormalities.
            <strong> Grad-CAM attention maps support clinical review but do not independently prove clinical reasoning.</strong>
            Always verify AI findings with qualified clinical judgement.
          </div>
        </div>
      </div>

      {/* 2×2 XAI Grid */}
      <div className="xai-grid" style={{ height: 640, marginBottom: 20 }}>
        {XAI_PANELS.map(panel => (
          <div key={panel.key} className="xai-cell" style={{ height: '100%' }}>
            <RetinalViewer
              imageUrl={screeningData?.imagePreview}
              activeOverlays={panel.overlays}
              result={result}
              mode="original"
            />
            <div className="xai-cell-label" style={{ color: panel.color }}>
              {panel.label}
            </div>
            <div style={{
              position: 'absolute', bottom: 6, left: 8, right: 8,
              fontSize: 9, color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
            }}>
              {panel.subtitle}
            </div>
          </div>
        ))}
      </div>

      {/* Clinical Correlation */}
      <div className="grid grid-2 gap-5">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Grad-CAM Interpretation</h2>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Gradient-weighted Class Activation Mapping (Grad-CAM) highlights image regions that
            most strongly influenced the model&apos;s severity prediction. Warmer regions (purple
            in this view) correspond to higher activation gradients from the final convolutional layers.
          </p>
          <div className="alert alert-warning" style={{ marginTop: 14 }}>
            <Info size={14} className="alert-icon" />
            <div className="alert-content" style={{ fontSize: 11 }}>
              Grad-CAM regions are not equivalent to clinical lesion locations and should be interpreted
              alongside the independent lesion detection results.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Lesion Evidence Correlation</h2>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
            The lesion detection module independently identifies retinal abnormalities and correlates
            findings with the International Clinical DR Severity Scale:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { grade: 'Level 0', criterion: 'No abnormalities detected', met: result.severity?.level >= 0 },
              { grade: 'Level 1', criterion: 'Microaneurysms only', met: result.severity?.level >= 1 },
              { grade: 'Level 2', criterion: 'MA + exudates / haemorrhages', met: result.severity?.level >= 2 },
              { grade: 'Level 3', criterion: '>20 haemorrhages in ≥1 quadrant / venous beading', met: result.severity?.level >= 3 },
              { grade: 'Level 4', criterion: 'Neovascularisation / vitreous haemorrhage', met: result.severity?.level >= 4 },
            ].map(row => (
              <div key={row.grade} style={{
                display: 'flex', gap: 10, padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                background: row.met ? 'var(--color-primary-glow)' : 'var(--color-surface-2)',
                border: `1px solid ${row.met ? 'rgba(37,99,235,0.3)' : 'var(--color-border)'}`,
                fontSize: 12,
              }}>
                <span style={{ fontWeight: 700, color: 'var(--color-primary-light)', width: 54, flexShrink: 0 }}>{row.grade}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{row.criterion}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="card" style={{ marginTop: 20, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Architecture',      value: 'EfficientNet-B4 + Grad-CAM' },
          { label: 'Training Dataset',  value: 'EyePACS + MESSIDOR-2 + IDRiD' },
          { label: 'Sensitivity (≥L2)', value: '>90%' },
          { label: 'Specificity (≥L2)', value: '>85%' },
          { label: 'Model Version',     value: 'DR-XAI v1.0' },
          { label: 'Calibration',       value: 'Platt scaling applied' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{item.label}</span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', fontFamily: item.label.includes('Sensitivity') || item.label.includes('Version') ? 'var(--font-mono)' : 'var(--font-sans)' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
