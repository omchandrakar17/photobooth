'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { drawPhotoStrip, STRIP_WIDTH, getStripHeight, FrameStyle } from '@/lib/canvasEngine'
import { AdjustedPhoto } from './PhotoAdjuster'
import { STICKERS, stickerToDataUrl } from '@/lib/stickers'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { savePhotoStrip } from '@/lib/supabase'

interface EditorScreenProps {
  photos: string[]
  adjustedPhotos?: AdjustedPhoto[]   // ← only new prop added
  filterType: 'bw' | 'color'
  frameStyle: FrameStyle
  onFinish: (finalImageUrl: string, shareId: string | null, shareUrl: string | null, caption: string | null) => void
  onRetake: () => void
}

type DrawTool = 'pen' | 'marker' | 'eraser'

const COLORS = ['#1a1a1a', '#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#ffffff']

const DoodleBg = () => (
  <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="editorBg" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
        <rect x="12" y="8" width="36" height="26" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.07"/>
        <circle cx="30" cy="21" r="8" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.07"/>
        <path d="M20 8 L22 3 L38 3 L40 8" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.07"/>
        <path d="M68 18 Q76 10 84 18 Q92 26 100 18" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.06"/>
        <circle cx="120" cy="10" r="5" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.07"/>
        <circle cx="116" cy="18" r="5" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.07"/>
        <path d="M123 12 L145 2" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round" opacity="0.07"/>
        <path d="M119 20 L145 8" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round" opacity="0.07"/>
        <rect x="5" y="95" width="55" height="34" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.06"/>
        <rect x="9" y="100" width="13" height="9" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1" opacity="0.06"/>
        <rect x="26" y="100" width="13" height="9" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1" opacity="0.06"/>
        <rect x="43" y="100" width="13" height="9" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1" opacity="0.06"/>
        <path d="M118 90 L120 99 L130 101 L120 103 L118 112 L116 103 L106 101 L116 99 Z" fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.07"/>
        <path d="M155 95 L155 107 M149 101 L161 101" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" opacity="0.06"/>
        <rect x="112" y="155" width="28" height="20" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.07"/>
        <circle cx="126" cy="165" r="6" fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.07"/>
        <path d="M150 165 Q158 157 166 165 Q174 173 182 165" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.06"/>
        <circle cx="50" cy="170" r="4" fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.07"/>
        <circle cx="47" cy="177" r="4" fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.07"/>
        <path d="M53 172 L70 162" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" opacity="0.07"/>
        <path d="M49 178 L70 168" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" opacity="0.07"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#editorBg)"/>
  </svg>
)

