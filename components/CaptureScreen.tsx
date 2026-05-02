'use client'

import { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'

interface CaptureScreenProps {
  filterType: 'bw' | 'color'
  onComplete: (photos: string[]) => void
  onBack: () => void
}

type Mode = 'choose' | 'webcam' | 'upload'
type CaptureState = 'ready' | 'countdown' | 'done'

// Reuse same doodle bg pattern from setup screen
const DoodleBg = ({ dark = false }: { dark?: boolean }) => (
  <svg
    style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="captureBg" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
        <rect x="12" y="8" width="36" height="26" rx="4" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.3" opacity="0.07"/>
        <circle cx="30" cy="21" r="8" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.3" opacity="0.07"/>
        <path d="M20 8 L22 3 L38 3 L40 8" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.3" opacity="0.07"/>
        <path d="M68 18 Q76 10 84 18 Q92 26 100 18" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.3" opacity="0.06"/>
        <circle cx="120" cy="10" r="5" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.3" opacity="0.07"/>
        <circle cx="116" cy="18" r="5" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.3" opacity="0.07"/>
        <path d="M123 12 L145 2" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.3" strokeLinecap="round" opacity="0.07"/>
        <path d="M119 20 L145 8" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.3" strokeLinecap="round" opacity="0.07"/>
        <path d="M170 14 C170 14 162 6 162 1 C162 -3 165 -5 168 -5 C170 -5 170 -3 170 -3 C170 -3 170 -5 172 -5 C175 -5 178 -3 178 1 C178 6 170 14 170 14Z" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.3" opacity="0.07"/>
        <rect x="5" y="95" width="55" height="34" rx="3" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.3" opacity="0.06"/>
        <rect x="9"  y="100" width="13" height="9" rx="1" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1" opacity="0.06"/>
        <rect x="26" y="100" width="13" height="9" rx="1" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1" opacity="0.06"/>
        <rect x="43" y="100" width="13" height="9" rx="1" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1" opacity="0.06"/>
        <path d="M118 90 L120 99 L130 101 L120 103 L118 112 L116 103 L106 101 L116 99 Z" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.2" opacity="0.07"/>
        <path d="M155 95 L155 107 M149 101 L161 101" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.2" strokeLinecap="round" opacity="0.06"/>
        <rect x="112" y="155" width="28" height="20" rx="3" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.2" opacity="0.07"/>
        <circle cx="126" cy="165" r="6" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.2" opacity="0.07"/>
        <path d="M117 155 L119 151 L133 151 L135 155" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.2" opacity="0.07"/>
        <path d="M150 165 Q158 157 166 165 Q174 173 182 165 Q190 157 198 165" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.3" opacity="0.06"/>
        <circle cx="50" cy="170" r="4" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.2" opacity="0.07"/>
        <circle cx="47" cy="177" r="4" fill="none" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.2" opacity="0.07"/>
        <path d="M53 172 L70 162" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.2" strokeLinecap="round" opacity="0.07"/>
        <path d="M49 178 L70 168" stroke={dark ? '#f5f0e8' : '#1a1a1a'} strokeWidth="1.2" strokeLinecap="round" opacity="0.07"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#captureBg)"/>
  </svg>
)

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export default function CaptureScreen({ filterType, onComplete, onBack }: CaptureScreenProps) {
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<Mode>('choose')
  const [photos, setPhotos] = useState<string[]>([])
  const [captureState, setCaptureState] = useState<CaptureState>('ready')
  const [countdownNum, setCountdownNum] = useState<number | null>(null)
  const [showFlash, setShowFlash] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const totalShots = 4

  const playShutter = useCallback(() => {
    try {
      const ctx = new AudioContext()
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02))
      const src = ctx.createBufferSource()
      src.buffer = buf
      const gain = ctx.createGain()
      gain.gain.value = 0.4
      src.connect(gain)
      gain.connect(ctx.destination)
      src.start()
    } catch {}
  }, [])

  const runSequence = useCallback(async () => {
    if (captureState !== 'ready') return
    setCaptureState('countdown')
    const captured: string[] = []
    for (let shot = 0; shot < totalShots; shot++) {
      for (let n = 3; n >= 1; n--) { setCountdownNum(n); await sleep(900) }
      setCountdownNum(null)
      setShowFlash(true)
      playShutter()
      const photo = webcamRef.current?.getScreenshot()
      await sleep(150)
      setShowFlash(false)
      if (photo) { captured.push(photo); setPhotos([...captured]) }
      if (shot < totalShots - 1) await sleep(1800)
    }
    setCaptureState('done')
    await sleep(400)
    onComplete(captured)
  }, [captureState, onComplete, playShutter])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4)
    if (!files.length) return
    Promise.all(files.map(f => new Promise<string>(resolve => {
      const r = new FileReader()
      r.onload = ev => resolve(ev.target?.result as string)
      r.readAsDataURL(f)
    }))).then(results => {
      const filled = [...results]
      while (filled.length < 4) filled.push(results[results.length - 1])
      setUploadedPhotos(filled.slice(0, 4))
    })
  }, [])

  // ── CHOOSE MODE ──────────────────────────────────────────────────────────
  if (mode === 'choose') {
    return (
      <div style={{ minHeight: '100vh', width: '100%', position: 'relative', background: '#f5f0e8', display: 'flex', flexDirection: 'column' }}>
        <DoodleBg />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 40px', borderBottom: '2px solid rgba(26,26,26,0.1)' }}>
            <button onClick={onBack} style={{ fontFamily: 'Caveat, cursive', fontSize: '1.05rem', opacity: 0.55, background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a' }}>
              ← back
            </button>
            <h2 style={{ fontFamily: 'Special Elite, serif', fontSize: '1.4rem', letterSpacing: '0.05em', flex: 1, textAlign: 'center', margin: 0 }}>
              choose your mode
            </h2>
            <div style={{ width: 60 }} />
          </div>

          {/* Two big mode cards */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 28, maxWidth: 820, width: '100%', justifyContent: 'center' }}>

              {/* Webcam card */}
              <button
                onClick={() => setMode('webcam')}
                style={{
                  flex: '1 1 300px', maxWidth: 380,
                  padding: '44px 36px', textAlign: 'left',
                  background: 'white',
                  border: '2.5px solid #1a1a1a',
                  boxShadow: '6px 6px 0 rgba(0,0,0,0.12)',
                  cursor: 'pointer', borderRadius: 2,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '8px 8px 0 rgba(0,0,0,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '6px 6px 0 rgba(0,0,0,0.12)' }}
              >
                {/* Camera SVG icon */}
                <svg width="56" height="42" viewBox="0 0 56 42" fill="none" style={{ marginBottom: 20 }}>
                  <rect x="2" y="10" width="52" height="30" rx="5" stroke="#1a1a1a" strokeWidth="2.5"/>
                  <circle cx="28" cy="25" r="10" stroke="#1a1a1a" strokeWidth="2.5"/>
                  <circle cx="28" cy="25" r="5" stroke="#1a1a1a" strokeWidth="2"/>
                  <path d="M18 10 L21 4 L35 4 L38 10" stroke="#1a1a1a" strokeWidth="2.5" strokeLinejoin="round"/>
                  <rect x="44" y="16" width="6" height="5" rx="1" stroke="#1a1a1a" strokeWidth="1.5"/>
                </svg>
                <div style={{ fontFamily: 'Special Elite, serif', fontSize: '1.5rem', color: '#1a1a1a', marginBottom: 10, letterSpacing: '0.03em' }}>
                  use camera
                </div>
                <div style={{ fontFamily: 'Caveat, cursive', fontSize: '1.05rem', color: '#1a1a1a', opacity: 0.55, lineHeight: 1.6 }}>
                  live webcam · 3-2-1 countdown<br/>4 automatic snaps
                </div>
              </button>

              {/* Upload card */}
              <button
                onClick={() => setMode('upload')}
                style={{
                  flex: '1 1 300px', maxWidth: 380,
                  padding: '44px 36px', textAlign: 'left',
                  background: 'white',
                  border: '2.5px solid #1a1a1a',
                  boxShadow: '6px 6px 0 rgba(0,0,0,0.12)',
                  cursor: 'pointer', borderRadius: 2,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '8px 8px 0 rgba(0,0,0,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '6px 6px 0 rgba(0,0,0,0.12)' }}
              >
                {/* Upload SVG icon */}
                <svg width="56" height="42" viewBox="0 0 56 42" fill="none" style={{ marginBottom: 20 }}>
                  <rect x="2" y="14" width="52" height="26" rx="4" stroke="#1a1a1a" strokeWidth="2.5"/>
                  <path d="M28 28 L28 8 M20 16 L28 8 L36 16" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ fontFamily: 'Special Elite, serif', fontSize: '1.5rem', color: '#1a1a1a', marginBottom: 10, letterSpacing: '0.03em' }}>
                  upload photos
                </div>
                <div style={{ fontFamily: 'Caveat, cursive', fontSize: '1.05rem', color: '#1a1a1a', opacity: 0.55, lineHeight: 1.6 }}>
                  pick 1–4 images from device<br/>jpg, png, webp supported
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── UPLOAD MODE ──────────────────────────────────────────────────────────
  if (mode === 'upload') {
    return (
      <div style={{ minHeight: '100vh', width: '100%', position: 'relative', background: '#f5f0e8', display: 'flex', flexDirection: 'column' }}>
        <DoodleBg />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 40px', borderBottom: '2px solid rgba(26,26,26,0.1)' }}>
            <button onClick={() => setMode('choose')} style={{ fontFamily: 'Caveat, cursive', fontSize: '1.05rem', opacity: 0.55, background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a' }}>
              ← back
            </button>
            <h2 style={{ fontFamily: 'Special Elite, serif', fontSize: '1.4rem', letterSpacing: '0.05em', flex: 1, textAlign: 'center', margin: 0 }}>
              upload photos
            </h2>
            <div style={{ width: 60 }} />
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
            <div style={{ maxWidth: 680, width: '100%', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>

              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display: 'none' }}/>

              {/* Drop zone */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%', padding: '52px 32px',
                  background: 'white',
                  border: '2.5px dashed rgba(26,26,26,0.35)',
                  cursor: 'pointer', borderRadius: 3,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.background = '#faf8f3' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,26,26,0.35)'; e.currentTarget.style.background = 'white' }}
              >
                <svg width="52" height="40" viewBox="0 0 52 40" fill="none">
                  <rect x="2" y="12" width="48" height="26" rx="4" stroke="#1a1a1a" strokeWidth="2" opacity="0.5"/>
                  <path d="M26 26 L26 6 M18 14 L26 6 L34 14" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                </svg>
                <div style={{ fontFamily: 'Special Elite, serif', fontSize: '1.3rem', color: '#1a1a1a', opacity: 0.7 }}>
                  click to choose photos
                </div>
                <div style={{ fontFamily: 'Caveat, cursive', fontSize: '1rem', color: '#1a1a1a', opacity: 0.4 }}>
                  select 1–4 images · they'll fill all 4 slots
                </div>
              </button>

              {/* Preview grid */}
              {uploadedPhotos.length > 0 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, width: '100%' }}>
                    {uploadedPhotos.map((p, i) => (
                      <div key={i} style={{ aspectRatio: '4/3', overflow: 'hidden', border: '2.5px solid #1a1a1a', boxShadow: '3px 3px 0 rgba(0,0,0,0.1)', position: 'relative', background: '#ddd' }}>
                        <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: filterType === 'bw' ? 'grayscale(100%)' : undefined }} alt={`photo ${i + 1}`}/>
                        <div style={{ position: 'absolute', bottom: 5, left: 7, fontFamily: 'Caveat, cursive', fontSize: '0.8rem', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                          #{i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => onComplete(uploadedPhotos)}
                    style={{
                      fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1.25rem',
                      padding: '0.75em 3em',
                      background: '#1a1a1a', color: '#f5f0e8',
                      border: '2.5px solid #1a1a1a',
                      boxShadow: '5px 5px 0 rgba(0,0,0,0.18)',
                      cursor: 'pointer', borderRadius: 2,
                    }}
                  >
                    use these 4 photos →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── WEBCAM MODE ──────────────────────────────────────────────────────────
  const photoCount = photos.length

  return (
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative', background: '#1a1a1a', display: 'flex', flexDirection: 'column' }}>
      <DoodleBg dark={true} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 40px', borderBottom: '1px solid rgba(245,240,232,0.1)' }}>
          <button onClick={() => setMode('choose')} disabled={captureState !== 'ready'} style={{ fontFamily: 'Caveat, cursive', fontSize: '1.05rem', color: captureState !== 'ready' ? 'rgba(245,240,232,0.2)' : 'rgba(245,240,232,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← back
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Special Elite, serif', color: '#f5f0e8', fontSize: '1.1rem', letterSpacing: '0.05em' }}>
            shot {Math.min(photoCount + 1, totalShots)} of {totalShots}
          </div>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: totalShots }).map((_, i) => (
              <div key={i} style={{ width: i < photoCount ? 22 : 9, height: 9, borderRadius: 5, background: i < photoCount ? '#f5f0e8' : 'rgba(245,240,232,0.2)', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}/>
            ))}
          </div>
        </div>

        {/* Desktop layout: webcam + thumbnails side by side */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 40px', gap: 40, flexWrap: 'wrap' }}>

          {/* Camera feed */}
          <div style={{ flex: '1 1 400px', maxWidth: 640 }}>
            <div style={{ position: 'relative', background: '#111', overflow: 'hidden', aspectRatio: '4/3', border: '3px solid rgba(245,240,232,0.15)', boxShadow: '0 0 0 1px rgba(245,240,232,0.05), 8px 8px 40px rgba(0,0,0,0.4)' }}>
              {cameraError ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#f5f0e8', fontFamily: 'Caveat, cursive', fontSize: '1.2rem', textAlign: 'center', gap: 12, padding: 24 }}>
                  <span style={{ fontSize: '3rem' }}>📷</span>
                  camera not available<br/>
                  <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>check browser permissions or use upload mode</span>
                  <button onClick={() => setMode('upload')} style={{ marginTop: 8, fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1rem', padding: '0.5em 1.5em', background: '#f5f0e8', color: '#1a1a1a', border: 'none', cursor: 'pointer', borderRadius: 2 }}>
                    upload instead →
                  </button>
                </div>
              ) : (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.92}
                  videoConstraints={{ width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }}
                  mirrored={true}
                  onUserMediaError={() => setCameraError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: filterType === 'bw' ? 'grayscale(100%) contrast(1.05)' : 'saturate(1.1)' }}
                />
              )}

              {/* Countdown */}
              {countdownNum !== null && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 20 }}>
                  <span key={countdownNum} className="countdown-num">{countdownNum}</span>
                </div>
              )}

              {/* Flash */}
              {showFlash && <div className="flash-overlay"/>}

              {/* Viewfinder corners */}
              {(['tl','tr','bl','br'] as const).map(c => (
                <div key={c} style={{ position: 'absolute', width: 24, height: 24, borderColor: 'rgba(245,240,232,0.6)', borderStyle: 'solid', borderWidth: 0, ...(c==='tl'&&{top:12,left:12,borderTopWidth:2,borderLeftWidth:2}), ...(c==='tr'&&{top:12,right:12,borderTopWidth:2,borderRightWidth:2}), ...(c==='bl'&&{bottom:12,left:12,borderBottomWidth:2,borderLeftWidth:2}), ...(c==='br'&&{bottom:12,right:12,borderBottomWidth:2,borderRightWidth:2}) }}/>
              ))}

              {/* Filter label */}
              <div style={{ position: 'absolute', bottom: 12, left: 14, fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', color: 'rgba(245,240,232,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {filterType === 'bw' ? '◑ b+w' : '◉ color'}
              </div>
            </div>

            {/* Shoot button under camera */}
            <div style={{ marginTop: 20 }}>
              {captureState === 'ready' && (
                <button
                  onClick={runSequence}
                  style={{
                    width: '100%', fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1.35rem',
                    padding: '0.8em',
                    background: '#f5f0e8', color: '#1a1a1a',
                    border: '2.5px solid #f5f0e8',
                    boxShadow: '5px 5px 0 rgba(245,240,232,0.2)',
                    cursor: 'pointer', borderRadius: 2,
                    letterSpacing: '0.03em',
                  }}
                >
                  ⊙ start shooting
                </button>
              )}
              {captureState === 'countdown' && (
                <div style={{ textAlign: 'center', fontFamily: 'Caveat, cursive', color: '#f5f0e8', fontSize: '1.15rem', opacity: 0.7, padding: '0.8em' }}>
                  {photoCount < totalShots ? '✦ smile!' : 'processing...'}
                </div>
              )}
              {captureState === 'done' && (
                <div style={{ textAlign: 'center', fontFamily: 'Special Elite, serif', color: '#f5f0e8', fontSize: '1.1rem', padding: '0.8em' }}>
                  loading editor...
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail strip — right side on desktop */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 140 }}>
            <div style={{ fontFamily: 'Caveat, cursive', fontSize: '0.9rem', color: 'rgba(245,240,232,0.4)', marginBottom: 4 }}>
              shots taken
            </div>
            {Array.from({ length: totalShots }).map((_, i) => (
              <div key={i} style={{
                width: 140, height: 105,
                border: i < photoCount ? '2px solid rgba(245,240,232,0.5)' : '2px dashed rgba(245,240,232,0.15)',
                background: i < photoCount ? 'transparent' : 'rgba(245,240,232,0.04)',
                overflow: 'hidden', position: 'relative', borderRadius: 2,
                transition: 'all 0.3s',
              }}>
                {photos[i] ? (
                  <img src={photos[i]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`shot ${i+1}`}/>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'Caveat, cursive', fontSize: '0.85rem', color: 'rgba(245,240,232,0.2)' }}>
                    #{i + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}