import { useEffect, useState } from 'react'
import { onlineManager } from '@tanstack/react-query'

// Subscribes to React Query's online state (fed by NetInfo in lib/network.ts).
export function useIsOnline() {
  const [online, setOnline] = useState(onlineManager.isOnline())
  useEffect(() => onlineManager.subscribe(setOnline), [])
  return online
}
