import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'
import { Upload, Camera, Monitor, ArrowRight, Info, User, MapPin, Calendar, Activity } from 'lucide-react'

const PHC_LIST = [
  'PHC Rajnagar', 'PHC Bilaspur', 'PHC Raipur Central', 'PHC Korba', 'PHC Ambikapur',
  'PHC Jagdalpur', 'PHC Durg', 'PHC Bhilai', 'PHC Raigarh', 'PHC Kawardha'
]

export default function NewScreeningPage() {
  const navigate = useNavigate()
  const { setScreeningData } = useApp()
  const fileInputRef = useRef()
  const [dragging, setDragging] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile]  = useState(null)

  const [form, setForm] = useState({
    screeningId: `SCR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Date.now()).slice(-3)}`,
    age: '',
    sex: '',
    diabetesDuration: '',
    phc: '',
  })

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (file) => {
    if (!file) return
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Unable to process this file. Please upload a supported retinal image (JPG, PNG, TIFF).')
      return
    }
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleProceed = () => {
    setScreeningData({ form, imageFile, imagePreview })
    navigate('/quality')
  }

  const canProceed = form.age && form.sex && form.phc && imageFile

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">New Screening</h1>
        <p className="page-subtitle">Enter patient information and capture or upload a retinal image to begin screening.</p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* Left: Patient Information */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={16} color="var(--color-primary-light)" />
              Patient Information
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Screening ID (auto-generated, read-only) */}
            <div className="form-group">
              <label className="form-label">Screening ID</label>
              <input
                className="form-input"
                value={form.screeningId}
                readOnly
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary-light)', opacity: 0.9 }}
              />
            </div>

            {/* Age + Sex */}
            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label required">Age (years)</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="e.g. 54"
                  value={form.age}
                  onChange={e => handleFieldChange('age', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label required">Sex</label>
                <select
                  className="form-select"
                  value={form.sex}
                  onChange={e => handleFieldChange('sex', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other / Not specified</option>
                </select>
              </div>
            </div>

            {/* Diabetes Duration */}
            <div className="form-group">
              <label className="form-label">
                Diabetes Duration (years)
                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>optional</span>
              </label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="80"
                placeholder="e.g. 8"
                value={form.diabetesDuration}
                onChange={e => handleFieldChange('diabetesDuration', e.target.value)}
              />
            </div>

            {/* PHC / Location */}
            <div className="form-group">
              <label className="form-label required">
                <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                PHC / Location
              </label>
              <select
                className="form-select"
                value={form.phc}
                onChange={e => handleFieldChange('phc', e.target.value)}
              >
                <option value="">Select PHC</option>
                {PHC_LIST.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Privacy note */}
            <div className="alert alert-info" style={{ padding: '10px 12px' }}>
              <Info size={14} className="alert-icon" />
              <div className="alert-body" style={{ fontSize: 11 }}>
                Patient name and contact information are not collected by this system.
                Only clinically necessary information is recorded.
              </div>
            </div>
          </div>
        </div>

        {/* Right: Image Acquisition */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} color="var(--color-primary-light)" />
              Image Acquisition
            </h2>
          </div>

          {!imagePreview ? (
            <div>
              {/* Upload zone */}
              <div
                className={`upload-zone${dragging ? ' dragging' : ''}`}
                onClick={() => fileInputRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Click or drag to upload retinal image"
                onKeyDown={e => e.key === 'Enter' && fileInputRef.current.click()}
              >
                <div className="upload-zone-icon">
                  <Upload size={28} />
                </div>
                <div>
                  <div className="upload-zone-title">Upload Retinal Image</div>
                  <div className="upload-zone-subtitle">Drag &amp; drop or click to browse<br />JPEG · PNG · TIFF · BMP supported</div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleFileSelect(e.target.files[0])}
              />

              {/* Alternative methods */}
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} disabled title="Requires connected fundus camera">
                  <Camera size={14} /> Capture
                </button>
                <button className="btn btn-secondary" style={{ flex: 1 }} disabled title="Import from external device">
                  <Monitor size={14} /> Import from Device
                </button>
              </div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                Capture and device import require connected fundus camera hardware
              </p>
            </div>
          ) : (
            <div>
              {/* Image preview */}
              <div style={{
                background: '#000',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                position: 'relative',
                aspectRatio: '1.2',
              }}>
                <img
                  src={imagePreview}
                  alt="Retinal image preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(0,0,0,0.7)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '3px 8px',
                  fontSize: 10,
                  color: 'var(--color-success)',
                  fontWeight: 600,
                }}>
                  ✓ Image Loaded
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setImagePreview(null); setImageFile(null) }}
                >
                  Replace Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Proceed */}
      <div style={{
        marginTop: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 24px',
      }}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          {!canProceed && (
            <span style={{ color: 'var(--text-muted)' }}>
              Complete all required fields and upload an image to proceed.
            </span>
          )}
          {canProceed && (
            <span style={{ color: 'var(--color-success)' }}>
              ✓ Ready to assess image quality
            </span>
          )}
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleProceed}
          disabled={!canProceed}
          style={{ opacity: canProceed ? 1 : 0.4, cursor: canProceed ? 'pointer' : 'not-allowed' }}
        >
          Assess Image Quality <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
