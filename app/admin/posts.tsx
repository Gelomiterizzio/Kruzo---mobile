import { FlatList, View, Text, Alert, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Eye, Trash2, ToggleLeft, ToggleRight } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { LoadingState } from '@/components/feedback/LoadingState'
import { toast } from '@/components/overlay/toast'
import { getAllPosts, setPostStatus } from '@/services/admin'
import { useTheme } from '@/providers/ThemeProvider'
import { formatPrice, formatRelativeTime } from '@/utils/formatters'
import type { PostStatus } from '@/types/post'

const STATUS_VARIANT: Record<PostStatus, BadgeVariant> = {
  active: 'success',
  paused: 'warning',
  sold: 'info',
  deleted: 'neutral',
}

export default function AdminPostsScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => getAllPosts(100),
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-posts'] })

  const toggle = async (id: string, status: PostStatus) => {
    const next: PostStatus = status === 'active' ? 'paused' : 'active'
    try {
      await setPostStatus(id, next)
      refresh()
      toast.success(next === 'active' ? 'Publicación activada' : 'Publicación pausada')
    } catch {
      toast.error('Error')
    }
  }

  const remove = (id: string, title: string) => {
    Alert.alert('Eliminar publicación', `¿Eliminar "${title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await setPostStatus(id, 'deleted')
            refresh()
            toast.success('Publicación eliminada')
          } catch {
            toast.error('Error al eliminar')
          }
        },
      },
    ])
  }

  const posts = (data ?? []).filter((p) => p.status !== 'deleted')

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Publicaciones" />
      {isLoading ? (
        <LoadingState fullScreen label="Cargando…" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={styles.row}>
              {item.images[0] ? (
                <Image source={{ uri: item.images[0] }} style={styles.thumb} contentFit="cover" />
              ) : (
                <View
                  style={[styles.thumb, styles.fallback, { backgroundColor: theme.colors.muted }]}
                >
                  <FileText size={16} color={theme.colors.mutedForeground} />
                </View>
              )}
              <View style={styles.meta}>
                <Text style={[styles.title, { color: theme.colors.foreground }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text
                  style={[styles.sub, { color: theme.colors.mutedForeground }]}
                  numberOfLines={1}
                >
                  {item.businessName} ·{' '}
                  {item.priceType === 'consult' ? 'Consultar' : formatPrice(item.price)} ·{' '}
                  {formatRelativeTime(item.createdAt)}
                </Text>
              </View>
              <Badge label={item.status} variant={STATUS_VARIANT[item.status]} />
              <View style={styles.actions}>
                <IconButton
                  icon={
                    item.status === 'active' ? (
                      <ToggleRight size={18} color="#16a34a" />
                    ) : (
                      <ToggleLeft size={18} color={theme.colors.mutedForeground} />
                    )
                  }
                  accessibilityLabel="Cambiar estado"
                  variant="soft"
                  size="sm"
                  onPress={() => toggle(item.id, item.status)}
                />
                <IconButton
                  icon={<Eye size={16} color={theme.colors.mutedForeground} />}
                  accessibilityLabel="Ver"
                  variant="soft"
                  size="sm"
                  onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
                />
                <IconButton
                  icon={<Trash2 size={16} color={theme.colors.destructive} />}
                  accessibilityLabel="Eliminar"
                  variant="soft"
                  size="sm"
                  onPress={() => remove(item.id, item.title)}
                />
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.colors.mutedForeground }]}>
              No hay publicaciones
            </Text>
          }
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  thumb: { width: 44, height: 44, borderRadius: 10 },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  meta: { flex: 1, minWidth: 120 },
  title: { fontSize: 14, fontWeight: '600' },
  sub: { fontSize: 12, marginTop: 1 },
  actions: { flexDirection: 'row', gap: 6 },
  empty: { textAlign: 'center', paddingVertical: 32 },
})