export default function EditorScreen({ photos, adjustedPhotos, filterType, frameStyle, onFinish, onRetake }: EditorScreenProps) {
  const stripCanvasRef = useRef<HTMLCanvasElement>(null)
  const doodleCanvasRef = useRef<HTMLCanvasElement>(null)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)

  const [isStripReady, setIsStripReady] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawTool, setDrawTool] = useState<DrawTool>('pen')
  const [drawColor, setDrawColor] = useState('#1a1a1a')
  const [drawSize, setDrawSize] = useState(3)
  const [activeTab, setActiveTab] = useState<'draw' | 'stickers'>('draw')
  const [caption, setCaption] = useState<string>('')
  const [captionVisible, setCaptionVisible] = useState(false)
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [scale, setScale] = useState(1)

  const stripHeight = getStripHeight()

  // Render photo strip — now passes adjustedPhotos if available
  useEffect(() => {
    const render = async () => {
      try {
        const canvas = await drawPhotoStrip({
          photos,
          adjustedPhotos,       // ← passed through to canvas engine
          filterType,
          frameStyle,
          brandText: 'photobooth',
        })
        if (stripCanvasRef.current) {
          const ctx = stripCanvasRef.current.getContext('2d')!
          stripCanvasRef.current.width = canvas.width
          stripCanvasRef.current.height = canvas.height
          ctx.drawImage(canvas, 0, 0)
          setIsStripReady(true)
        }
      } catch (err) {
        console.error('Strip render error:', err)
        setIsStripReady(true)
      }
    }
    render()
  }, [photos, adjustedPhotos, filterType, frameStyle])

  // Scale strip to fit the left column height
  useEffect(() => {
    const update = () => {
      const availableH = window.innerHeight - 80
      const availableW = Math.min(window.innerWidth * 0.42, 420)
      const scaleByH = availableH / stripHeight
      const scaleByW = availableW / STRIP_WIDTH
      setScale(Math.min(scaleByH, scaleByW, 1))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [stripHeight])

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = doodleCanvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale }
  }, [scale])

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDrawing(true)
    const pos = getPos(e)
    lastPoint.current = pos
    const ctx = doodleCanvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.globalCompositeOperation = drawTool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, drawSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = drawTool === 'eraser' ? 'rgba(0,0,0,1)' : drawColor
    ctx.fill()
  }, [getPos, drawColor, drawSize, drawTool])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing || !lastPoint.current) return
    const ctx = doodleCanvasRef.current?.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
    ctx.lineTo(pos.x, pos.y)
    if (drawTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth = drawSize * 4
    } else if (drawTool === 'marker') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = drawColor + '88'
      ctx.lineWidth = drawSize * 3
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = drawColor
      ctx.lineWidth = drawSize
    }
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPoint.current = pos
  }, [isDrawing, getPos, drawColor, drawSize, drawTool])

  const endDraw = useCallback(() => {
    setIsDrawing(false)
    lastPoint.current = null
    const ctx = doodleCanvasRef.current?.getContext('2d')
    if (ctx) ctx.globalCompositeOperation = 'source-over'
  }, [])

  const placeSticker = useCallback((sticker: typeof STICKERS[0]) => {
    const svgUrl = stickerToDataUrl(sticker.svg)
    const x = STRIP_WIDTH * 0.25 + Math.random() * STRIP_WIDTH * 0.5
    const y = 80 + Math.random() * (stripHeight - 180)
    const ctx = doodleCanvasRef.current?.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => ctx.drawImage(img, x - 35, y - 20, 70, 42)
    img.src = svgUrl
  }, [stripHeight])

  const generateCaption = useCallback(async () => {
    setIsGeneratingCaption(true)
    try {
      const res = await fetch('/api/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filterType, frameStyle }),
      })
      const data = await res.json()
      if (data.caption) { setCaption(data.caption); setCaptionVisible(true) }
    } catch {
      setCaption(filterType === 'bw' ? 'feeling cinematic ✦' : 'main character energy ✦')
      setCaptionVisible(true)
    } finally {
      setIsGeneratingCaption(false)
    }
  }, [filterType, frameStyle])

  const clearDoodles = useCallback(() => {
    const ctx = doodleCanvasRef.current?.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, STRIP_WIDTH, stripHeight)
  }, [stripHeight])

  const handleFinish = useCallback(async () => {
    if (!stripCanvasRef.current || !doodleCanvasRef.current) return
    setIsSaving(true)
    try {
      const finalCanvas = await drawPhotoStrip({
        photos,
        adjustedPhotos,       // ← baked into final output
        filterType,
        frameStyle,
        brandText: 'photobooth',
        caption: captionVisible && caption ? caption : undefined,
      })
      const merged = document.createElement('canvas')
      merged.width = finalCanvas.width
      merged.height = finalCanvas.height
      const mctx = merged.getContext('2d')!
      mctx.imageSmoothingEnabled = true
      mctx.imageSmoothingQuality = 'high'
      mctx.drawImage(finalCanvas, 0, 0)
      // Scale doodle layer up to match hi-res canvas
      mctx.drawImage(doodleCanvasRef.current, 0, 0, merged.width, merged.height)
      const base64 = merged.toDataURL('image/png')  // PNG = lossless

      // Show final page immediately
      onFinish(base64, null, null, captionVisible && caption ? caption : null)

      // Upload in background
      try {
        const cloudUrl = await uploadToCloudinary(base64, filterType)
        if (cloudUrl) await savePhotoStrip(cloudUrl, filterType, caption || undefined, frameStyle)
      } catch (uploadErr) {
        console.warn('Upload failed (non-critical):', uploadErr)
      }
    } catch (err) {
      console.error('handleFinish error:', err)
      const fallback = stripCanvasRef.current?.toDataURL('image/png') || ''
      onFinish(fallback, null, null, captionVisible && caption ? caption : null)
    } finally {
      setIsSaving(false)
    }
  }, [photos, adjustedPhotos, filterType, frameStyle, caption, captionVisible, onFinish])

  const tabStyle = (tab: 'draw' | 'stickers'): React.CSSProperties => ({
    flex: 1, padding: '13px',
    fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1.05rem',
    background: activeTab === tab ? '#1a1a1a' : 'transparent',
    color: activeTab === tab ? '#f5f0e8' : '#1a1a1a',
    cursor: 'pointer', border: 'none',
    borderRight: tab === 'draw' ? '2px solid #1a1a1a' : 'none',
    letterSpacing: '0.03em',
  })

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#f5f0e8', position: 'relative', overflow: 'hidden' }}>
      <DoodleBg />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── Top bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '14px 40px',
          borderBottom: '2px solid #1a1a1a',
          background: '#f5f0e8',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <button onClick={onRetake} style={{ fontFamily: 'Caveat, cursive', fontSize: '1.05rem', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a' }}>
            ↩ retake
          </button>
          <span style={{ fontFamily: 'Special Elite, serif', fontSize: '1.3rem', flex: 1, textAlign: 'center', letterSpacing: '0.05em' }}>
            doodle it
          </span>
          <button
            onClick={handleFinish}
            disabled={isSaving || !isStripReady}
            style={{
              fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1.1rem',
              padding: '0.5em 1.8em',
              background: isSaving || !isStripReady ? 'rgba(26,26,26,0.35)' : '#1a1a1a',
              color: '#f5f0e8',
              border: '2.5px solid #1a1a1a',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
              cursor: isSaving || !isStripReady ? 'not-allowed' : 'pointer',
              borderRadius: 2,
            }}
          >
            {isSaving ? 'saving...' : 'finish ✦'}
          </button>
        </div>

        {/* ── Two-column desktop layout ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 0,
          maxWidth: 1100,
          margin: '0 auto',
          width: '100%',
          padding: '32px 40px',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}>

          {/* LEFT: Strip canvas */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingRight: 40, flex: '0 0 auto' }}>
            <div style={{ position: 'relative', width: STRIP_WIDTH * scale, height: stripHeight * scale }}>

              <canvas
                ref={stripCanvasRef}
                width={STRIP_WIDTH}
                height={stripHeight}
                style={{ position: 'absolute', top: 0, left: 0, width: STRIP_WIDTH * scale, height: stripHeight * scale }}
              />

              <canvas
                ref={doodleCanvasRef}
                width={STRIP_WIDTH}
                height={stripHeight}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: STRIP_WIDTH * scale, height: stripHeight * scale,
                  touchAction: 'none',
                  cursor: activeTab === 'draw' ? 'crosshair' : 'default',
                }}
                onMouseDown={activeTab === 'draw' ? startDraw : undefined}
                onMouseMove={activeTab === 'draw' ? draw : undefined}
                onMouseUp={activeTab === 'draw' ? endDraw : undefined}
                onMouseLeave={activeTab === 'draw' ? endDraw : undefined}
                onTouchStart={activeTab === 'draw' ? startDraw : undefined}
                onTouchMove={activeTab === 'draw' ? draw : undefined}
                onTouchEnd={activeTab === 'draw' ? endDraw : undefined}
              />

              {!isStripReady && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(245,240,232,0.92)',
                  fontFamily: 'Caveat, cursive', fontSize: '1.2rem',
                }}>
                  <span className="loading-dots">developing<span>.</span><span>.</span><span>.</span></span>
                </div>
              )}
            </div>

            {isStripReady && activeTab === 'draw' && (
              <p style={{ fontFamily: 'Caveat, cursive', fontSize: '0.88rem', opacity: 0.35, marginTop: 10, textAlign: 'center' }}>
                draw directly on the strip ↑
              </p>
            )}
          </div>

          {/* RIGHT: Tools panel */}
          <div style={{
            flex: '1 1 320px',
            maxWidth: 440,
            minWidth: 300,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            border: '2px solid #1a1a1a',
            boxShadow: '5px 5px 0 rgba(0,0,0,0.1)',
            background: '#ede8d8',
            borderRadius: 2,
            overflow: 'hidden',
          }}>

            {/* Caption bar */}
            <div style={{
              padding: '12px 18px',
              borderBottom: '2px solid #1a1a1a',
              display: 'flex', alignItems: 'center', gap: 10, minHeight: 58,
              background: '#e8e3d2',
            }}>
              {captionVisible ? (
                <>
                  <div style={{ flex: 1 }}>
                    <input
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      style={{
                        width: '100%', fontFamily: 'Caveat, cursive', fontStyle: 'italic',
                        fontSize: '1.05rem', background: 'transparent', border: 'none',
                        borderBottom: '1.5px dashed rgba(26,26,26,0.3)', outline: 'none',
                        color: '#1a1a1a', paddingBottom: 2,
                      }}
                      placeholder="edit your caption..."
                    />
                  </div>
                  <button onClick={generateCaption} disabled={isGeneratingCaption}
                    style={{ fontFamily: 'Caveat, cursive', fontSize: '0.88rem', padding: '4px 12px', background: 'transparent', border: '1.5px solid #1a1a1a', cursor: 'pointer', opacity: isGeneratingCaption ? 0.5 : 1, borderRadius: 2, whiteSpace: 'nowrap' }}>
                    ↻ new
                  </button>
                  <button onClick={() => { setCaption(''); setCaptionVisible(false) }}
                    style={{ opacity: 0.3, fontSize: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Caveat, cursive', padding: '0 4px' }}>
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: 'Caveat, cursive', fontSize: '0.95rem', opacity: 0.4, flex: 1 }}>
                    no caption — add one?
                  </span>
                  <button
                    onClick={generateCaption}
                    disabled={isGeneratingCaption}
                    style={{
                      fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1rem',
                      padding: '0.45em 1.3em',
                      background: '#1a1a1a', color: '#f5f0e8',
                      border: '2px solid #1a1a1a',
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
                      cursor: isGeneratingCaption ? 'not-allowed' : 'pointer',
                      borderRadius: 2, opacity: isGeneratingCaption ? 0.6 : 1, whiteSpace: 'nowrap',
                    }}
                  >
                    {isGeneratingCaption ? 'generating...' : '✦ ai caption'}
                  </button>
                </>
              )}
            </div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', borderBottom: '2px solid #1a1a1a' }}>
              <button onClick={() => setActiveTab('draw')} style={tabStyle('draw')}>✏ draw</button>
              <button onClick={() => setActiveTab('stickers')} style={tabStyle('stickers')}>✦ stickers</button>
            </div>

            {/* Draw tools */}
            {activeTab === 'draw' && (
              <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <div style={{ fontFamily: 'Caveat, cursive', fontSize: '0.88rem', opacity: 0.45, marginBottom: 8 }}>tool</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {([
                      { id: 'pen' as DrawTool, label: '✏ pen' },
                      { id: 'marker' as DrawTool, label: '▌ marker' },
                      { id: 'eraser' as DrawTool, label: '◻ eraser' },
                    ]).map(t => (
                      <button key={t.id} onClick={() => setDrawTool(t.id)} style={{
                        flex: 1, padding: '8px 4px',
                        fontFamily: 'Caveat, cursive', fontSize: '0.95rem',
                        background: drawTool === t.id ? '#1a1a1a' : 'white',
                        color: drawTool === t.id ? '#f5f0e8' : '#1a1a1a',
                        border: '2px solid #1a1a1a',
                        boxShadow: drawTool === t.id ? '2px 2px 0 rgba(0,0,0,0.2)' : 'none',
                        cursor: 'pointer', borderRadius: 2,
                      }}>{t.label}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontFamily: 'Caveat, cursive', fontSize: '0.88rem', opacity: 0.45, marginBottom: 10 }}>color</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {COLORS.map(c => (
                      <button key={c} onClick={() => { setDrawColor(c); setDrawTool('pen') }} style={{
                        width: 36, height: 36, borderRadius: '50%', background: c,
                        border: drawColor === c && drawTool !== 'eraser' ? '3px solid #1a1a1a' : '1.5px solid rgba(0,0,0,0.15)',
                        boxShadow: drawColor === c && drawTool !== 'eraser' ? '0 0 0 2px #ede8d8, 0 0 0 4px #1a1a1a' : 'none',
                        cursor: 'pointer', transition: 'transform 0.1s',
                      }}/>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontFamily: 'Caveat, cursive', fontSize: '0.88rem', opacity: 0.45, marginBottom: 6 }}>
                    size: {drawSize}px
                  </div>
                  <input type="range" min={1} max={16} value={drawSize}
                    onChange={e => setDrawSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#1a1a1a' }}
                  />
                </div>

                <button onClick={clearDoodles} style={{
                  fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1rem',
                  padding: '0.6em',
                  background: 'white', color: '#1a1a1a',
                  border: '2px solid #1a1a1a',
                  boxShadow: '2px 2px 0 rgba(0,0,0,0.1)',
                  cursor: 'pointer', borderRadius: 2,
                }}>
                  clear doodles
                </button>
              </div>
            )}

            {/* Stickers */}
            {activeTab === 'stickers' && (
              <div style={{ padding: '20px 20px' }}>
                <p style={{ fontFamily: 'Caveat, cursive', fontSize: '0.88rem', opacity: 0.45, marginBottom: 14 }}>
                  tap a sticker to place it on your strip
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {STICKERS.map(s => (
                    <button key={s.id} onClick={() => placeSticker(s)} style={{
                      height: 58, background: 'white',
                      border: '2px solid #1a1a1a',
                      boxShadow: '2px 2px 0 #1a1a1a',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 4, borderRadius: 2,
                      transition: 'transform 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
                    dangerouslySetInnerHTML={{ __html: s.svg }}/>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}