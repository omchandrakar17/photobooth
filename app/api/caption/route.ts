import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { filterType, frameStyle } = await req.json()

  const vibe = filterType === 'bw'
    ? 'moody, cinematic, film noir, artistic'
    : 'fun, vibrant, playful, energetic'

  const prompt = `Generate ONE short punchy photo caption for a vintage photobooth strip.
Vibe: ${vibe}. Frame style: ${frameStyle || 'classic'}.
Under 8 words. No quotes in your reply. Can include 1 emoji or symbol.
Examples: feeling cinematic ✦ | main character era | caught in the act 📸 | soft life loading...
Reply with ONLY the caption text, nothing else, no explanation.`

  const apiKey = process.env.GEMINI_API_KEY

  if (apiKey) {
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 30, temperature: 1.1 },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        // Clean up any accidental quotes the model adds
        const caption = raw ? raw.replace(/^["']|["']$/g, '').trim() : null
        if (caption) {
          return NextResponse.json({ caption })
        }
      }
    } catch (err) {
      console.error('Gemini API error:', err)
    }
  }

  // Fallback captions (used when API key missing or call fails)
  const fallbacks: Record<string, string[]> = {
    bw: [
      'feeling cinematic ✦',
      'soft focus, hard feelings',
      'film grain era 🎞',
      'main character mood',
      'vintage soul ✦',
      'caught on film 📸',
    ],
    color: [
      'main character energy ✦',
      'caught in 4k 📸',
      'living in color',
      'golden hour vibes ✨',
      'core memory loading...',
      'this is the good stuff ✦',
    ],
  }

  const pool = fallbacks[filterType] || fallbacks.color
  const caption = pool[Math.floor(Math.random() * pool.length)]
  return NextResponse.json({ caption })
}