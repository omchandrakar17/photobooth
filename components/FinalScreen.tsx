'use client'

import { useEffect, useRef, useState } from 'react'

interface FinalScreenProps {
  finalImageUrl: string
  shareId: string | null
  shareUrl: string | null
  caption: string | null
  filterType: 'bw' | 'color'
  onRestart: () => void
}

export default function FinalScreen({ finalImageUrl, shareId, shareUrl, caption, filterType, onRestart }: FinalScreenProps) {
  const confettiRef = useRef<boolean>(false)
  const [copied, setCopied] = useState(false)

  const shareLink = shareId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/strip/${shareId}`
    : null

  useEffect(() => {
    if (confettiRef.current) return
    confettiRef.current = true
    import('canvas-confetti').then(({ default: confetti }) => {
      const colors = filterType === 'bw' ? ['#1a1a1a', '#f5f0e8', '#888'] : ['#c0392b', '#f39c12', '#2980b9', '#27ae60', '#8e44ad']
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors })
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.65 }, colors })
        confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.65 }, colors })
      }, 300)
    })
  }, [filterType])

  useEffect(() => {
    if (shareId && typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/strip/${shareId}`)
    }
  }, [shareId])

  const handleDownloadPNG = () => {
    // Try canvas conversion first for true PNG
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `photobooth-strip-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    img.onerror = () => {
      // Fallback: direct anchor download from base64
      const link = document.createElement('a')
      link.href = finalImageUrl
      link.download = `photobooth-strip-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    img.src = finalImageUrl // use local base64, not cloudinary (avoids CORS)
  }

  const handlePrint = () => {
    const pw = window.open('', '_blank')
    if (!pw) return
    pw.document.write(`<!DOCTYPE html><html><head><title>photo strip</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{display:flex;justify-content:center;background:white;padding:20px}
      img{max-width:320px;height:auto;display:block}
      @media print{body{padding:0}img{max-width:100%}}
    </style></head><body>
      <img src="${finalImageUrl}" onload="window.print();setTimeout(()=>window.close(),500)"/>
    </body></html>`)
    pw.document.close()
  }

  const handleShare = async () => {
    const link = shareLink || window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: 'my photo booth strip ✦', text: caption ? `"${caption}"` : 'check out my photo strip!', url: link }) }
      catch {}
    } else handleCopyLink()
  }

  const handleCopyLink = async () => {
    const link = shareLink || window.location.href
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    catch {}
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative', background: '#f5f0e8', overflow: 'hidden' }}>

      {/* Doodle background */}
      <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.055 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="finalBg" x="0" y="0" width="240" height="240" patternUnits="userSpaceOnUse">
            <path d="M30 12 L33 24 L45 24 L36 31 L39 43 L30 36 L21 43 L24 31 L15 24 L27 24 Z" fill="none" stroke="#1a1a1a" strokeWidth="1.5"/>
            <path d="M180 20 C180 20 170 10 170 4 C170 0 173 -2 177 -2 C179 -2 180 0 180 0 C180 0 181 -2 183 -2 C187 -2 190 0 190 4 C190 10 180 20 180 20Z" fill="none" stroke="#1a1a1a" strokeWidth="1.4"/>
            <path d="M8 90 Q22 76 36 90 Q50 104 64 90 Q78 76 92 90" fill="none" stroke="#1a1a1a" strokeWidth="1.4"/>
            <rect x="140" y="75" width="38" height="28" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="1.4"/>
            <circle cx="159" cy="89" r="8" fill="none" stroke="#1a1a1a" strokeWidth="1.4"/>
            <path d="M148 75 L150 69 L168 69 L170 75" fill="none" stroke="#1a1a1a" strokeWidth="1.4"/>
            <rect x="10" y="145" width="62" height="38" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.3"/>
            <rect x="14" y="150" width="13" height="9" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
            <rect x="31" y="150" width="13" height="9" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
            <rect x="48" y="150" width="13" height="9" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
            <circle cx="185" cy="155" r="7" fill="none" stroke="#1a1a1a" strokeWidth="1.4"/>
            <circle cx="181" cy="164" r="7" fill="none" stroke="#1a1a1a" strokeWidth="1.4"/>
            <path d="M189 158 L212 142" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M185 163 L212 150" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M108 22 L110 32 L120 34 L110 36 L108 46 L106 36 L96 34 L106 32 Z" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
            <path d="M88 175 Q103 160 118 175" fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M112 168 L118 175 L111 181" fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#finalBg)"/>
      </svg>

      {/* Two-column layout on desktop, single column on mobile */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
        alignItems: 'flex-start', justifyContent: 'center',
        gap: 64, padding: '52px 48px 64px',
        maxWidth: 1000, margin: '0 auto', width: '100%',
      }}>

        {/* LEFT: Photo strip */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {/* "your photostrip!" hand-drawn header */}
          <div style={{ width: '100%', marginBottom: 8, alignSelf: 'flex-start' }}>
            <svg viewBox="0 0 320 72" style={{ width: 320, overflow: 'visible' }}>
              <text x="10" y="40" fontFamily="Caveat, cursive" fontSize="36" fontWeight="700" fill="#1a1a1a" transform="rotate(-3, 10, 40)">
                your photostrip!
              </text>
              <path d="M16 52 Q10 67 28 70 Q42 73 36 60" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M32 57 L36 60 L33 65" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Strip with tape */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{ position: 'absolute', top: -12, left: '15%', width: 64, height: 22, background: 'rgba(255,220,100,0.55)', border: '1px solid rgba(180,150,50,0.3)', transform: 'rotate(-7deg)', zIndex: 2 }}/>
            <div style={{ position: 'absolute', top: -12, right: '15%', width: 64, height: 22, background: 'rgba(255,220,100,0.55)', border: '1px solid rgba(180,150,50,0.3)', transform: 'rotate(5deg)', zIndex: 2 }}/>
            <div style={{ background: 'white', boxShadow: '0 0 0 3px #1a1a1a, 7px 7px 0 #1a1a1a, 10px 10px 28px rgba(0,0,0,0.14)', overflow: 'hidden', width: 300 }}>
              <img src={finalImageUrl} alt="your photo strip" style={{ width: '100%', display: 'block' }}/>
            </div>
          </div>

          {caption && (
            <p style={{ fontFamily: 'Caveat, cursive', fontSize: '1.1rem', fontStyle: 'italic', opacity: 0.6, textAlign: 'center', maxWidth: 300 }}>
              "{caption}"
            </p>
          )}

          {/* Scissors cut line */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="6" cy="6" r="3" stroke="#1a1a1a" strokeWidth="1.5"/>
              <circle cx="6" cy="18" r="3" stroke="#1a1a1a" strokeWidth="1.5"/>
              <path d="M8.5 8.5 L20 3" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8.5 15.5 L20 21" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div style={{ flex: 1, borderTop: '2px dashed rgba(26,26,26,0.2)' }}/>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 280, flex: '1 1 280px', maxWidth: 360, paddingTop: 24 }}>

          {/* Download PNG */}
          <button onClick={handleDownloadPNG} style={{
            width: '100%', fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1.25rem',
            padding: '0.8em 1.2em', background: '#1a1a1a', color: '#f5f0e8',
            border: '2.5px solid #1a1a1a', boxShadow: '5px 5px 0 rgba(0,0,0,0.18)',
            cursor: 'pointer', borderRadius: 2, textAlign: 'left', letterSpacing: '0.02em',
          }}>
            ↓ download PNG
          </button>

          {/* Print */}
          <button onClick={handlePrint} style={{
            width: '100%', fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1.15rem',
            padding: '0.75em 1.2em', background: 'transparent', color: '#1a1a1a',
            border: '2.5px solid #1a1a1a', boxShadow: '4px 4px 0 rgba(0,0,0,0.12)',
            cursor: 'pointer', borderRadius: 2, textAlign: 'left',
          }}>
            ⎙ print strip
          </button>

          {/* Share + Copy row */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleShare} style={{
              flex: 1, fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1.05rem',
              padding: '0.65em', background: 'transparent', color: '#1a1a1a',
              border: '2px solid #1a1a1a', boxShadow: '3px 3px 0 rgba(0,0,0,0.1)',
              cursor: 'pointer', borderRadius: 2,
            }}>
              ↗ share
            </button>
            <button onClick={handleCopyLink} style={{
              flex: 1, fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1.05rem',
              padding: '0.65em',
              background: copied ? '#1a1a1a' : 'transparent',
              color: copied ? '#f5f0e8' : '#1a1a1a',
              border: '2px solid #1a1a1a', boxShadow: '3px 3px 0 rgba(0,0,0,0.1)',
              cursor: 'pointer', borderRadius: 2, transition: 'all 0.2s',
            }}>
              {copied ? '✓ copied!' : '⎘ copy link'}
            </button>
          </div>

          {/* Share link box */}
          {shareLink && (
            <div style={{ border: '1.5px dashed rgba(26,26,26,0.28)', padding: '10px 14px', background: 'white' }}>
              <div style={{ fontFamily: 'Caveat, cursive', fontSize: '0.78rem', opacity: 0.45, marginBottom: 3 }}>your link</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.72rem', wordBreak: 'break-all', opacity: 0.7 }}>{shareLink}</div>
            </div>
          )}

          {/* Divider scissors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <div style={{ flex: 1, borderTop: '2px dashed rgba(26,26,26,0.18)' }}/>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.25 }}>
              <circle cx="6" cy="6" r="3" stroke="#1a1a1a" strokeWidth="1.5"/>
              <circle cx="6" cy="18" r="3" stroke="#1a1a1a" strokeWidth="1.5"/>
              <path d="M8.5 8.5 L20 3" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8.5 15.5 L20 21" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div style={{ flex: 1, borderTop: '2px dashed rgba(26,26,26,0.18)' }}/>
          </div>

          <button onClick={onRestart} style={{
            fontFamily: 'Caveat, cursive', fontSize: '1.05rem', opacity: 0.45,
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0,
          }}>
            ↩ take another strip
          </button>
        </div>
      </div>
    </div>
  )
}