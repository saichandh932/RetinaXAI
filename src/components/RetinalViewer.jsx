import React, { useRef, useEffect, useState } from 'react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

const OVERLAY_COLORS = {
  vessels:           'rgba(96, 165, 250, 0.55)',
  opticDisc:         'rgba(251, 191, 36, 0.7)',
  fovea:             'rgba(244, 114, 182, 0.7)',
  microaneurysms:    'rgba(239, 68, 68, 0.8)',
  exudates:          'rgba(134, 239, 172, 0.7)',
  hemorrhages:       'rgba(220, 38, 38, 0.65)',
  neovascularization:'rgba(249, 115, 22, 0.75)',
  gradcam:           'rgba(167, 139, 250, 0.45)',
}

/**
 * Retinal Image Viewer with zoom/pan and canvas-based overlay rendering.
 * When no real image is provided, renders a synthetic fundus placeholder.
 */
export default function RetinalViewer({ imageUrl, activeOverlays = {}, result, mode }) {
  const canvasRef  = useRef(null)
  const imgRef     = useRef(null)
  const stateRef   = useRef({ scale: 1, offsetX: 0, offsetY: 0, isDragging: false, lastX: 0, lastY: 0 })
  const [loaded, setLoaded]   = useState(false)

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { scale, offsetX, offsetY } = stateRef.current
    const W = canvas.width, H = canvas.height

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.translate(W / 2 + offsetX, H / 2 + offsetY)
    ctx.scale(scale, scale)

    // Draw image or synthetic placeholder
    if (imgRef.current && loaded) {
      const iw = imgRef.current.naturalWidth, ih = imgRef.current.naturalHeight
      const aspectW = Math.min(W / iw, H / ih) * Math.min(W, H) / Math.min(W, H) * 0.92
      const dw = iw * aspectW, dh = ih * aspectW
      if (mode === 'enhanced') ctx.filter = 'contrast(1.25) saturate(1.2) brightness(1.08)'
      ctx.drawImage(imgRef.current, -dw / 2, -dh / 2, dw, dh)
      ctx.filter = 'none'
    } else {
      drawSyntheticFundus(ctx, W, H, result)
    }

    // Draw overlays
    drawOverlays(ctx, W, H, activeOverlays, result)

    ctx.restore()
  }

  const drawSyntheticFundus = (ctx, W, H, result) => {
    const level = result?.severity?.level ?? 2
    const R = Math.min(W, H) * 0.44

    // Background (vitreous / off-black)
    ctx.fillStyle = '#050505'
    ctx.beginPath()
    ctx.arc(0, 0, R + 20, 0, Math.PI * 2)
    ctx.fill()

    // Retinal background — orange-red gradient
    const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, R)
    bg.addColorStop(0, '#6b2a10')
    bg.addColorStop(0.5, '#8b3612')
    bg.addColorStop(0.9, '#3d1508')
    bg.addColorStop(1, '#1a0804')
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, Math.PI * 2)
    ctx.fill()

    // Vessels — branching lines
    ctx.strokeStyle = 'rgba(160,50,20,0.8)'
    ctx.lineWidth = 2
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(R * 0.18 * Math.cos(angle + 0.3), R * 0.18 * Math.sin(angle + 0.3))
      ctx.bezierCurveTo(
        R * 0.4 * Math.cos(angle + 0.1), R * 0.4 * Math.sin(angle + 0.1),
        R * 0.65 * Math.cos(angle - 0.2), R * 0.65 * Math.sin(angle - 0.2),
        R * 0.9 * Math.cos(angle), R * 0.9 * Math.sin(angle)
      )
      ctx.stroke()
    }

    // Optic disc
    const odx = R * 0.3, ody = -R * 0.05
    const odGrad = ctx.createRadialGradient(odx, ody, 2, odx, ody, R * 0.12)
    odGrad.addColorStop(0, '#fff8dc')
    odGrad.addColorStop(0.6, '#f0d080')
    odGrad.addColorStop(1, '#d4a020')
    ctx.fillStyle = odGrad
    ctx.beginPath()
    ctx.arc(odx, ody, R * 0.12, 0, Math.PI * 2)
    ctx.fill()

    // Fovea (darker central area)
    const fovx = -R * 0.16, fovy = 0
    const fovGrad = ctx.createRadialGradient(fovx, fovy, 0, fovx, fovy, R * 0.08)
    fovGrad.addColorStop(0, 'rgba(40,10,5,0.9)')
    fovGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = fovGrad
    ctx.beginPath()
    ctx.arc(fovx, fovy, R * 0.1, 0, Math.PI * 2)
    ctx.fill()

    // Lesions based on severity level
    if (level >= 1) {
      // Microaneurysms — tiny red dots
      const maCount = [0, 6, 14, 32, 50][level]
      ctx.fillStyle = 'rgba(200,30,30,0.85)'
      for (let i = 0; i < maCount; i++) {
        const angle = (i / maCount) * Math.PI * 2 * 3.1 + i * 0.5
        const r2 = R * (0.2 + Math.random() * 0.6)
        ctx.beginPath()
        ctx.arc(r2 * Math.cos(angle), r2 * Math.sin(angle), 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (level >= 2) {
      // Hard exudates — bright yellow patches
      ctx.fillStyle = 'rgba(255,230,100,0.75)'
      for (let i = 0; i < 4 + level * 2; i++) {
        const angle = (i / 6) * Math.PI * 2 * 1.4
        const r2 = R * (0.3 + i * 0.05)
        ctx.beginPath()
        ctx.arc(r2 * Math.cos(angle + 0.8), r2 * Math.sin(angle + 0.8), 4 + level, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (level >= 3) {
      // Flame haemorrhages
      ctx.fillStyle = 'rgba(180,20,20,0.7)'
      for (let i = 0; i < 8 + level * 3; i++) {
        const angle = (i / 10) * Math.PI * 2 * 2.3
        const r2 = R * (0.25 + Math.random() * 0.55)
        ctx.beginPath()
        ctx.ellipse(r2 * Math.cos(angle), r2 * Math.sin(angle), 6, 3, angle, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (level >= 4) {
      // Neovascularization — tangled vessel network at disc
      ctx.strokeStyle = 'rgba(249,115,22,0.7)'
      ctx.lineWidth = 1.5
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(odx, ody)
        ctx.bezierCurveTo(
          odx + R * 0.08 * Math.cos(a), ody + R * 0.08 * Math.sin(a),
          odx + R * 0.15 * Math.cos(a + 0.5), ody + R * 0.15 * Math.sin(a + 0.5),
          odx + R * 0.22 * Math.cos(a + 0.8), ody + R * 0.22 * Math.sin(a + 0.8)
        )
        ctx.stroke()
      }
    }

    // Rim clip mask
    ctx.globalCompositeOperation = 'destination-in'
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
  }

  const drawOverlays = (ctx, W, H, overlays, result) => {
    const R = Math.min(W, H) * 0.44
    const level = result?.severity?.level ?? 2

    // Grad-CAM overlay
    if (overlays.gradcam) {
      const grd = ctx.createRadialGradient(-R * 0.1, R * 0.05, 0, -R * 0.1, R * 0.05, R * 0.5)
      grd.addColorStop(0, 'rgba(167,139,250,0.5)')
      grd.addColorStop(0.4, 'rgba(167,139,250,0.25)')
      grd.addColorStop(1, 'transparent')
      ctx.save()
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.clip()
      ctx.fillStyle = grd; ctx.fillRect(-R, -R, R * 2, R * 2)
      ctx.restore()
    }

    // Vessel overlay
    if (overlays.vessels) {
      ctx.save()
      ctx.globalAlpha = 0.4
      ctx.strokeStyle = OVERLAY_COLORS.vessels
      ctx.lineWidth = 1.5
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(R * 0.18 * Math.cos(angle + 0.3), R * 0.18 * Math.sin(angle + 0.3))
        ctx.bezierCurveTo(
          R * 0.4 * Math.cos(angle + 0.1), R * 0.4 * Math.sin(angle + 0.1),
          R * 0.65 * Math.cos(angle - 0.2), R * 0.65 * Math.sin(angle - 0.2),
          R * 0.9 * Math.cos(angle), R * 0.9 * Math.sin(angle)
        )
        ctx.stroke()
      }
      ctx.restore()
    }

    // Optic disc overlay
    if (overlays.opticDisc) {
      ctx.save(); ctx.globalAlpha = 0.6
      ctx.strokeStyle = OVERLAY_COLORS.opticDisc; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(R * 0.3, -R * 0.05, R * 0.13, 0, Math.PI * 2); ctx.stroke()
      ctx.restore()
    }

    // Fovea overlay
    if (overlays.fovea) {
      ctx.save(); ctx.globalAlpha = 0.7
      ctx.strokeStyle = OVERLAY_COLORS.fovea; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(-R * 0.16, 0, R * 0.07, 0, Math.PI * 2); ctx.stroke()
      ctx.restore()
    }

    // Microaneurysms overlay
    if (overlays.microaneurysms && level >= 1) {
      ctx.save(); ctx.globalAlpha = 0.9
      ctx.fillStyle = OVERLAY_COLORS.microaneurysms
      const maCount = [0, 6, 14, 32, 50][Math.min(level, 4)]
      for (let i = 0; i < maCount; i++) {
        const angle = (i / maCount) * Math.PI * 2 * 3.1 + i * 0.5
        const r2 = R * (0.2 + (i * 0.037 % 0.6))
        ctx.beginPath(); ctx.arc(r2 * Math.cos(angle), r2 * Math.sin(angle), 4, 0, Math.PI * 2); ctx.fill()
      }
      ctx.restore()
    }

    // Exudates overlay
    if (overlays.exudates && level >= 2) {
      ctx.save(); ctx.globalAlpha = 0.7
      ctx.fillStyle = OVERLAY_COLORS.exudates
      for (let i = 0; i < 4 + level * 2; i++) {
        const angle = (i / 6) * Math.PI * 2 * 1.4
        const r2 = R * (0.3 + i * 0.05)
        ctx.beginPath(); ctx.arc(r2 * Math.cos(angle + 0.8), r2 * Math.sin(angle + 0.8), 6 + level, 0, Math.PI * 2); ctx.fill()
      }
      ctx.restore()
    }

    // Hemorrhages overlay
    if (overlays.hemorrhages && level >= 2) {
      ctx.save(); ctx.globalAlpha = 0.7
      ctx.fillStyle = OVERLAY_COLORS.hemorrhages
      for (let i = 0; i < 5 + level * 2; i++) {
        const angle = (i / 10) * Math.PI * 2 * 2.3
        const r2 = R * (0.25 + (i * 0.055 % 0.55))
        ctx.beginPath(); ctx.ellipse(r2 * Math.cos(angle), r2 * Math.sin(angle), 8, 4, angle, 0, Math.PI * 2); ctx.fill()
      }
      ctx.restore()
    }

    // Neovascularization overlay
    if (overlays.neovascularization && level >= 4) {
      ctx.save(); ctx.globalAlpha = 0.8
      ctx.strokeStyle = OVERLAY_COLORS.neovascularization; ctx.lineWidth = 2
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        const odx = R * 0.3, ody = -R * 0.05
        ctx.beginPath(); ctx.moveTo(odx, ody)
        ctx.bezierCurveTo(
          odx + R * 0.08 * Math.cos(a), ody + R * 0.08 * Math.sin(a),
          odx + R * 0.15 * Math.cos(a + 0.5), ody + R * 0.15 * Math.sin(a + 0.5),
          odx + R * 0.22 * Math.cos(a + 0.8), ody + R * 0.22 * Math.sin(a + 0.8)
        )
        ctx.stroke()
      }
      ctx.restore()
    }
  }

  // Set up canvas & mouse events
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const onResize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      draw()
    }

    const onWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      stateRef.current.scale = Math.min(5, Math.max(0.5, stateRef.current.scale * delta))
      draw()
    }

    const onMouseDown = (e) => {
      stateRef.current.isDragging = true
      stateRef.current.lastX = e.clientX
      stateRef.current.lastY = e.clientY
      canvas.style.cursor = 'grabbing'
    }

    const onMouseMove = (e) => {
      if (!stateRef.current.isDragging) return
      stateRef.current.offsetX += e.clientX - stateRef.current.lastX
      stateRef.current.offsetY += e.clientY - stateRef.current.lastY
      stateRef.current.lastX = e.clientX
      stateRef.current.lastY = e.clientY
      draw()
    }

    const onMouseUp = () => {
      stateRef.current.isDragging = false
      canvas.style.cursor = 'crosshair'
    }

    window.addEventListener('resize', onResize)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    draw()

    return () => {
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  // Redraw when overlays or result change
  useEffect(() => { draw() }, [activeOverlays, result, loaded, mode])

  // Load actual image if provided
  useEffect(() => {
    if (imageUrl) {
      const img = new Image()
      img.onload = () => { imgRef.current = img; setLoaded(true); draw() }
      img.src = imageUrl
    }
  }, [imageUrl])

  const zoom = (delta) => {
    stateRef.current.scale = Math.min(5, Math.max(0.5, stateRef.current.scale * delta))
    draw()
  }

  const reset = () => {
    stateRef.current.scale = 1
    stateRef.current.offsetX = 0
    stateRef.current.offsetY = 0
    draw()
  }

  return (
    <div className="image-viewer-container" style={{ height: 420, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        className="image-viewer-canvas"
        style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
        aria-label="Retinal image viewer — scroll to zoom, drag to pan"
      />

      {!imageUrl && (
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(7,11,20,0.8)', backdropFilter: 'blur(4px)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)', padding: '4px 10px',
          fontSize: 9, color: 'var(--color-warning)', fontWeight: 600,
        }}>
          SYNTHETIC FUNDUS — Upload real image
        </div>
      )}

      <div className="image-viewer-controls">
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => zoom(1.25)} title="Zoom in" aria-label="Zoom in">
          <ZoomIn size={14} />
        </button>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => zoom(0.8)} title="Zoom out" aria-label="Zoom out">
          <ZoomOut size={14} />
        </button>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={reset} title="Reset view" aria-label="Reset view">
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  )
}
