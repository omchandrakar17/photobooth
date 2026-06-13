// Canvas engine: stitch 4 photos into a vertical strip

export const STRIP_WIDTH = 400
export const PHOTO_WIDTH = 400
export const PHOTO_HEIGHT = 300
export const STRIP_PADDING = 20
export const PHOTO_GAP = 12
export const FOOTER_HEIGHT = 60

export function getStripHeight(): number {
  return STRIP_PADDING * 2 + PHOTO_HEIGHT * 4 + PHOTO_GAP * 3 + FOOTER_HEIGHT
}

export type FrameStyle = 'classic' | 'polaroid' | 'zine'

export interface AdjustedPhoto {
  src: string
  x: number
  y: number
  scale: number
  naturalW: number
  naturalH: number
}

interface DrawStripOptions {
  photos: string[]
  adjustedPhotos?: AdjustedPhoto[]
  filterType: 'bw' | 'color'
  frameStyle: FrameStyle
  brandText: string
  caption?: string
}

const FRAME_W = 400
const FRAME_H = 300

export async function drawPhotoStrip(options: DrawStripOptions): Promise<HTMLCanvasElement> {
  const { photos, adjustedPhotos, filterType, frameStyle, brandText, caption } = options

  const canvas = document.createElement('canvas')
  const stripHeight = getStripHeight()
  canvas.width = STRIP_WIDTH
  canvas.height = stripHeight

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Background
  if (frameStyle === 'zine') ctx.fillStyle = '#1a1a1a'
  else if (frameStyle === 'polaroid') ctx.fillStyle = '#ffffff'
  else ctx.fillStyle = filterType === 'bw' ? '#f0ede5' : '#fdf8f0'
  ctx.fillRect(0, 0, STRIP_WIDTH, stripHeight)

  drawRoughFrame(ctx, STRIP_WIDTH, stripHeight, frameStyle)

  for (let i = 0; i < 4; i++) {
    const drawX = STRIP_PADDING
    const drawY = STRIP_PADDING + i * (PHOTO_HEIGHT + PHOTO_GAP)
    const drawW = STRIP_WIDTH - STRIP_PADDING * 2
    const drawH = PHOTO_HEIGHT

    // Polaroid white frame
    if (frameStyle === 'polaroid') {
      ctx.fillStyle = '#fff'
      ctx.fillRect(drawX - 4, drawY - 4, drawW + 8, drawH + 24)
      ctx.strokeStyle = '#ddd'
      ctx.lineWidth = 1
      ctx.strokeRect(drawX - 4, drawY - 4, drawW + 8, drawH + 24)
    }

    // Clip to photo cell
    ctx.save()
    ctx.beginPath()
    ctx.rect(drawX, drawY, drawW, drawH)
    ctx.clip()

    const adj = adjustedPhotos?.[i]

    if (adj) {
      // User-adjusted: use their pan/zoom exactly
      // adj.x, adj.y, adj.scale are in FRAME_W=400 / FRAME_H=300 coords
      // which matches our canvas dimensions perfectly
      const img = await loadImage(adj.src)
      const imgW = adj.naturalW * adj.scale
      const imgH = adj.naturalH * adj.scale
      const imgX = drawX + adj.x
      const imgY = drawY + adj.y

      if (filterType === 'bw') {
        const tmp = document.createElement('canvas')
        tmp.width = drawW
        tmp.height = drawH
        const tctx = tmp.getContext('2d')!
        tctx.imageSmoothingEnabled = true
        tctx.imageSmoothingQuality = 'high'
        tctx.drawImage(img, adj.x, adj.y, imgW, imgH)
        const id = tctx.getImageData(0, 0, drawW, drawH)
        const d = id.data
        for (let p = 0; p < d.length; p += 4) {
          const g = d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114
          d[p] = d[p + 1] = d[p + 2] = g
        }
        tctx.putImageData(id, 0, 0)
        ctx.drawImage(tmp, drawX, drawY)
      } else {
        ctx.drawImage(img, imgX, imgY, imgW, imgH)
      }
    } else {
      // Fallback: cover-fit (no adjustment data)
      const img = await loadImage(photos[i])
      const s = Math.max(drawW / img.naturalWidth, drawH / img.naturalHeight)
      const sx = (drawW - img.naturalWidth * s) / 2
      const sy = (drawH - img.naturalHeight * s) / 2

      if (filterType === 'bw') {
        const tmp = document.createElement('canvas')
        tmp.width = drawW
        tmp.height = drawH
        const tctx = tmp.getContext('2d')!
        tctx.imageSmoothingEnabled = true
        tctx.imageSmoothingQuality = 'high'
        tctx.drawImage(img, sx, sy, img.naturalWidth * s, img.naturalHeight * s)
        const id = tctx.getImageData(0, 0, drawW, drawH)
        const d = id.data
        for (let p = 0; p < d.length; p += 4) {
          const g = d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114
          d[p] = d[p + 1] = d[p + 2] = g
        }
        tctx.putImageData(id, 0, 0)
        ctx.drawImage(tmp, drawX, drawY)
      } else {
        ctx.drawImage(img, drawX + sx, drawY + sy, img.naturalWidth * s, img.naturalHeight * s)
      }
    }

    ctx.restore()

    // Subtle film grain for B&W
    if (filterType === 'bw') {
      addGrain(ctx, drawX, drawY, drawW, drawH, 8)
    }

    // Photo number label
    ctx.font = `bold 11px 'Special Elite', serif`
    ctx.fillStyle = frameStyle === 'zine' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)'
    ctx.fillText(`#${i + 1}`, drawX + 4, drawY + drawH - 4)
  }

  // Footer
  drawFooter(ctx, stripHeight - FOOTER_HEIGHT, brandText, caption, frameStyle)

  return canvas
}

