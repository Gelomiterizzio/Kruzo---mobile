import { useLocalSearchParams } from 'expo-router'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/feedback/EmptyState'
import { BusinessProfile } from '@/features/business/BusinessProfile'
import { BusinessProfileSkeleton } from '@/features/business/BusinessProfileSkeleton'
import { useBusinessBySlug } from '@/hooks/useDocQueries'

export default function BusinessDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { data: business, isLoading } = useBusinessBySlug(slug ?? '')

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header />
      {isLoading ? (
        <BusinessProfileSkeleton />
      ) : !business ? (
        <EmptyState
          title="Negocio no encontrado"
          description="Este negocio no existe o fue eliminado."
          emoji="🔍"
        />
      ) : (
        <BusinessProfile business={business} />
      )}
    </Screen>
  )
}
