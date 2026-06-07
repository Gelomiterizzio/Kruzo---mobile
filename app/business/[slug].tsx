import { useLocalSearchParams } from 'expo-router'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { LoadingState } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { BusinessProfile } from '@/features/business/BusinessProfile'
import { useBusinessBySlug } from '@/hooks/useDocQueries'

export default function BusinessDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { data: business, isLoading } = useBusinessBySlug(slug ?? '')

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header />
      {isLoading ? (
        <LoadingState fullScreen label="Cargando negocio…" />
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
