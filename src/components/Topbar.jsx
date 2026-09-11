import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../App.jsx'
import { ChevronDown, User, Menu, Info } from 'lucide-react'

const BREADCRUMBS = {
  '/home':          'Home Dashboard',
  '/new-screening': 'New Screening',
  '/quality':       'Image Quality Assessment',
  '/analysis':      'AI Analysis',
  '/clinical':      'Clinical Results',
  '/xai':           'Explainability View',
  '/report':        'Screening Report',
  '/review':        'Ophthalmologist Review',
  '/queue':         'Review Queue',
  '/admin':         'Analytics Dashboard',
  '/simulation':    'Resource Simulation',
  '/settings':      'Settings',
}

const ROLE_OPTIONS = [
  { value: 'operator',        label: 'Mode A — Screening Operator' },
  { value: 'ophthalmologist', label: 'Mode B — Ophthalmologist' },
  { value: 'admin',           label: 'Mode C — Program Administrator' },
]

export default function Topbar() {
  const { role, setRole } = useApp()
  const [roleOpen, setRoleOpen] = useState(false)
  const location = useLocation()
  const pageTitle = BREADCRUMBS[location.pathname] || 'DR VisionAI'

  return (
    <header className="app-topbar">
      {/* Left: page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
          {pageTitle}
        </span>
      </div>

      {/* Right: system info + role selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* System status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '5px 10px',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
          System Online
        </div>

        {/* AI Screening Aid disclaimer */}
        <button
          title="This system is a screening aid and does not replace professional medical diagnosis."
          style={{
            background: 'var(--color-warning-bg)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '5px 10px',
            color: 'var(--color-warning)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            cursor: 'help',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: 'var(--font-sans)',
          }}
        >
          <Info size={12} /> Screening Aid
        </button>

        {/* Role selector dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="role-selector"
            onClick={() => setRoleOpen(!roleOpen)}
            aria-label="Switch user role"
            aria-expanded={roleOpen}
          >
            <User size={14} />
            <span>{ROLE_OPTIONS.find(r => r.value === role)?.label}</span>
            <ChevronDown size={13} style={{ opacity: 0.6, marginLeft: 4 }} />
          </button>

          {roleOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              minWidth: 260,
              zIndex: 200,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '10px 14px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Switch View
              </div>
              {ROLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setRole(opt.value); setRoleOpen(false) }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: role === opt.value ? 'var(--color-primary-glow)' : 'none',
                    border: 'none',
                    color: role === opt.value ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: role === opt.value ? 600 : 400,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = role === opt.value ? 'var(--color-primary-glow)' : 'none'}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
