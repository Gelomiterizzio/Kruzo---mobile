import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, persistOptions } from '@/lib/queryPersist'

// Wraps the app with React Query AND restores/persists its cache to AsyncStorage
// (offline-first). Children render immediately; the restore happens in the
// background and hydrates queries as it completes.
export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      {children}
    </PersistQueryClientProvider>
  )
}