function drawRoughFrame(ctx: CanvasRenderingContext2D, w: number, h: number, style: FrameStyle) {
  ctx.save()
  if (style === 'zine') {
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    drawWobbly(ctx, 5, 5, w - 10, h - 10)
    ctx.lineWidth = 1
    ctx.setLineDash([8, 6])
    drawWobbly(ctx, 10, 10, w - 20, h - 20)
    ctx.setLineDash([])
  } else if (style === 'polaroid') {
    ctx.strokeStyle = '#e0ddd8'
    ctx.lineWidth = 1.5
    ctx.strokeRect(2, 2, w - 4, h - 4)
  } else {
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2.5
    drawWobbly(ctx, 5, 5, w - 10, h - 10)
    ctx.lineWidth = 1
    ctx.setLineDash([6, 4])
    drawWobbly(ctx, 10, 10, w - 20, h - 20)
    ctx.setLineDash([])
  }
  ctx.restore()
}

function drawWobbly(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const j = 1.5
  ctx.beginPath()
  ctx.moveTo(x + j, y)
  ctx.lineTo(x + w - j, y + j * 0.4)
  ctx.lineTo(x + w + j * 0.3, y + h - j)
  ctx.lineTo(x + j * 0.4, y + h + j * 0.2)
  ctx.closePath()
  ctx.stroke()
}

function addGrain(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, amount: number) {
  const id = ctx.getImageData(x, y, w, h)
  const d = id.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount * 2
    d[i] = clamp(d[i] + n)
    d[i + 1] = clamp(d[i + 1] + n)
    d[i + 2] = clamp(d[i + 2] + n)
  }
  ctx.putImageData(id, x, y)
}

function clamp(v: number) { return Math.max(0, Math.min(255, v)) }

function drawFooter(
  ctx: CanvasRenderingContext2D,
  y: number,
  brand: string,
  caption: string | undefined,
  style: FrameStyle
) {
  const ink = style === 'zine' ? '#ffffff' : '#1a1a1a'

  ctx.save()
  ctx.strokeStyle = ink
  ctx.globalAlpha = 0.15
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(STRIP_PADDING, y + 8)
  ctx.lineTo(STRIP_WIDTH - STRIP_PADDING, y + 8)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.font = `700 11px 'Special Elite', serif`
  ctx.fillStyle = ink
  ctx.globalAlpha = 0.4
  ctx.fillText(`✦ ${brand}`, STRIP_PADDING, y + 28)
  ctx.globalAlpha = 1

  if (caption) {
    ctx.font = `italic 12px 'Caveat', cursive`
    ctx.fillStyle = ink
    ctx.globalAlpha = 0.65
    ctx.fillText(caption.slice(0, 42), STRIP_PADDING, y + 46)
    ctx.globalAlpha = 1
  }
  ctx.restore()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.crossOrigin = 'anonymous'
    img.src = src
  })
}