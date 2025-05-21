"use client"

import { SWRConfig } from 'swr'
import { apiRequest } from '@/lib/api'

interface SWRProviderProps {
  children: React.ReactNode
}

// Configure global SWR settings for optimized data fetching
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource) => apiRequest(resource),
        revalidateOnFocus: false, // Disable revalidation on window focus
        revalidateIfStale: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000, // 5 seconds
        dedupingInterval: 2000, // 2 seconds
        focusThrottleInterval: 5000, // 5 seconds
        loadingTimeout: 3000, // 3 seconds
        suspense: false, // Disable Suspense
      }}
    >
      {children}
    </SWRConfig>
  )
}

export default SWRProvider 