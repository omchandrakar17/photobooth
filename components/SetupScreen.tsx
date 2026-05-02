'use client'

import { FrameStyle } from '@/lib/canvasEngine'

export type { FrameStyle }

interface SetupScreenProps {
  filterType: 'bw' | 'color'
  frameStyle: FrameStyle
  onFilterChange: (f: 'bw' | 'color') => void
  onFrameChange: (f: FrameStyle) => void
  onStart: () => void
  onBack: () => void
}

const FRAME_OPTIONS: { id: FrameStyle; label: string; desc: string; icon: string }[] = [
  { id: 'classic', label: 'classic', desc: 'rough ink border', icon: '▣' },
  { id: 'polaroid', label: 'polaroid', desc: 'white frame + gap', icon: '⬜' },
  { id: 'zine',    label: 'zine',    desc: 'dark bg + white ink', icon: '◼' },
]


const DoodleBg = () => (
  <svg
    style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="setupBg" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
        {/* Camera */}
        <rect x="12" y="8" width="36" height="26" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.1"/>
        <circle cx="30" cy="21" r="8" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.1"/>
        <path d="M20 8 L22 3 L38 3 L40 8" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.1"/>
        <rect x="40" y="12" width="5" height="4" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1" opacity="0.1"/>

        {/* Squiggle / wave */}
        <path d="M68 18 Q76 10 84 18 Q92 26 100 18" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.09"/>

        {/* Scissors */}
        <circle cx="120" cy="10" r="5" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.1"/>
        <circle cx="116" cy="18" r="5" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.1"/>
        <path d="M123 12 L145 2"  stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round" opacity="0.1"/>
        <path d="M119 20 L145 8"  stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round" opacity="0.1"/>

        {/* Heart */}
        <path d="M170 14 C170 14 162 6 162 1 C162 -3 165 -5 168 -5 C170 -5 170 -3 170 -3 C170 -3 170 -5 172 -5 C175 -5 178 -3 178 1 C178 6 170 14 170 14Z"
          fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.1"/>

        {/* Film strip */}
        <rect x="5" y="95" width="55" height="34" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.09"/>
        <rect x="9"  y="100" width="13" height="9" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1" opacity="0.09"/>
        <rect x="26" y="100" width="13" height="9" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1" opacity="0.09"/>
        <rect x="43" y="100" width="13" height="9" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1" opacity="0.09"/>

        {/* Curved arrow */}
        <path d="M75 100 Q82 90 92 100" fill="none" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round" opacity="0.09"/>
        <path d="M87 94 L92 100 L86 105" fill="none" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.09"/>

        {/* Star */}
        <path d="M118 90 L120 99 L130 101 L120 103 L118 112 L116 103 L106 101 L116 99 Z"
          fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.09"/>

        {/* Plus / sparkle small */}
        <path d="M155 95 L155 107 M149 101 L161 101" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" opacity="0.08"/>

        {/* 5-point star outline */}
        <path d="M10 155 L12 163 L20 165 L12 167 L10 175 L8 167 L0 165 L8 163 Z"
          fill="none" stroke="#1a1a1a" strokeWidth="1.1" opacity="0.09"/>

        {/* Camera small */}
        <rect x="112" y="155" width="28" height="20" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.09"/>
        <circle cx="126" cy="165" r="6" fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.09"/>
        <path d="M117 155 L119 151 L133 151 L135 155" fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.09"/>

        {/* Wavy line bottom */}
        <path d="M150 165 Q158 157 166 165 Q174 173 182 165 Q190 157 198 165"
          fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.08"/>

        {/* Scissors small bottom */}
        <circle cx="50" cy="170" r="4" fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.09"/>
        <circle cx="47" cy="177" r="4" fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.09"/>
        <path d="M53 172 L70 162" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" opacity="0.09"/>
        <path d="M49 178 L70 168" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" opacity="0.09"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#setupBg)"/>
  </svg>
)

