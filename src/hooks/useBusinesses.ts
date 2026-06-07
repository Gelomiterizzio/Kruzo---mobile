import { useInfiniteQuery } from '@tanstack/react-query'
import { type DocumentSnapshot } from 'firebase/firestore'
import { getBusinesses } from '@/services/firestore'

interface Options {
  category?: string
  featured?: boolean
  zone?: string
  pageSize?: number
}

export function useBusinesses({ category, featured, zone, pageSize = 12 }: Options = {}) {
  const q = useInfiniteQuery({
    queryKey: ['businesses', { category, featured, zone, pageSize }],
    queryFn: ({ pageParam }) =>
      getBusinesses({ category, featured, zone, pageSize, cursor: pageParam }),
    initialPageParam: undefined as DocumentSnapshot | undefined,
    getNextPageParam: (last) =>
      last.businesses.length === pageSize ? (last.lastDoc ?? undefined) : undefined,
  })

  return {
    businesses: q.data?.pages.flatMap((p) => p.businesses) ?? [],
    loading: q.isLoading,
    loadingMore: q.isFetchingNextPage,
    hasMore: q.hasNextPage,
    error: q.error
      ? q.error instanceof Error
        ? q.error.message
        : 'Error al cargar negocios'
      : null,
    loadMore: () => {
      if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage()
    },
    refetch: () => {
      q.refetch()
    },
    isRefetching: q.isRefetching,
  }
}
