import { ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { LoadingState } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PostForm } from '@/features/post/PostForm'
import { useMyBusiness } from '@/hooks/useMyBusiness'

export default function NewPostScreen() {
  const router = useRouter()
  const { business, hasBusiness, isLoading } = useMyBusiness()

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Nueva publicación" />
      {isLoading ? (
        <LoadingState fullScreen label="Cargando…" />
      ) : !hasBusiness || !business ? (
        <EmptyState
          title="Primero crea tu negocio"
          description="Necesitas registrar tu negocio antes de crear publicaciones."
          emoji="🏪"
          actionLabel="Crear negocio"
          onAction={() => router.replace('/dashboard/business')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PostForm business={business} />
        </ScrollView>
      )}
    </Screen>
  )
}
