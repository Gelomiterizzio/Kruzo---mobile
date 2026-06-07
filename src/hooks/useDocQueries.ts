import { useQuery } from '@tanstack/react-query'
import { getBusinessBySlug, getPostById, getUserById } from '@/services/firestore'

export function useBusinessBySlug(slug: string) {
  return useQuery({
    queryKey: ['business', 'slug', slug],
    queryFn: () => getBusinessBySlug(slug),
    enabled: !!slug,
  })
}

export function usePostById(id: string) {
  return useQuery({ queryKey: ['post', id], queryFn: () => getPostById(id), enabled: !!id })
}

export function useUserById(id: string) {
  return useQuery({ queryKey: ['user', id], queryFn: () => getUserById(id), enabled: !!id })
}
