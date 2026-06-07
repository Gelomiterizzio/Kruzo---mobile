import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client'
import { queryClient } from './queryClient'

// Offline-first foundation: the React Query cache is mirrored to AsyncStorage so
// previously-loaded businesses/posts/reviews are available without a network
// connection (KRUZO premium requirement). `buster` invalidates the whole
// persisted cache on app upgrades; bump it when query shapes change.
const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'kruzo-rq-cache',
  throttleTime: 1000,
})

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24h
  buster: 'v1',
}

export { queryClient }
