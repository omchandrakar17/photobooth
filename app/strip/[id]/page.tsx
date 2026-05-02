import { Metadata } from 'next'
import { getPhotoStrip } from '@/lib/supabase'
import SharePageClient from './SharePageClient'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const strip = await getPhotoStrip(params.id)

  if (!strip) {
    return {
      title: 'doodlebooth ✦',
      description: 'Take your photo strip!',
    }
  }

  return {
    title: strip.caption
      ? `"${strip.caption}" — doodlebooth ✦`
      : 'my doodlebooth strip ✦',
    description: 'Check out my vintage photo strip on doodlebooth!',
    openGraph: {
      title: strip.caption
        ? `"${strip.caption}" — doodlebooth ✦`
        : 'my doodlebooth strip ✦',
      description: 'Take 4 photos, doodle on them, share forever.',
      images: [
        {
          url: strip.image_url,
          width: 400,
          height: 1200,
          alt: 'Photo strip',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'my doodlebooth strip ✦',
      images: [strip.image_url],
    },
  }
}

export default async function StripPage({ params }: Props) {
  const strip = await getPhotoStrip(params.id)
  return <SharePageClient strip={strip} id={params.id} />
}
