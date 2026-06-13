// Canvas engine: stitch 4 photos into a vertical strip

export const STRIP_WIDTH = 800          // HIGH RES — 2x for quality
export const PHOTO_WIDTH = 800
export const PHOTO_HEIGHT = 600
export const STRIP_PADDING = 40
export const PHOTO_GAP = 24
export const FOOTER_HEIGHT = 100

export function getStripHeight(): number {
  return STRIP_PADDING * 2 + PHOTO_HEIGHT * 4 + PHOTO_GAP * 3 + FOOTER_HEIGHT
}

export type FrameStyle = 'classic' | 'polaroid' | 'zine'

export interface AdjustedPhoto {
  src: string
  x: number       // pan offset in canvas coords (at FRAME_W=400 scale)
  y: number
  scale: number   // zoom at FRAME_W=400 scale
  naturalW: number
  naturalH: number
}

interface DrawStripOptions {
  photos: string[]           // plain data URLs (legacy, if no adjustedPhotos)
  adjustedPhotos?: AdjustedPhoto[]  // preferred — from PhotoAdjuster
  filterType: 'bw' | 'color'
  frameStyle: FrameStyle
  brandText: string
  caption?: string
}

const ADJUSTER_FRAME_W = 400
const ADJUSTER_FRAME_H = 300

export async function drawPhotoStrip(options: DrawStripOptions): Promise<HTMLCanvasElement> {
  const { photos, adjustedPhotos, filterType, frameStyle, brandText, caption } = options

  const canvas = document.createElement('canvas')
  const stripHeight = getStripHeight()
  canvas.width = STRIP_WIDTH
  canvas.height = stripHeight
  const ctx = canvas.getContext('2d', { alpha: false })!
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
      ctx.fillRect(drawX - 8, drawY - 8, drawW + 16, drawH + 36)
      ctx.strokeStyle = '#e0ddd8'
      ctx.lineWidth = 2
      ctx.strokeRect(drawX - 8, drawY - 8, drawW + 16, drawH + 36)
    }

    const adj = adjustedPhotos?.[i]

    if (adj) {
      // HIGH QUALITY: draw with user's pan/zoom scaled up to hi-res strip
      const img = await loadImage(adj.src)
      const scaleUp = STRIP_WIDTH / ADJUSTER_FRAME_W   // = 2x

      // Scale pan/zoom from adjuster coords → hi-res canvas coords
      const hiX = adj.x * scaleUp
      const hiY = adj.y * scaleUp
      const hiImgW = adj.naturalW * adj.scale * scaleUp
      const hiImgH = adj.naturalH * adj.scale * scaleUp

      // Clip to photo cell
      ctx.save()
      ctx.beginPath()
      ctx.rect(drawX, drawY, drawW, drawH)
      ctx.clip()

      if (filterType === 'bw') {
        const tmp = document.createElement('canvas')
        tmp.width = drawW; tmp.height = drawH
        const tctx = tmp.getContext('2d')!
        tctx.imageSmoothingEnabled = true
        tctx.imageSmoothingQuality = 'high'
        tctx.drawImage(img, hiX - drawX, hiY - drawY, hiImgW, hiImgH)
        const id = tctx.getImageData(0, 0, drawW, drawH)
        const d = id.data
        for (let p = 0; p < d.length; p += 4) {
          const g = d[p] * 0.299 + d[p+1] * 0.587 + d[p+2] * 0.114
          d[p] = d[p+1] = d[p+2] = g
        }
        tctx.putImageData(id, 0, 0)
        ctx.drawImage(tmp, drawX, drawY)
      } else {
        ctx.drawImage(img, drawX + hiX - drawX, drawY + hiY - drawY, hiImgW, hiImgH)
      }
      ctx.restore()

    } else {
      // Fallback: legacy cover-fit (no adjustment data)
      const img = await loadImage(photos[i])
      const s = Math.max(drawW / img.naturalWidth, drawH / img.naturalHeight)
      const sx = (drawW - img.naturalWidth * s) / 2
      const sy = (drawH - img.naturalHeight * s) / 2

      ctx.save()
      ctx.beginPath()
      ctx.rect(drawX, drawY, drawW, drawH)
      ctx.clip()

      if (filterType === 'bw') {
        const tmp = document.createElement('canvas')
        tmp.width = drawW; tmp.height = drawH
        const tctx = tmp.getContext('2d')!
        tctx.imageSmoothingEnabled = true
        tctx.imageSmoothingQuality = 'high'
        tctx.drawImage(img, sx, sy, img.naturalWidth * s, img.naturalHeight * s)
        const id = tctx.getImageData(0, 0, drawW, drawH)
        const d = id.data
        for (let p = 0; p < d.length; p += 4) {
          const g = d[p] * 0.299 + d[p+1] * 0.587 + d[p+2] * 0.114
          d[p] = d[p+1] = d[p+2] = g
        }
        tctx.putImageData(id, 0, 0)
        ctx.drawImage(tmp, drawX, drawY)
      } else {
        ctx.drawImage(img, drawX + sx, drawY + sy, img.naturalWidth * s, img.naturalHeight * s)
      }
      ctx.restore()
    }

    // Photo grain for B&W
    if (filterType === 'bw') addGrain(ctx, drawX, drawY, drawW, drawH, 10)

    // Photo number
    ctx.font = `bold 18px 'Special Elite', serif`
    ctx.fillStyle = frameStyle === 'zine' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.18)'
    ctx.fillText(`#${i + 1}`, drawX + 8, drawY + drawH - 8)
  }

  // Footer
  drawFooter(ctx, stripHeight - FOOTER_HEIGHT, brandText, caption, frameStyle, filterType)

  return canvas
}

