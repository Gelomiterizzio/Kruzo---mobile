import { useCallback } from 'react'
import { toggleFavorite } from '@/services/firestore'
import { useStore } from '@/store/useStore'
import { haptics } from '@/utils/haptics'
import { useAuth } from './useAuth'

export type FavoriteResult =
  | { status: 'unauthenticated' }
  | { status: 'added' }
  | { status: 'removed' }
  | { status: 'error' }

/**
 * Ported from web/lib/hooks/useFavorites.ts. Optimistic toggle against the
 * Zustand store, rolling back on failure. The web version called sonner toasts
 * directly; here we return a typed result so the UI layer decides how to notify
 * (keeps the hook free of UI dependencies).
 */
export function useFavorites() {
  const { user } = useAuth()
  const { localFavorites, addFavorite, removeFavorite } = useStore()

  const isFavorite = useCallback((id: string) => localFavorites.includes(id), [localFavorites])

  const toggle = useCallback(
    async (businessId: string): Promise<FavoriteResult> => {
      if (!user) return { status: 'unauthenticated' }
      const isFav = isFavorite(businessId)
      if (isFav) removeFavorite(businessId)
      else addFavorite(businessId)
      haptics.light()
      try {
        await toggleFavorite(user.id, businessId, isFav)
        return { status: isFav ? 'removed' : 'added' }
      } catch {
        // rollback
        if (isFav) addFavorite(businessId)
        else removeFavorite(businessId)
        return { status: 'error' }
      }
    },
    [user, isFavorite, addFavorite, removeFavorite],
  )

  return { isFavorite, toggleFavorite: toggle, favorites: localFavorites }
}