export default function SetupScreen({ filterType, frameStyle, onFilterChange, onFrameChange, onStart, onBack }: SetupScreenProps) {
  return (
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden', background: '#f5f0e8' }}>
      <DoodleBg />

      {/* Desktop two-column layout */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Top nav */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 40px', borderBottom: '2px solid rgba(26,26,26,0.1)' }}>
          <button onClick={onBack} style={{ fontFamily: 'Caveat, cursive', fontSize: '1.05rem', opacity: 0.55, background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a' }}>
            ← back
          </button>
          <h2 style={{ fontFamily: 'Special Elite, serif', fontSize: '1.4rem', letterSpacing: '0.05em', flex: 1, textAlign: 'center', margin: 0 }}>
            setup your shoot
          </h2>
          <div style={{ width: 60 }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 60, maxWidth: 900, width: '100%', alignItems: 'flex-start', justifyContent: 'center' }}>

            {/* LEFT column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28, minWidth: 300, flex: '1 1 300px', maxWidth: 380 }}>

              {/* Filter toggle */}
              <div>
                <label style={{ fontFamily: 'Caveat, cursive', fontSize: '1.15rem', fontWeight: 700, display: 'block', marginBottom: 12, letterSpacing: '0.03em' }}>
                  filter
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['bw', 'color'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => onFilterChange(f)}
                      style={{
                        flex: 1,
                        fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1.1rem',
                        padding: '0.65em 0',
                        background: filterType === f ? '#1a1a1a' : 'white',
                        color: filterType === f ? '#f5f0e8' : '#1a1a1a',
                        border: '2.5px solid #1a1a1a',
                        boxShadow: filterType === f ? '3px 3px 0 rgba(0,0,0,0.18)' : '2px 2px 0 rgba(0,0,0,0.08)',
                        cursor: 'pointer', borderRadius: 2,
                        transition: 'all 0.15s',
                      }}
                    >
                      {f === 'bw' ? '◑ black & white' : '◉ color'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame style */}
              <div>
                <label style={{ fontFamily: 'Caveat, cursive', fontSize: '1.15rem', fontWeight: 700, display: 'block', marginBottom: 12, letterSpacing: '0.03em' }}>
                  frame style
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {FRAME_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => onFrameChange(opt.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 18px',
                        background: frameStyle === opt.id ? '#1a1a1a' : 'white',
                        color: frameStyle === opt.id ? '#f5f0e8' : '#1a1a1a',
                        border: '2.5px solid #1a1a1a',
                        boxShadow: frameStyle === opt.id ? '4px 4px 0 rgba(0,0,0,0.18)' : '2px 2px 0 rgba(0,0,0,0.08)',
                        cursor: 'pointer', borderRadius: 2, textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>{opt.icon}</span>
                      <span style={{ fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1.1rem', flex: 1 }}>{opt.label}</span>
                      <span style={{ fontFamily: 'Caveat, cursive', fontSize: '0.9rem', opacity: 0.55 }}>{opt.desc}</span>
                      {frameStyle === opt.id && <span style={{ fontSize: '0.9rem' }}>✦</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 280, flex: '1 1 280px', maxWidth: 360 }}>

              {/* Tips card */}
              <div style={{
                background: 'white',
                border: '2.5px solid #1a1a1a',
                boxShadow: '5px 5px 0 rgba(0,0,0,0.1)',
                padding: '22px 24px',
                borderRadius: 2,
              }}>
                <div style={{ fontFamily: 'Special Elite, serif', fontSize: '1rem', letterSpacing: '0.05em', marginBottom: 14, opacity: 0.8 }}>
                  tips ✦
                </div>
                {[
                  ['📸', '4 photos taken automatically'],
                  ['⏱', '3 second countdown each snap'],
                  ['💡', 'good lighting = great photos'],
                  ['✏', 'doodle & add stickers after'],
                  ['↑', 'or upload your own photos'],
                ].map(([icon, text]) => (
                  <div key={text} style={{ fontFamily: 'Caveat, cursive', fontSize: '1rem', lineHeight: 1.6, display: 'flex', gap: 10, alignItems: 'flex-start', opacity: 0.7 }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Current selection preview */}
              <div style={{
                background: 'white',
                border: '2px dashed rgba(26,26,26,0.25)',
                padding: '16px 20px',
                borderRadius: 2,
              }}>
                <div style={{ fontFamily: 'Caveat, cursive', fontSize: '0.85rem', opacity: 0.45, marginBottom: 6 }}>your settings</div>
                <div style={{ fontFamily: 'Caveat, cursive', fontSize: '1rem', opacity: 0.7, lineHeight: 1.7 }}>
                  <div>filter: <strong>{filterType === 'bw' ? 'black & white' : 'color'}</strong></div>
                  <div>frame: <strong>{frameStyle}</strong></div>
                </div>
              </div>

              {/* Start button */}
              <button
                onClick={onStart}
                style={{
                  width: '100%',
                  fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1.35rem',
                  padding: '0.8em', letterSpacing: '0.05em',
                  background: '#1a1a1a', color: '#f5f0e8',
                  border: '2.5px solid #1a1a1a',
                  boxShadow: '5px 5px 0 rgba(0,0,0,0.2)',
                  cursor: 'pointer', borderRadius: 2,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget
                  b.style.transform = 'translate(-2px,-2px)'
                  b.style.boxShadow = '7px 7px 0 rgba(0,0,0,0.2)'
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget
                  b.style.transform = 'none'
                  b.style.boxShadow = '5px 5px 0 rgba(0,0,0,0.2)'
                }}
              >
                start shooting →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}