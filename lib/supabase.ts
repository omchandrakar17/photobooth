import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type PhotoStrip = {
  id: string
  created_at: string
  image_url: string
  filter_type: 'bw' | 'color'
  caption?: string
  frame_style?: string
}


export async function savePhotoStrip(
  imageUrl: string,
  filterType: 'bw' | 'color',
  caption?: string,
  frameStyle?: string
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('photostrips')
    .insert({
      image_url: imageUrl,
      filter_type: filterType,
      caption: caption || null,
      frame_style: frameStyle || 'classic',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    return null
  }
  return data
}


export async function getPhotoStrip(id: string): Promise<PhotoStrip | null> {
  const { data, error } = await supabase
    .from('photostrips')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Supabase fetch error:', error)
    return null
  }
  return data
}
