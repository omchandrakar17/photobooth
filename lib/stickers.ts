export type Sticker = {
  id: string
  label: string
  svg: string
}

export const STICKERS: Sticker[] = [
  {
    id: 'star',
    label: '⭐',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60">
      <path d="M30 5 L36 22 L54 22 L40 33 L45 51 L30 40 L15 51 L20 33 L6 22 L24 22 Z" 
        fill="none" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'heart',
    label: '♡',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60">
      <path d="M30 50 C30 50 8 35 8 20 C8 12 14 6 22 6 C26 6 30 9 30 9 C30 9 34 6 38 6 C46 6 52 12 52 20 C52 35 30 50 30 50 Z" 
        fill="none" stroke="#c0392b" stroke-width="2.5" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'cute',
    label: '✨',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 30" width="80" height="30">
      <rect x="2" y="2" width="76" height="26" rx="13" fill="none" stroke="#1a1a1a" stroke-width="2"/>
      <text x="40" y="20" text-anchor="middle" font-family="Caveat,cursive" font-size="14" font-weight="700" fill="#1a1a1a">cute!</text>
    </svg>`,
  },
  {
    id: 'omg',
    label: '😱',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 30" width="70" height="30">
      <path d="M2 15 Q2 2 35 2 Q68 2 68 15 Q68 28 55 28 L20 28 L10 36 L14 28 Q2 28 2 15Z" 
        fill="none" stroke="#1a1a1a" stroke-width="2.2" stroke-linejoin="round"/>
      <text x="35" y="20" text-anchor="middle" font-family="Caveat,cursive" font-size="13" font-weight="700" fill="#1a1a1a">omg!!</text>
    </svg>`,
  },
  {
    id: 'film',
    label: '🎞️',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" width="60" height="40">
      <rect x="2" y="8" width="56" height="24" rx="2" fill="none" stroke="#1a1a1a" stroke-width="2"/>
      <rect x="2" y="14" width="8" height="4" fill="#1a1a1a" rx="1"/>
      <rect x="2" y="22" width="8" height="4" fill="#1a1a1a" rx="1"/>
      <rect x="50" y="14" width="8" height="4" fill="#1a1a1a" rx="1"/>
      <rect x="50" y="22" width="8" height="4" fill="#1a1a1a" rx="1"/>
      <rect x="16" y="12" width="28" height="16" rx="1" fill="none" stroke="#1a1a1a" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'arrow',
    label: '↗',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
      <path d="M10 40 Q15 15 38 12" stroke="#1a1a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M28 8 L40 12 L36 24" stroke="#1a1a1a" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'sparkle',
    label: '✦',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
      <path d="M25 5 L27 23 L45 25 L27 27 L25 45 L23 27 L5 25 L23 23 Z" 
        fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'stamp_good',
    label: '👍',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 35" width="80" height="35">
      <rect x="2" y="2" width="76" height="31" rx="3" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>
      <text x="40" y="23" text-anchor="middle" font-family="Special Elite,serif" font-size="14" letter-spacing="2" fill="#1a1a1a">VIBES✓</text>
    </svg>`,
  },
]

// Convert SVG string to a data URL for canvas use
export function stickerToDataUrl(svg: string): string {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  return URL.createObjectURL(blob)
}
