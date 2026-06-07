import { useInfiniteQuery } from '@tanstack/react-query'
import { type DocumentSnapshot } from 'firebase/firestore'
import { getPosts, getPostsByBusiness } from '@/services/firestore'

interface Options {
  category?: string
  businessId?: string
  pageSize?: number
}

export function usePosts({ category, businessId, pageSize = 12 }: Options = {}) {
  const q = useInfiniteQuery({
    queryKey: ['posts', { category, businessId, pageSize }],
    queryFn: ({ pageParam }) =>
      businessId
        ? getPostsByBusiness(businessId, pageSize, pageParam)
        : getPosts({ category, pageSize, cursor: pageParam }),
    initialPageParam: undefined as DocumentSnapshot | undefined,
    getNextPageParam: (last) =>
      last.posts.length === pageSize ? (last.lastDoc ?? undefined) : undefined,
  })

  return {
    posts: q.data?.pages.flatMap((p) => p.posts) ?? [],
    loading: q.isLoading,
    loadingMore: q.isFetchingNextPage,
    hasMore: q.hasNextPage,
    error: q.error
      ? q.error instanceof Error
        ? q.error.message
        : 'Error al cargar publicaciones'
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
