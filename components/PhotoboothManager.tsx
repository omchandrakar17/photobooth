'use client'

import { useState, useCallback } from 'react'
import StoreFront from './StoreFront'
import SetupScreen from './SetupScreen'
import CaptureScreen from './CaptureScreen'
import EditorScreen from './EditorScreen'
import FinalScreen from './FinalScreen'
import { FrameStyle } from '@/lib/canvasEngine'

export type Step = 'storefront' | 'setup' | 'capture' | 'editor' | 'final'
export type FilterType = 'bw' | 'color'

export interface PhotoboothState {
  step: Step
  photos: string[]          // array of 4 base64 photo data URLs
  filterType: FilterType
  frameStyle: FrameStyle
  finalImageUrl: string | null   // merged canvas + doodles
  shareId: string | null         // Supabase UUID
  shareUrl: string | null        // Cloudinary hosted URL
  caption: string | null
}

const initialState: PhotoboothState = {
  step: 'storefront',
  photos: [],
  filterType: 'bw',
  frameStyle: 'classic',
  finalImageUrl: null,
  shareId: null,
  shareUrl: null,
  caption: null,
}

export default function PhotoboothManager() {
  const [state, setState] = useState<PhotoboothState>(initialState)

  const goTo = useCallback((step: Step) => {
    setState(prev => ({ ...prev, step }))
  }, [])

  const setPhotos = useCallback((photos: string[]) => {
    setState(prev => ({ ...prev, photos, step: 'editor' }))
  }, [])

  const setFilter = useCallback((filterType: FilterType) => {
    setState(prev => ({ ...prev, filterType }))
  }, [])

  const setFrameStyle = useCallback((frameStyle: FrameStyle) => {
    setState(prev => ({ ...prev, frameStyle }))
  }, [])

  const setFinalResult = useCallback((
    finalImageUrl: string,
    shareId: string | null,
    shareUrl: string | null,
    caption: string | null
  ) => {
    setState(prev => ({
      ...prev,
      finalImageUrl,
      shareId,
      shareUrl,
      caption,
      step: 'final',
    }))
  }, [])

  const restart = useCallback(() => {
    setState(initialState)
  }, [])

  const { step, photos, filterType, frameStyle, finalImageUrl, shareId, shareUrl, caption } = state

  return (
    <main className="min-h-screen min-h-dvh flex flex-col items-center justify-center">
      {step === 'storefront' && (
        <StoreFront onEnter={() => goTo('setup')} />
      )}
      {step === 'setup' && (
        <SetupScreen
          filterType={filterType}
          frameStyle={frameStyle}
          onFilterChange={setFilter}
          onFrameChange={setFrameStyle}
          onStart={() => goTo('capture')}
          onBack={() => goTo('storefront')}
        />
      )}
      {step === 'capture' && (
        <CaptureScreen
          filterType={filterType}
          onComplete={setPhotos}
          onBack={() => goTo('setup')}
        />
      )}
      {step === 'editor' && (
        <EditorScreen
          photos={photos}
          filterType={filterType}
          frameStyle={frameStyle}
          onFinish={setFinalResult}
          onRetake={() => goTo('capture')}
        />
      )}
      {step === 'final' && (
        <FinalScreen
          finalImageUrl={finalImageUrl!}
          shareId={shareId}
          shareUrl={shareUrl}
          caption={caption}
          filterType={filterType}
          onRestart={restart}
        />
      )}
    </main>
  )
}
