import { View, Text, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Eye, Truck } from 'lucide-react-native'
import { Card } from '@/components/ui/Card'
import { useTheme } from '@/providers/ThemeProvider'
import { formatPrice, formatNumber } from '@/utils/formatters'
import type { Post } from '@/types/post'

export interface PostCardProps {
  post: Post
  onPress?: () => void
}

export function PostCard({ post, onPress }: PostCardProps) {
  const { theme } = useTheme()
  const router = useRouter()

  const hasDiscount = !!post.originalPrice && post.originalPrice > post.price
  const discountPct = hasDiscount
    ? Math.round((1 - post.price / (post.originalPrice as number)) * 100)
    : 0

  const priceLabel =
    post.priceType === 'consult'
      ? 'Consultar'
      : post.priceType === 'free'
        ? 'Gratis'
        : formatPrice(post.price)

  const handlePress =
    onPress ?? (() => router.push({ pathname: '/post/[id]', params: { id: post.id } }))

  return (
    <Card onPress={handlePress} padding={0} accessibilityLabel={post.title} style={styles.card}>
      <View>
        {post.images[0] ? (
          <Image
            source={{ uri: post.images[0] }}
            style={styles.image}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={[styles.image, styles.fallback, { backgroundColor: theme.colors.muted }]}>
            <Text style={styles.fallbackEmoji}>📦</Text>
          </View>
        )}
        <View style={styles.badges}>
          {hasDiscount ? (
            <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
              <Text style={styles.badgeText}>-{discountPct}%</Text>
            </View>
          ) : null}
          {!post.inStock ? (
            <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <Text style={styles.badgeText}>Agotado</Text>
            </View>
          ) : null}
        </View>
        {post.hasDelivery ? (
          <View style={styles.delivery}>
            <Truck size={10} color="#fff" />
            <Text style={styles.deliveryText}>Delivery</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.colors.foreground }]} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={[styles.business, { color: theme.colors.mutedForeground }]} numberOfLines={1}>
          📍 {post.businessName}
        </Text>

        <View style={styles.priceRow}>
          <Text
            style={[
              styles.price,
              { color: post.price === 0 ? '#16a34a' : theme.colors.foreground },
            ]}
          >
            {priceLabel}
          </Text>
          {hasDiscount ? (
            <Text style={[styles.strike, { color: theme.colors.mutedForeground }]}>
              {formatPrice(post.originalPrice as number)}
            </Text>
          ) : null}
        </View>

        <View style={styles.stats}>
          <Eye size={11} color={theme.colors.mutedForeground} />
          <Text style={[styles.statText, { color: theme.colors.mutedForeground }]}>
            {formatNumber(post.viewCount)}
          </Text>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  image: { width: '100%', height: 130 },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackEmoji: { fontSize: 36 },
  badges: { position: 'absolute', top: 8, left: 8, gap: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  delivery: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deliveryText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  body: { padding: 10, gap: 4 },
  title: { fontSize: 13, fontWeight: '600', lineHeight: 17 },
  business: { fontSize: 11 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700' },
  strike: { fontSize: 11, textDecorationLine: 'line-through' },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statText: { fontSize: 11 },
})
