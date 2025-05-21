"use client"

import { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  ...rest
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string>(src as string)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Update imgSrc if src prop changes
  useEffect(() => {
    setImgSrc(src as string)
    setIsLoading(true)
    setHasError(false)
  }, [src])

  return (
    <div className={`relative ${isLoading ? 'bg-gray-100 animate-pulse' : ''}`}>
      <Image
        {...rest}
        src={imgSrc}
        alt={alt}
        onLoad={() => {
          setIsLoading(false)
          setHasError(false)
        }}
        onError={() => {
          console.warn(`Image failed to load: ${imgSrc}. Using fallback.`)
          setImgSrc(fallbackSrc)
          setIsLoading(false)
          setHasError(true)
        }}
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{
          objectFit: 'cover',
          ...rest.style,
        }}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${hasError ? 'bg-gray-100' : ''} ${rest.className || ''}`}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
          {alt || 'Image not available'}
        </div>
      )}
    </div>
  )
} 