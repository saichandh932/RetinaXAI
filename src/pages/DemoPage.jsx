import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'
import { DR_Backend, DEMO_CASES } from '../backend.js'
import { PlayCircle, Eye, ChevronRight, Star, AlertTriangle, CheckCircle } from 'lucide-react'

const DEMO_CASE_LIST = [
  { key: 'normal',      label: 'Normal Retina',     grade: 'Level 0', icon: '👁', color: 'var(--dr-level-0)', description: 'No diabetic retinopathy detected' },
  { key: 'mild',        label: 'Mild NPDR',          grade: 'Level 1', icon: '🔴', color: 'var(--dr-level-1)', description: 'Microaneurysms only' },
  { key: 'moderate',    label: 'Moderate NPDR',      grade: 'Level 2', icon: '🟠', color: 'var(--dr-level-2)', description: 'Microaneurysms, exudates, haemorrhages' },
  { key: 'severe',      label: 'Severe NPDR',        grade: 'Level 3', icon: '🔶', color: 'var(--dr-level-3)', description: 'Extensive haemorrhages, venous beading' },
  { key: 'pdr',         label: 'Proliferative DR',   grade: 'Level 4', icon: '🔴', color: 'var(--dr-level-4)', description: 'Neovascularization — vision-threatening' },
  { key: 'poor_quality',label: 'Poor Quality Image', grade: '—',       icon: '⚠',  color: 'var(--color-warning)', description: 'Ungradable — recapture required' },
]

const DEMO_FLOW = [
  'Select a sample case above',
  'Patient info auto-fills',
  'Quality assessment runs (~1s)',
  'AI analysis stages complete (~5s)',
  'Clinical results with lesion overlays',
  'Explainability: Grad-CAM + lesion map',
  'Referral recommendation generated',
  'Ophthalmologist review screen',
  'District analytics dashboard',
  'Resource simulation',
]

export default function DemoPage() {
  const navigate = useNavigate()
  const { setDemoMode, setScreeningData } = useApp()
  const [selected, setSelected] = useState(null)
  const [starting, setStarting] = useState(false)

  const handleStart = async () => {
    if (!selected) return
    setStarting(true)
    const caseData = DEMO_CASES[selected]

    setDemoMode(true)
    setScreeningData({
      demoCase: selected,
      form: {
        screeningId: caseData.caseId,
        age: '54',
        sex: 'M',
        diabetesDuration: '8',
        phc: 'PHC Rajnagar (Demo)',
      },
      imagePreview: null, // Use synthetic fundus
    })

    await new Promise(r => setTimeout(r, 600))
    navigate('/quality')
  }

  const handleQuickView = (path) => {
    setDemoMode(true)
    const caseData = DEMO_CASES['moderate']
    setScreeningData({
      demoCase: 'moderate',
      form: { screeningId: 'DEMO-003', age: '54', sex: 'M', diabetesDuration: '8', phc: 'PHC Rajnagar (Demo)' },
      result: caseData,
    })
    navigate(path)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Demo Mode</h1>
        <p className="page-subtitle">
          SIH Judge Demonstration — Run through the complete DR screening workflow with pre-computed sample cases.
        </p>
      </div>

      {/* Demo banner */}
      <div className="demo-banner" style={{ marginBottom: 24 }}>
        <Star size={16} />
        <div>
          <strong>SIH 2026 Demonstration Mode</strong> — All cases use realistic pre-computed AI results.
          Select a case below to begin the guided screening workflow demonstration.
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 340px' }}>

        {/* Case selection */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Step 1: Select a Sample Case
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Each case demonstrates a different DR severity grade. The Moderate NPDR case (Level 2)
              is recommended for the primary SIH demonstration.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {DEMO_CASE_LIST.map(c => (
              <div
                key={c.key}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(c.key)}
                onKeyDown={e => e.key === 'Enter' && setSelected(c.key)}
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-lg)',
                  background: selected === c.key ? 'var(--color-primary-glow)' : 'var(--color-surface)',
                  border: `2px solid ${selected === c.key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {c.key === 'moderate' && (
                  <div style={{
                    position: 'absolute', top: -8, right: 10,
                    background: 'var(--color-primary)',
                    color: 'white', fontSize: 9, fontWeight: 700,
                    padding: '2px 8px', borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    ★ Recommended
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{c.label}</div>
                    <div style={{ fontSize: 11, color: c.color, fontWeight: 600 }}>{c.grade}</div>
                  </div>
                  {selected === c.key && <CheckCircle size={16} color="var(--color-primary-light)" style={{ marginLeft: 'auto' }} />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.description}</div>
              </div>
            ))}
          </div>

          {/* Start button */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-primary btn-xl"
              onClick={handleStart}
              disabled={!selected || starting}
              style={{ opacity: (!selected || starting) ? 0.5 : 1 }}
            >
              {starting
                ? <><Eye size={18} style={{ animation: 'spin 1s linear infinite' }} /> Starting…</>
                : <><PlayCircle size={18} /> Start Demo Workflow</>
              }
            </button>
            <button className="btn btn-ghost" onClick={() => setSelected(null)} disabled={!selected}>
              Clear
            </button>
          </div>
        </div>

        {/* Right: Quick access + flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Quick jump */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 12 }}>
              <h2 className="card-title">Quick Jump (Moderate NPDR)</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Clinical Results', path: '/clinical', desc: 'Lesion overlays + severity' },
                { label: 'Explainability',   path: '/xai',      desc: 'Grad-CAM + lesion map' },
                { label: 'Report',           path: '/report',   desc: 'Full screening report' },
                { label: 'Ophthal. Review',  path: '/review',   desc: 'Human-in-the-loop review' },
                { label: 'Review Queue',     path: '/queue',    desc: 'All pending cases' },
                { label: 'Analytics',        path: '/admin',    desc: 'District-level dashboard' },
                { label: 'Simulation',       path: '/simulation',desc: 'Resource planning' },
              ].map(item => (
                <button
                  key={item.path}
                  className="btn btn-secondary w-full"
                  onClick={() => handleQuickView(item.path)}
                  style={{ justifyContent: 'space-between', textAlign: 'left' }}
                >
                  <span>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>{item.desc}</div>
                  </span>
                  <ChevronRight size={14} style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Demo flow */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 12 }}>
              <h2 className="card-title">Demo Flow (10 steps)</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_FLOW.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'var(--color-primary-glow)',
                    border: '1px solid rgba(37,99,235,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: 'var(--color-primary-light)',
                    flexShrink: 0, marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
