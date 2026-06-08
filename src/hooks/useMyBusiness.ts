import { useQuery } from '@tanstack/react-query'
import { getBusinessById } from '@/services/firestore'
import { useAuth } from './useAuth'

// Loads the current entrepreneur's primary business (businessIds[0]).
export function useMyBusiness() {
  const { user } = useAuth()
  const businessId = user?.businessIds?.[0]

  const q = useQuery({
    queryKey: ['my-business', businessId],
    enabled: !!businessId,
    queryFn: async () => (businessId ? await getBusinessById(businessId) : null),
  })

  return {
    business: q.data ?? null,
    businessId,
    hasBusiness: !!businessId,
    isLoading: businessId ? q.isLoading : false,
    refetch: q.refetch,
  }
}
