'use client'

import Link from 'next/link'
import { PhotoStrip } from '@/lib/supabase'

interface Props {
  strip: PhotoStrip | null
  id: string
}

export default function SharePageClient({ strip, id }: Props) {
  if (!strip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center">
        <h1 style={{ fontFamily: 'Special Elite, serif', fontSize: '2rem' }}>strip not found ✦</h1>
        <p style={{ fontFamily: 'Caveat, cursive', fontSize: '1.1rem', opacity: 0.6, margin: '16px 0' }}>
          this strip may have expired or the link is wrong
        </p>
        <Link href="/" className="btn-sketch" style={{ textDecoration: 'none', display: 'inline-block', marginTop: 8 }}>
          make your own →
        </Link>
      </div>
    )
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = strip.image_url
    a.download = `doodlebooth-${id}.jpg`
    a.target = '_blank'
    a.click()
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: strip.caption ? `"${strip.caption}" — doodlebooth` : 'my doodlebooth strip',
        url: window.location.href,
      })
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-5 py-8 max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center mb-5">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ fontFamily: 'Special Elite, serif', fontSize: '1.6rem', letterSpacing: '0.05em' }}>
            doodlebooth ✦
          </h1>
        </Link>
        {strip.caption && (
          <p style={{
            fontFamily: 'Caveat, cursive',
            fontSize: '1.1rem',
            fontStyle: 'italic',
            opacity: 0.65,
            marginTop: 4,
          }}>
            "{strip.caption}"
          </p>
        )}
      </div>

      {/* Strip */}
      <div
        className="strip-preview mb-5"
        style={{ width: '100%', maxWidth: 280, overflow: 'hidden', position: 'relative' }}
      >
        <img
          src={strip.image_url}
          alt="photo strip"
          style={{ width: '100%', display: 'block' }}
        />
        <div className="tape" style={{ top: -6, left: '20%', transform: 'rotate(-8deg)' }} />
        <div className="tape" style={{ top: -6, right: '20%', transform: 'rotate(6deg)' }} />
      </div>

      {/* Date */}
      <p style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: '0.7rem',
        opacity: 0.35,
        marginBottom: 16,
        letterSpacing: '0.05em',
      }}>
        {new Date(strip.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        {' · '}{strip.filter_type === 'bw' ? 'black & white' : 'color'}
      </p>

      {/* Actions */}
      <div className="w-full flex flex-col gap-3 mb-6">
        <button onClick={handleDownload} className="btn-sketch w-full" style={{ fontSize: '1.1rem' }}>
          ↓ download
        </button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button onClick={handleShare} className="btn-sketch outline w-full" style={{ fontSize: '1.1rem' }}>
            ↗ share
          </button>
        )}
      </div>

      {/* CTA */}
      <div
        className="w-full text-center p-5"
        style={{
          border: '2.5px solid #1a1a1a',
          boxShadow: '4px 4px 0 #1a1a1a',
          background: '#1a1a1a',
          color: '#f5f0e8',
        }}
      >
        <p style={{ fontFamily: 'Caveat, cursive', fontSize: '1.1rem', marginBottom: 12, opacity: 0.85 }}>
          want your own strip?
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            fontFamily: 'Caveat, cursive',
            fontWeight: 700,
            fontSize: '1.1rem',
            padding: '0.5em 1.5em',
            background: '#f5f0e8',
            color: '#1a1a1a',
            border: '2px solid #f5f0e8',
            boxShadow: '2px 2px 0 rgba(245,240,232,0.3)',
            textDecoration: 'none',
          }}
        >
          enter the booth →
        </Link>
      </div>
    </div>
  )
}
