'use client'

import { useState, useCallback } from 'react'
import StoreFront from './StoreFront'
import SetupScreen from './SetupScreen'
import CaptureScreen from './CaptureScreen'
import PhotoAdjuster, { AdjustedPhoto } from './PhotoAdjuster'
import EditorScreen from './EditorScreen'
import FinalScreen from './FinalScreen'
import { FrameStyle } from '@/lib/canvasEngine'

export type Step = 'storefront' | 'setup' | 'capture' | 'adjust' | 'editor' | 'final'
export type FilterType = 'bw' | 'color'

export interface PhotoboothState {
  step: Step
  photos: string[]
  adjustedPhotos: AdjustedPhoto[]
  filterType: FilterType
  frameStyle: FrameStyle
  finalImageUrl: string | null
  shareId: string | null
  shareUrl: string | null
  caption: string | null
}

const initialState: PhotoboothState = {
  step: 'storefront',
  photos: [],
  adjustedPhotos: [],
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

  // After capture → go to adjust step
  const setPhotos = useCallback((photos: string[]) => {
    setState(prev => ({ ...prev, photos, step: 'adjust' }))
  }, [])

  // After adjusting all 4 → go to editor
  const setAdjusted = useCallback((adjustedPhotos: AdjustedPhoto[]) => {
    setState(prev => ({ ...prev, adjustedPhotos, step: 'editor' }))
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

  const { step, photos, adjustedPhotos, filterType, frameStyle, finalImageUrl, shareId, shareUrl, caption } = state

  return (
    <main className=" min-h-dvh flex flex-col items-center justify-center">
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
      {step === 'adjust' && (
        <PhotoAdjuster
          photos={photos}
          filterType={filterType}
          onComplete={setAdjusted}
          onBack={() => goTo('capture')}
        />
      )}
      {step === 'editor' && (
        <EditorScreen
          photos={photos}
          adjustedPhotos={adjustedPhotos}
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