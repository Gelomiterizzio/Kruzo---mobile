import { useInfiniteQuery } from '@tanstack/react-query'
import { type DocumentSnapshot } from 'firebase/firestore'
import { getReviews } from '@/services/firestore'

const PAGE_SIZE = 5

export function useReviews(businessId: string) {
  const q = useInfiniteQuery({
    queryKey: ['reviews', businessId],
    queryFn: ({ pageParam }) => getReviews(businessId, PAGE_SIZE, pageParam),
    initialPageParam: undefined as DocumentSnapshot | undefined,
    getNextPageParam: (last) =>
      last.reviews.length === PAGE_SIZE ? (last.lastDoc ?? undefined) : undefined,
    enabled: !!businessId,
  })

  return {
    reviews: q.data?.pages.flatMap((p) => p.reviews) ?? [],
    loading: q.isLoading,
    loadingMore: q.isFetchingNextPage,
    hasMore: q.hasNextPage,
    error: q.error
      ? q.error instanceof Error
        ? q.error.message
        : 'Error al cargar reseñas'
      : null,
    loadMore: () => {
      if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage()
    },
    refetch: () => {
      q.refetch()
    },
  }
}
