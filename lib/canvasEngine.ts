
export const STRIP_WIDTH = 400
export const PHOTO_WIDTH = 400
export const PHOTO_HEIGHT = 300
export const STRIP_PADDING = 20
export const PHOTO_GAP = 12
export const FOOTER_HEIGHT = 60

export function getStripHeight(): number {
  return (
    STRIP_PADDING * 2 +
    PHOTO_HEIGHT * 4 +
    PHOTO_GAP * 3 +
    FOOTER_HEIGHT
  )
}

export type FrameStyle = 'classic' | 'polaroid' | 'zine'

interface DrawStripOptions {
  photos: string[]        // data URLs
  filterType: 'bw' | 'color'
  frameStyle: FrameStyle
  brandText: string       // watermark e.g. "doodlebooth.app"
  qrDataUrl?: string      // optional QR code data URL
  caption?: string
}

// Draw all 4 photos onto a canvas and return the canvas element
export async function drawPhotoStrip(
  options: DrawStripOptions
): Promise<HTMLCanvasElement> {
  const { photos, filterType, frameStyle, brandText, qrDataUrl, caption } = options

  const canvas = document.createElement('canvas')
  const stripHeight = getStripHeight()
  canvas.width = STRIP_WIDTH
  canvas.height = stripHeight

  const ctx = canvas.getContext('2d')!

  // Background
  if (frameStyle === 'polaroid') {
    ctx.fillStyle = '#ffffff'
  } else if (frameStyle === 'zine') {
    ctx.fillStyle = '#1a1a1a'
  } else {
    ctx.fillStyle = filterType === 'bw' ? '#f0ede5' : '#fdf8f0'
  }
  ctx.fillRect(0, 0, STRIP_WIDTH, stripHeight)

  // Draw rough frame lines (doodle aesthetic)
  drawRoughFrame(ctx, STRIP_WIDTH, stripHeight, frameStyle)

  // Load and draw each photo
  for (let i = 0; i < 4; i++) {
    const img = await loadImage(photos[i])
    const y = STRIP_PADDING + i * (PHOTO_HEIGHT + PHOTO_GAP)
    const x = STRIP_PADDING

    const drawW = STRIP_WIDTH - STRIP_PADDING * 2
    const drawH = PHOTO_HEIGHT

    // Photo frame inset
    if (frameStyle === 'polaroid') {
      ctx.fillStyle = '#fff'
      ctx.fillRect(x - 4, y - 4, drawW + 8, drawH + 24)
      ctx.strokeStyle = '#ddd'
      ctx.lineWidth = 1
      ctx.strokeRect(x - 4, y - 4, drawW + 8, drawH + 24)
    }

    // Apply B&W filter by drawing to a temp canvas
    if (filterType === 'bw') {
      const tmp = document.createElement('canvas')
      tmp.width = drawW
      tmp.height = drawH
      const tctx = tmp.getContext('2d')!
      tctx.drawImage(img, 0, 0, drawW, drawH)
      // Greyscale via imageData
      const imageData = tctx.getImageData(0, 0, drawW, drawH)
      const d = imageData.data
      for (let p = 0; p < d.length; p += 4) {
        const gray = d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114
        d[p] = d[p + 1] = d[p + 2] = gray
      }
      tctx.putImageData(imageData, 0, 0)
      ctx.drawImage(tmp, x, y, drawW, drawH)
    } else {
      ctx.drawImage(img, x, y, drawW, drawH)
    }

    // Scratch overlay
    if (filterType === 'bw') {
      addGrainOverlay(ctx, x, y, drawW, drawH)
    }

    // Photo number (tiny)
    ctx.font = `bold 11px 'Special Elite', serif`
    ctx.fillStyle = frameStyle === 'zine' ? '#666' : 'rgba(0,0,0,0.25)'
    ctx.fillText(`#${i + 1}`, x + 4, y + drawH - 4)
  }

  // Footer strip
  const footerY = stripHeight - FOOTER_HEIGHT
  drawFooter(ctx, footerY, brandText, caption, qrDataUrl, frameStyle, filterType)

  return canvas
}

function drawRoughFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: FrameStyle
) {
  ctx.save()
  if (style === 'zine') {
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    drawWobblyRect(ctx, 4, 4, w - 8, h - 8)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.setLineDash([8, 6])
    drawWobblyRect(ctx, 10, 10, w - 20, h - 20)
    ctx.setLineDash([])
  } else if (style === 'polaroid') {
    ctx.strokeStyle = '#e0ddd8'
    ctx.lineWidth = 1.5
    ctx.strokeRect(2, 2, w - 4, h - 4)
  } else {
    // Classic: double rough border
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2.5
    drawWobblyRect(ctx, 5, 5, w - 10, h - 10)
    ctx.lineWidth = 1
    ctx.setLineDash([6, 4])
    drawWobblyRect(ctx, 10, 10, w - 20, h - 20)
    ctx.setLineDash([])
  }
  ctx.restore()
}

function drawWobblyRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number
) {
  const wobble = 1.5
  ctx.beginPath()
  ctx.moveTo(x + wobble, y)
  ctx.lineTo(x + w - wobble, y + wobble * 0.5)
  ctx.lineTo(x + w + wobble * 0.3, y + h - wobble)
  ctx.lineTo(x + wobble * 0.5, y + h + wobble * 0.2)
  ctx.closePath()
  ctx.stroke()
}

function addGrainOverlay(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number
) {
  // Subtle film grain
  const imageData = ctx.getImageData(x, y, w, h)
  const d = imageData.data
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18
    d[i] = clamp(d[i] + noise)
    d[i + 1] = clamp(d[i + 1] + noise)
    d[i + 2] = clamp(d[i + 2] + noise)
  }
  ctx.putImageData(imageData, x, y)
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, v))
}

async function drawFooter(
  ctx: CanvasRenderingContext2D,
  y: number,
  brandText: string,
  caption: string | undefined,
  qrDataUrl: string | undefined,
  frameStyle: FrameStyle,
  filterType: 'bw' | 'color'
) {
  const ink = frameStyle === 'zine' ? '#ffffff' : '#1a1a1a'

  // Divider
  ctx.save()
  ctx.strokeStyle = ink
  ctx.globalAlpha = 0.2
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(STRIP_PADDING, y + 8)
  ctx.lineTo(STRIP_WIDTH - STRIP_PADDING, y + 8)
  ctx.stroke()
  ctx.restore()

  // Brand watermark
  ctx.font = `700 13px 'Special Elite', serif`
  ctx.fillStyle = ink
  ctx.globalAlpha = 0.55
  ctx.fillText(`✦ ${brandText}`, STRIP_PADDING, y + 30)
  ctx.globalAlpha = 1

  // Caption
  if (caption) {
    ctx.font = `italic 12px 'Caveat', cursive`
    ctx.fillStyle = ink
    ctx.globalAlpha = 0.75
    const maxW = STRIP_WIDTH - STRIP_PADDING * 2 - 50
    ctx.fillText(caption.slice(0, 40), STRIP_PADDING, y + 48)
    ctx.globalAlpha = 1
  }

  // QR code (tiny, bottom-right)
  if (qrDataUrl) {
    const qrImg = await loadImage(qrDataUrl)
    const qrSize = 44
    ctx.drawImage(qrImg, STRIP_WIDTH - STRIP_PADDING - qrSize, y + 8, qrSize, qrSize)
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
    img.crossOrigin = 'anonymous'
  })
}

// Merge two canvas layers (photo strip + doodle overlay)
export function mergeCanvases(
  baseCanvas: HTMLCanvasElement,
  doodleCanvas: HTMLCanvasElement
): string {
  const merged = document.createElement('canvas')
  merged.width = baseCanvas.width
  merged.height = baseCanvas.height
  const ctx = merged.getContext('2d')!
  ctx.drawImage(baseCanvas, 0, 0)
  ctx.drawImage(doodleCanvas, 0, 0)
  return merged.toDataURL('image/jpeg', 0.92)
}
