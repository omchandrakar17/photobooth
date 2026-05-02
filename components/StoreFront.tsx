'use client'

import { useState } from 'react'

export default function StoreFront({ onEnter }: { onEnter: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden', background: '#f5f0e8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      {/* Doodle background */}
      <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="bgDoodle" x="0" y="0" width="260" height="260" patternUnits="userSpaceOnUse">
            <path d="M30 14 L33 26 L45 26 L36 33 L39 45 L30 38 L21 45 L24 33 L15 26 L27 26 Z" fill="none" stroke="#1a1a1a" strokeWidth="1.4" opacity="0.08"/>
            <path d="M200 30 C200 30 190 20 190 13 C190 8 193 5 197 5 C199 5 200 7 200 7 C200 7 200 5 203 5 C207 5 210 8 210 13 C210 20 200 30 200 30Z" fill="none" stroke="#1a1a1a" strokeWidth="1.4" opacity="0.08"/>
            <path d="M10 90 Q24 76 38 90 Q52 104 66 90 Q80 76 94 90" fill="none" stroke="#1a1a1a" strokeWidth="1.4" opacity="0.07"/>
            <rect x="155" y="90" width="40" height="28" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="1.4" opacity="0.08"/>
            <circle cx="175" cy="104" r="9" fill="none" stroke="#1a1a1a" strokeWidth="1.4" opacity="0.08"/>
            <path d="M163 90 L165 84 L185 84 L187 90" fill="none" stroke="#1a1a1a" strokeWidth="1.4" opacity="0.08"/>
            <rect x="10" y="155" width="65" height="40" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.07"/>
            <rect x="14" y="160" width="14" height="10" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1" opacity="0.07"/>
            <rect x="32" y="160" width="14" height="10" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1" opacity="0.07"/>
            <rect x="50" y="160" width="14" height="10" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1" opacity="0.07"/>
            <circle cx="195" cy="170" r="7" fill="none" stroke="#1a1a1a" strokeWidth="1.4" opacity="0.08"/>
            <circle cx="191" cy="180" r="7" fill="none" stroke="#1a1a1a" strokeWidth="1.4" opacity="0.08"/>
            <path d="M199 173 L224 155" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" opacity="0.08"/>
            <path d="M194 179 L224 163" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" opacity="0.08"/>
            <path d="M115 25 L117 35 L127 37 L117 39 L115 49 L113 39 L103 37 L113 35 Z" fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.08"/>
            <path d="M95 185 Q110 170 125 185" fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" opacity="0.07"/>
            <path d="M119 178 L125 185 L118 191" fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.07"/>
            <rect x="148" y="200" width="55" height="50" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.07"/>
            <rect x="152" y="204" width="47" height="34" fill="none" stroke="#1a1a1a" strokeWidth="1" opacity="0.07"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgDoodle)"/>
      </svg>

      {/* Main booth + content in a row on desktop */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 60, maxWidth: 960, width: '100%' }}>

        {/* Booth SVG */}
        <div style={{ width: '100%', maxWidth: 380, flexShrink: 0 }}>
          <svg viewBox="0 0 360 400" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: 'auto', filter: 'drop-shadow(6px 8px 0 rgba(0,0,0,0.09))' }}>
            <rect x="30" y="80" width="300" height="300" rx="4" fill="#f5f0e8" stroke="#1a1a1a" strokeWidth="3"/>
            <path d="M15 80 L345 80 L328 44 L32 44 Z" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round"/>
            {[60,100,140,180,220,260,300].map((x, i) => (
              <path key={i} d={`M${x} 44 L${x - 14} 80`} stroke="#f5f0e8" strokeWidth="3" strokeLinecap="round" opacity="0.35"/>
            ))}
            <rect x="52" y="90" width="256" height="48" rx="3" fill="#1a1a1a"/>
            <text x="180" y="122" textAnchor="middle" fontFamily="Special Elite, serif" fontSize="22" fill="#f5f0e8" letterSpacing="1">photo booth</text>
            <rect x="95" y="152" width="170" height="120" rx="3" fill="#d0ccc0" stroke="#1a1a1a" strokeWidth="2.5"/>
            <circle cx="180" cy="212" r="42" fill="#888" stroke="#1a1a1a" strokeWidth="2.5"/>
            <circle cx="180" cy="212" r="30" fill="#444" stroke="#1a1a1a" strokeWidth="1.5"/>
            <circle cx="180" cy="212" r="17" fill="#222"/>
            <circle cx="169" cy="201" r="6" fill="white" opacity="0.25"/>
            <rect x="52" y="152" width="32" height="120" fill="#1a1a1a" rx="2"/>
            <rect x="276" y="152" width="32" height="120" fill="#1a1a1a" rx="2"/>
            {[0,1,2,3,4].map(i => (
              <g key={i}>
                <rect x="57" y={160 + i*23} width="22" height="14" rx="2" fill="#f5f0e8"/>
                <rect x="281" y={160 + i*23} width="22" height="14" rx="2" fill="#f5f0e8"/>
              </g>
            ))}
            <rect x="52" y="285" width="256" height="82" rx="2" fill="white" stroke="#1a1a1a" strokeWidth="2"/>
            {[0,1,2,3].map(i => (
              <rect key={i} x={62 + i*62} y="294" width="50" height="64" rx="1" fill="#e8e4de" stroke="#ccc" strokeWidth="1"/>
            ))}
            <text x="22" y="56" fontSize="16" fill="#1a1a1a" opacity="0.4">✦</text>
            <text x="328" y="52" fontSize="12" fill="#1a1a1a" opacity="0.35">✦</text>
            <path d="M30 364 Q45 356 60 364 Q75 372 90 364 Q105 356 120 364 Q135 372 150 364 Q165 356 180 364 Q195 372 210 364 Q225 356 240 364 Q255 372 270 364 Q285 356 300 364 Q315 372 330 364"
              stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Text + button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, maxWidth: 400 }}>
          <h1 style={{ fontFamily: 'Special Elite, serif', fontSize: 'clamp(2.6rem, 6vw, 4rem)', letterSpacing: '0.04em', lineHeight: 1.05, margin: 0 }}>
            photo<br/>booth
          </h1>
          <p style={{ fontFamily: 'Caveat, cursive', fontSize: '1.3rem', opacity: 0.55, margin: 0 }}>
            4 snaps · doodle · share forever ✦
          </p>

          <div style={{ fontFamily: 'Caveat, cursive', fontSize: '1rem', opacity: 0.5, lineHeight: 1.7, marginTop: 4 }}>
            <div>📸 webcam or upload your photos</div>
            <div>✏ draw doodles & add stickers</div>
            <div>✦ ai caption + instant share link</div>
            <div>↓ download as PNG or print</div>
          </div>

          <button
            onClick={onEnter}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              marginTop: 8,
              fontFamily: 'Caveat, cursive', fontWeight: 700,
              fontSize: '1.4rem', padding: '0.7em 3em', letterSpacing: '0.08em',
              background: '#1a1a1a', color: '#f5f0e8',
              border: '2.5px solid #1a1a1a', borderRadius: 2, cursor: 'pointer',
              transform: hovered ? 'translate(-2px, -2px)' : 'none',
              boxShadow: hovered ? '6px 6px 0 rgba(0,0,0,0.2)' : '3px 3px 0 rgba(0,0,0,0.2)',
              transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            enter booth →
          </button>

          <p style={{ fontFamily: 'Caveat, cursive', fontSize: '0.88rem', opacity: 0.3, margin: 0 }}>
            free · no account needed · works on mobile too
          </p>
        </div>
      </div>
    </div>
  )
}