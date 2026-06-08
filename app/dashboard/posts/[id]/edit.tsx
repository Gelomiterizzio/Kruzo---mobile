import { ScrollView } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { LoadingState } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PostForm } from '@/features/post/PostForm'
import { usePostById } from '@/hooks/useDocQueries'
import { useMyBusiness } from '@/hooks/useMyBusiness'

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { business, isLoading: bizLoading } = useMyBusiness()
  const { data: post, isLoading: postLoading } = usePostById(id ?? '')

  const loading = bizLoading || postLoading

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Editar publicación" />
      {loading ? (
        <LoadingState fullScreen label="Cargando…" />
      ) : !post || !business ? (
        <EmptyState title="Publicación no encontrada" emoji="🔍" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PostForm business={business} existing={post} />
        </ScrollView>
      )}
    </Screen>
  )
}