function drawRoughFrame(ctx: CanvasRenderingContext2D, w: number, h: number, style: FrameStyle) {
  ctx.save()
  if (style === 'zine') {
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 5
    drawWobbly(ctx, 8, 8, w - 16, h - 16)
    ctx.lineWidth = 2
    ctx.setLineDash([14, 10])
    drawWobbly(ctx, 18, 18, w - 36, h - 36)
    ctx.setLineDash([])
  } else if (style === 'polaroid') {
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 2
    ctx.strokeRect(3, 3, w - 6, h - 6)
  } else {
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 4
    drawWobbly(ctx, 8, 8, w - 16, h - 16)
    ctx.lineWidth = 2
    ctx.setLineDash([10, 8])
    drawWobbly(ctx, 18, 18, w - 36, h - 36)
    ctx.setLineDash([])
  }
  ctx.restore()
}

function drawWobbly(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const j = 2.5
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
    d[i] = clamp(d[i] + n); d[i+1] = clamp(d[i+1] + n); d[i+2] = clamp(d[i+2] + n)
  }
  ctx.putImageData(id, x, y)
}

function clamp(v: number) { return Math.max(0, Math.min(255, v)) }

function drawFooter(ctx: CanvasRenderingContext2D, y: number, brand: string, caption: string | undefined, style: FrameStyle, filter: 'bw' | 'color') {
  const ink = style === 'zine' ? '#ffffff' : '#1a1a1a'
  ctx.save()
  ctx.strokeStyle = ink; ctx.globalAlpha = 0.15; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(STRIP_PADDING, y + 14); ctx.lineTo(STRIP_WIDTH - STRIP_PADDING, y + 14); ctx.stroke()
  ctx.globalAlpha = 1

  ctx.font = `700 22px 'Special Elite', serif`
  ctx.fillStyle = ink; ctx.globalAlpha = 0.4
  ctx.fillText(`✦ ${brand}`, STRIP_PADDING, y + 52)
  ctx.globalAlpha = 1

  if (caption) {
    ctx.font = `italic 20px 'Caveat', cursive`
    ctx.fillStyle = ink; ctx.globalAlpha = 0.65
    ctx.fillText(caption.slice(0, 50), STRIP_PADDING, y + 80)
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

// Merge base + doodle canvas into final high-quality PNG base64
export function mergeCanvases(base: HTMLCanvasElement, doodle: HTMLCanvasElement): string {
  const out = document.createElement('canvas')
  out.width = base.width; out.height = base.height
  const ctx = out.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(base, 0, 0)
  // Scale doodle up to match hi-res canvas
  ctx.drawImage(doodle, 0, 0, out.width, out.height)
  return out.toDataURL('image/png')    // PNG — lossless, best quality
}