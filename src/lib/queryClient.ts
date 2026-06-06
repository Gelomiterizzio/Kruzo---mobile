import { QueryClient } from '@tanstack/react-query'

// Smart retry: never retry auth/permission errors (they won't recover), back off
// a couple of times for transient/network errors. Tuned for mobile networks.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min
      gcTime: 1000 * 60 * 30, // 30 min
      retry: (failureCount, error) => {
        const msg = error instanceof Error ? error.message : String(error)
        if (msg.includes('permission-denied') || msg.includes('unauthenticated')) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
