import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Tag, Truck, Share2 } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { LoadingState } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { IconButton } from '@/components/ui/IconButton'
import { usePostById } from '@/hooks/useDocQueries'
import { useTheme } from '@/providers/ThemeProvider'
import { formatPrice, formatRelativeTime } from '@/utils/formatters'
import { buildWhatsAppPostURL } from '@/utils/whatsapp'
import { openWhatsApp, shareLink } from '@/utils/contact'

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { theme } = useTheme()
  const { data: post, isLoading } = usePostById(id ?? '')

  if (isLoading) {
    return (
      <Screen edges={['bottom']} padded={false}>
        <Header />
        <LoadingState fullScreen label="Cargando…" />
      </Screen>
    )
  }

  if (!post || post.status === 'deleted') {
    return (
      <Screen edges={['bottom']} padded={false}>
        <Header />
        <EmptyState title="Publicación no encontrada" emoji="🔍" />
      </Screen>
    )
  }

  const hasDiscount = !!post.originalPrice && post.originalPrice > post.price
  const priceLabel =
    post.priceType === 'consult'
      ? 'Consultar'
      : post.priceType === 'free'
        ? 'Gratis'
        : formatPrice(post.price)

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header
        title={post.businessName}
        right={
          <IconButton
            icon={<Share2 size={18} color={theme.colors.foreground} />}
            accessibilityLabel="Compartir publicación"
            onPress={() => shareLink(post.title, `/post/${post.id}`)}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {post.images[0] ? (
          <Image
            source={{ uri: post.images[0] }}
            style={styles.image}
            contentFit="cover"
            transition={150}
          />
        ) : null}

        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.colors.foreground }]}>{post.title}</Text>
            <View style={styles.priceCol}>
              <Text style={[styles.price, { color: theme.colors.primary }]}>{priceLabel}</Text>
              {hasDiscount ? (
                <Text style={[styles.strike, { color: theme.colors.mutedForeground }]}>
                  {formatPrice(post.originalPrice as number)}
                </Text>
              ) : null}
            </View>
          </View>

          <Text style={[styles.time, { color: theme.colors.mutedForeground }]}>
            {formatRelativeTime(post.createdAt)}
          </Text>

          <Text style={[styles.desc, { color: theme.colors.foreground }]}>{post.description}</Text>

          <View style={styles.tags}>
            {post.tags.map((t) => (
              <View key={t} style={[styles.tag, { backgroundColor: theme.colors.muted }]}>
                <Tag size={10} color={theme.colors.mutedForeground} />
                <Text style={[styles.tagText, { color: theme.colors.mutedForeground }]}>{t}</Text>
              </View>
            ))}
            {post.hasDelivery ? (
              <View style={[styles.tag, { backgroundColor: '#dbeafe' }]}>
                <Truck size={10} color="#1d4ed8" />
                <Text style={[styles.tagText, { color: '#1d4ed8' }]}>
                  Delivery {post.deliveryPrice > 0 ? `Bs. ${post.deliveryPrice}` : 'gratis'}
                </Text>
              </View>
            ) : null}
          </View>

          <Card
            onPress={() =>
              router.push({ pathname: '/business/[slug]', params: { slug: post.businessSlug } })
            }
            style={styles.bizCard}
          >
            <Avatar uri={post.businessLogo} name={post.businessName} size={44} />
            <View style={styles.bizMeta}>
              <Text style={[styles.bizName, { color: theme.colors.foreground }]} numberOfLines={1}>
                {post.businessName}
              </Text>
              <Text style={[styles.bizLink, { color: theme.colors.mutedForeground }]}>
                Ver perfil completo →
              </Text>
            </View>
          </Card>

          <Button
            label="Consultar por WhatsApp"
            size="lg"
            fullWidth
            style={styles.whatsapp}
            onPress={() =>
              openWhatsApp(
                buildWhatsAppPostURL(post.whatsapp, post.businessName, post.title, post.price),
              )
            }
          />
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  image: { width: '100%', aspectRatio: 1 },
  section: { padding: 16, gap: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: '800' },
  priceCol: { alignItems: 'flex-end' },
  price: { fontSize: 20, fontWeight: '800' },
  strike: { fontSize: 13, textDecorationLine: 'line-through' },
  time: { fontSize: 13, marginTop: -6 },
  desc: { fontSize: 15, lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  tagText: { fontSize: 12 },
  bizCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bizMeta: { flex: 1, minWidth: 0 },
  bizName: { fontSize: 15, fontWeight: '700' },
  bizLink: { fontSize: 12, marginTop: 2 },
  whatsapp: { backgroundColor: '#25D366', marginTop: 4 },
})
