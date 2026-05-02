# doodlebooth ✦

A viral, vintage-style digital photobooth with a hand-drawn doodle aesthetic.
Take 4 photos → doodle on them → download & share forever.

## Features

- 📸 Webcam capture with 3-2-1 countdown & shutter flash
- ◑ B&W / color filter toggle (live preview on camera feed)
- ✏ Free-hand doodle layer (pen, marker, eraser + colors)
- ✦ Tap-to-place stickers (hearts, stars, speech bubbles, film strips...)
- 🤖 AI-generated caption (powered by Claude)
- 3 frame styles: classic, polaroid, zine
- ↓ Download to device
- 🔗 Auto-generated shareable link (stays up forever)
- 📱 Mobile-first, works with Web Share API (Instagram, WhatsApp)
- 🌐 Dynamic OG tags so link previews show the actual photo strip
- 🎊 Confetti animation on completion
- 💧 Watermark on every strip for organic growth

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=photobooth_unsigned
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ANTHROPIC_API_KEY=your_key  # for AI captions (optional)
```

### 3. Cloudinary setup

1. Create a free account at cloudinary.com
2. Go to Settings → Upload → Upload Presets
3. Create an **unsigned** preset named `photobooth_unsigned`
4. Set folder to `doodlebooth`

### 4. Supabase setup

1. Create a free project at supabase.com
2. Go to SQL Editor and run `supabase/migration.sql`
3. Copy your project URL and anon key to `.env.local`

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

```bash
npx vercel --prod
```

Add all env vars in Vercel dashboard under Project Settings → Environment Variables.

---

## Project Structure

```
app/
  page.tsx                    # Home (mounts PhotoboothManager)
  layout.tsx                  # Root layout + default OG tags
  globals.css                 # Paper texture, doodle styles, animations
  api/
    caption/route.ts          # Claude API for AI captions
  strip/[id]/
    page.tsx                  # Share page (server, dynamic OG)
    SharePageClient.tsx       # Share page UI

components/
  PhotoboothManager.tsx       # Root state machine (step + photos + filter)
  StoreFront.tsx              # Landing page with booth SVG illustration
  SetupScreen.tsx             # Filter + frame style picker
  CaptureScreen.tsx           # Webcam + countdown + flash sequence
  EditorScreen.tsx            # Canvas doodle layer + stickers + caption
  FinalScreen.tsx             # Download + share + confetti

lib/
  canvasEngine.ts             # Photo stitching, filters, frame styles, watermark
  stickers.ts                 # SVG sticker definitions
  cloudinary.ts               # Unsigned upload utility
  supabase.ts                 # DB client + save/get photostrip

supabase/
  migration.sql               # Create table + RLS policies
```

---

## Virality mechanics built-in

- **Watermark** on every strip: `doodlebooth.app` (edit in `canvasEngine.ts`)
- **Dynamic OG image** = the actual photo strip appears when link is shared
- **Web Share API**: on mobile, opens native iOS/Android share sheet instantly
- **No account required**: zero friction, anyone can use it
- **Auto URL update**: URL changes to `/strip/[uuid]` after upload automatically
- **AI caption**: personalizes each strip, makes it shareable-worthy

---

## Customization

- **Brand watermark**: edit `brandText` in `EditorScreen.tsx`
- **Colors**: edit CSS vars in `globals.css`
- **Frame styles**: add new ones in `canvasEngine.ts`
- **Stickers**: add SVGs to `lib/stickers.ts`
- **Strip dimensions**: adjust constants at top of `canvasEngine.ts`
