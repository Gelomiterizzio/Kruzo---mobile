import { FlatList, View, Text, Pressable, Alert, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Eye, FileText, Trash2 } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/feedback/EmptyState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { toast } from '@/components/overlay/toast'
import { useMyBusiness } from '@/hooks/useMyBusiness'
import { usePosts } from '@/hooks/usePosts'
import { updatePost } from '@/services/firestore'
import { useTheme } from '@/providers/ThemeProvider'
import { formatPrice, formatRelativeTime } from '@/utils/formatters'
import type { Post } from '@/types/post'

export default function DashboardPostsScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { business, hasBusiness, isLoading: bizLoading } = useMyBusiness()
  const { posts, loading } = usePosts({ businessId: business?.id, pageSize: 20 })

  const onDelete = (post: Post) => {
    Alert.alert('Eliminar publicación', `¿Eliminar "${post.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await updatePost(post.id, { status: 'deleted' })
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            toast.success('Publicación eliminada')
          } catch {
            toast.error('Error al eliminar')
          }
        },
      },
    ])
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>Publicaciones</Text>
        <Button
          label="Nueva"
          size="sm"
          leftIcon={<Plus size={15} color="#fff" />}
          onPress={() => router.push('/dashboard/posts/new')}
        />
      </View>
    </View>
  )

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Mis publicaciones" />
      {bizLoading ? (
        <LoadingState fullScreen label="Cargando…" />
      ) : !hasBusiness ? (
        <EmptyState
          title="Primero crea tu negocio"
          description="Necesitas registrar tu negocio antes de publicar."
          emoji="🏪"
          actionLabel="Crear negocio"
          onAction={() => router.replace('/dashboard/business')}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          ListHeaderComponent={header}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={styles.row}>
              {item.images[0] ? (
                <Image source={{ uri: item.images[0] }} style={styles.thumb} contentFit="cover" />
              ) : (
                <View
                  style={[
                    styles.thumb,
                    styles.thumbFallback,
                    { backgroundColor: theme.colors.muted },
                  ]}
                >
                  <FileText size={18} color={theme.colors.mutedForeground} />
                </View>
              )}
              <View style={styles.meta}>
                <Text
                  style={[styles.postTitle, { color: theme.colors.foreground }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  style={[styles.postSub, { color: theme.colors.mutedForeground }]}
                  numberOfLines={1}
                >
                  {item.priceType === 'consult'
                    ? 'Consultar'
                    : item.priceType === 'free'
                      ? 'Gratis'
                      : formatPrice(item.price)}{' '}
                  · {formatRelativeTime(item.createdAt)}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
                  hitSlop={6}
                  accessibilityLabel="Ver"
                >
                  <Eye size={18} color={theme.colors.mutedForeground} />
                </Pressable>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/dashboard/posts/[id]/edit', params: { id: item.id } })
                  }
                  hitSlop={6}
                  accessibilityLabel="Editar"
                >
                  <Pencil size={18} color={theme.colors.mutedForeground} />
                </Pressable>
                <Pressable onPress={() => onDelete(item)} hitSlop={6} accessibilityLabel="Eliminar">
                  <Trash2 size={18} color={theme.colors.destructive} />
                </Pressable>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            loading ? (
              <LoadingState label="Cargando publicaciones…" />
            ) : (
              <EmptyState
                title="Sin publicaciones"
                description="Crea tu primera publicación para mostrar tus productos."
                emoji="📦"
                actionLabel="Crear publicación"
                onAction={() => router.push('/dashboard/posts/new')}
              />
            )
          }
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { paddingBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: '800' },
  content: { padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 52, height: 52, borderRadius: 12 },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  meta: { flex: 1, minWidth: 0 },
  postTitle: { fontSize: 14, fontWeight: '600' },
  postSub: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
})
