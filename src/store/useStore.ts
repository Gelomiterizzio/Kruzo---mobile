import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AppUser } from '@/types/user'

// Ported from web/lib/store/useStore.ts. Persists ONLY localFavorites, now to
// AsyncStorage (was localStorage on web).
interface KruzoState {
  user: AppUser | null
  setUser: (user: AppUser | null) => void

  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: string
  setSelectedCategory: (cat: string) => void

  localFavorites: string[]
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  setFavorites: (ids: string[]) => void

  unreadCount: number
  setUnreadCount: (n: number) => void
}

export const useStore = create<KruzoState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      selectedCategory: '',
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),

      localFavorites: [],
      addFavorite: (id) => set((s) => ({ localFavorites: [...s.localFavorites, id] })),
      removeFavorite: (id) =>
        set((s) => ({ localFavorites: s.localFavorites.filter((f) => f !== id) })),
      setFavorites: (ids) => set({ localFavorites: ids }),

      unreadCount: 0,
      setUnreadCount: (n) => set({ unreadCount: n }),
    }),
    {
      name: 'kruzo-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ localFavorites: s.localFavorites }),
    },
  ),
)
