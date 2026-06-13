'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

interface PhotoAdjusterProps {
  photos: string[]
  onComplete: (adjustedPhotos: AdjustedPhoto[]) => void
  onBack: () => void
  filterType: 'bw' | 'color'
}

export interface AdjustedPhoto {
  src: string
  x: number
  y: number
  scale: number
  naturalW: number
  naturalH: number
}

const FRAME_W = 400
const FRAME_H = 300

export default function PhotoAdjuster({ photos, onComplete, onBack, filterType }: PhotoAdjusterProps) {
  const [current, setCurrent] = useState(0)
  const [adjusted, setAdjusted] = useState<AdjustedPhoto[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const dragging = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })
  const lastPinchDist = useRef<number | null>(null)
  const [state, setState] = useState({ x: 0, y: 0, scale: 1 })
  const [ready, setReady] = useState(false)

  // Load image and set initial cover-fit
  useEffect(() => {
    setReady(false)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      const s = Math.max(FRAME_W / img.naturalWidth, FRAME_H / img.naturalHeight)
      const x = (FRAME_W - img.naturalWidth * s) / 2
      const y = (FRAME_H - img.naturalHeight * s) / 2
      setState({ x, y, scale: s })
      setReady(true)
    }
    img.src = photos[current]
  }, [current, photos])

  // Re-render canvas on state change
  useEffect(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !ready) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, FRAME_W, FRAME_H)

    if (filterType === 'bw') {
      const tmp = document.createElement('canvas')
      tmp.width = FRAME_W; tmp.height = FRAME_H
      const tctx = tmp.getContext('2d')!
      tctx.drawImage(img, state.x, state.y, img.naturalWidth * state.scale, img.naturalHeight * state.scale)
      const id = tctx.getImageData(0, 0, FRAME_W, FRAME_H)
      const d = id.data
      for (let i = 0; i < d.length; i += 4) {
        const g = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114
        d[i] = d[i+1] = d[i+2] = g
      }
      tctx.putImageData(id, 0, 0)
      ctx.drawImage(tmp, 0, 0)
    } else {
      ctx.drawImage(img, state.x, state.y, img.naturalWidth * state.scale, img.naturalHeight * state.scale)
    }
  }, [state, ready, filterType])

  const zoomAt = useCallback((factor: number) => {
    setState(s => {
      const ns = Math.max(0.2, Math.min(6, s.scale * factor))
      const cx = FRAME_W / 2, cy = FRAME_H / 2
      return { x: cx - (cx - s.x) * (ns / s.scale), y: cy - (cy - s.y) * (ns / s.scale), scale: ns }
    })
  }, [])

  const resetFit = useCallback(() => {
    const img = imgRef.current; if (!img) return
    const s = Math.max(FRAME_W / img.naturalWidth, FRAME_H / img.naturalHeight)
    setState({ x: (FRAME_W - img.naturalWidth * s) / 2, y: (FRAME_H - img.naturalHeight * s) / 2, scale: s })
  }, [])

  // Mouse
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: state.x, oy: state.y }
  }, [state])
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    setState(s => ({ ...s, x: dragStart.current.ox + e.clientX - dragStart.current.mx, y: dragStart.current.oy + e.clientY - dragStart.current.my }))
  }, [])
  const onMouseUp = useCallback(() => { dragging.current = false }, [])
  const onWheel = useCallback((e: React.WheelEvent) => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.09 : 0.92) }, [zoomAt])

  // Touch
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragging.current = true
      dragStart.current = { mx: e.touches[0].clientX, my: e.touches[0].clientY, ox: state.x, oy: state.y }
    } else {
      dragging.current = false
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastPinchDist.current = Math.sqrt(dx*dx + dy*dy)
    }
  }, [state])
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 1 && dragging.current) {
      setState(s => ({ ...s, x: dragStart.current.ox + e.touches[0].clientX - dragStart.current.mx, y: dragStart.current.oy + e.touches[0].clientY - dragStart.current.my }))
    } else if (e.touches.length === 2 && lastPinchDist.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx*dx + dy*dy)
      zoomAt(dist / lastPinchDist.current)
      lastPinchDist.current = dist
    }
  }, [zoomAt])
  const onTouchEnd = useCallback(() => { dragging.current = false; lastPinchDist.current = null }, [])

  const handleConfirm = useCallback(() => {
    const img = imgRef.current; if (!img) return
    const next: AdjustedPhoto = { src: photos[current], x: state.x, y: state.y, scale: state.scale, naturalW: img.naturalWidth, naturalH: img.naturalHeight }
    const all = [...adjusted, next]
    if (current + 1 < photos.length) { setAdjusted(all); setCurrent(c => c + 1) }
    else onComplete(all)
  }, [state, current, photos, adjusted, onComplete])

  const displayScale = typeof window !== 'undefined' ? Math.min((window.innerWidth * 0.5) / FRAME_W, 1.5) : 1

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 40px', borderBottom: '2px solid #1a1a1a', background: '#f5f0e8', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ fontFamily: 'Caveat, cursive', fontSize: '1.05rem', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer' }}>← back</button>
        <span style={{ fontFamily: 'Special Elite, serif', fontSize: '1.2rem', flex: 1, textAlign: 'center', letterSpacing: '0.04em' }}>
          adjust photo {current + 1} / {photos.length}
        </span>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 6 }}>
          {photos.map((_, i) => (
            <div key={i} style={{ width: i < current ? 22 : i === current ? 22 : 9, height: 9, borderRadius: 5, background: i < current ? '#27ae60' : i === current ? '#1a1a1a' : 'rgba(26,26,26,0.2)', transition: 'all 0.3s' }}/>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 48, padding: '36px 40px' }}>

        {/* Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <p style={{ fontFamily: 'Caveat, cursive', fontSize: '0.95rem', opacity: 0.4, margin: 0 }}>
            drag · scroll to zoom · pinch on mobile
          </p>
          <div style={{
            width: FRAME_W * displayScale, height: FRAME_H * displayScale,
            overflow: 'hidden', border: '3px solid #1a1a1a',
            boxShadow: '6px 6px 0 rgba(0,0,0,0.14)', cursor: 'grab',
            position: 'relative', background: '#111', flexShrink: 0,
          }}>
            <canvas
              ref={canvasRef}
              width={FRAME_W} height={FRAME_H}
              style={{ width: FRAME_W * displayScale, height: FRAME_H * displayScale, display: 'block', touchAction: 'none' }}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove}
              onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
              onWheel={onWheel}
            />
            {/* Rule-of-thirds grid */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
              <line x1="33%" y1="0" x2="33%" y2="100%" stroke="white" strokeWidth="1"/>
              <line x1="66%" y1="0" x2="66%" y2="100%" stroke="white" strokeWidth="1"/>
              <line x1="0" y1="33%" x2="100%" y2="33%" stroke="white" strokeWidth="1"/>
              <line x1="0" y1="66%" x2="100%" y2="66%" stroke="white" strokeWidth="1"/>
            </svg>
          </div>

          {/* Zoom bar */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => zoomAt(0.87)} style={{ width: 38, height: 38, fontWeight: 700, fontSize: '1.3rem', background: 'white', border: '2px solid #1a1a1a', boxShadow: '2px 2px 0 rgba(0,0,0,0.1)', cursor: 'pointer', borderRadius: 2, fontFamily: 'Caveat, cursive' }}>−</button>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.75rem', opacity: 0.5, minWidth: 50, textAlign: 'center' }}>{Math.round(state.scale * 100)}%</span>
            <button onClick={() => zoomAt(1.15)} style={{ width: 38, height: 38, fontWeight: 700, fontSize: '1.3rem', background: 'white', border: '2px solid #1a1a1a', boxShadow: '2px 2px 0 rgba(0,0,0,0.1)', cursor: 'pointer', borderRadius: 2, fontFamily: 'Caveat, cursive' }}>+</button>
            <button onClick={resetFit} style={{ fontFamily: 'Caveat, cursive', fontSize: '0.92rem', padding: '6px 16px', background: 'transparent', border: '2px solid #1a1a1a', cursor: 'pointer', borderRadius: 2, marginLeft: 4 }}>reset fit</button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 240, maxWidth: 300 }}>
          <div style={{ background: 'white', border: '2px solid #1a1a1a', boxShadow: '4px 4px 0 rgba(0,0,0,0.08)', padding: '20px 22px', borderRadius: 2 }}>
            <div style={{ fontFamily: 'Special Elite, serif', fontSize: '0.95rem', letterSpacing: '0.04em', marginBottom: 12, opacity: 0.65 }}>adjust tips ✦</div>
            {[['🖱','drag to reposition'],['🔍','scroll wheel to zoom'],['📱','pinch to zoom on phone'],['⊡','"reset fit" for cover view'],['✓','grid lines help align']].map(([i,t]) => (
              <div key={t} style={{ fontFamily: 'Caveat, cursive', fontSize: '0.95rem', lineHeight: 1.75, opacity: 0.55, display: 'flex', gap: 8 }}>
                <span>{i}</span><span>{t}</span>
              </div>
            ))}
          </div>

          {adjusted.length > 0 && (
            <div>
              <div style={{ fontFamily: 'Caveat, cursive', fontSize: '0.82rem', opacity: 0.38, marginBottom: 8 }}>adjusted ✓</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {adjusted.map((a, i) => (
                  <div key={i} style={{ width: 52, height: 39, overflow: 'hidden', border: '2px solid #27ae60', position: 'relative' }}>
                    <img src={a.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(39,174,96,0.3)', color: 'white', fontSize: '1rem' }}>✓</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleConfirm} style={{
            fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1.2rem',
            padding: '0.78em 1.5em',
            background: '#1a1a1a', color: '#f5f0e8',
            border: '2.5px solid #1a1a1a', boxShadow: '4px 4px 0 rgba(0,0,0,0.18)',
            cursor: 'pointer', borderRadius: 2,
          }}>
            {current + 1 < photos.length ? `confirm & next →` : `finish adjusting ✦`}
          </button>

          <p style={{ fontFamily: 'Caveat, cursive', fontSize: '0.82rem', opacity: 0.35, margin: 0 }}>
            photo {current + 1} of {photos.length}
          </p>
        </div>
      </div>
    </div>
  )
}