import { View, Text, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { BadgeCheck } from 'lucide-react-native'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { RatingStars } from '@/components/ui/RatingStars'
import { useTheme } from '@/providers/ThemeProvider'
import { formatNumber } from '@/utils/formatters'
import { BUSINESS_CATEGORIES } from '@/constants'
import type { Business } from '@/types/business'

export interface BusinessCardProps {
  business: Business
  onPress?: () => void
}

// Domain card composed from DS primitives (Card/Badge/RatingStars). Lives in
// features/ (it knows the Business model); the DS stays domain-agnostic.
export function BusinessCard({ business, onPress }: BusinessCardProps) {
  const { theme } = useTheme()
  const router = useRouter()
  const cover = business.coverImage || business.logo || ''
  const cat = BUSINESS_CATEGORIES.find((c) => business.category.includes(c.key))

  const handlePress =
    onPress ??
    (() => router.push({ pathname: '/business/[slug]', params: { slug: business.slug } }))

  return (
    <Card
      onPress={handlePress}
      padding={0}
      accessibilityLabel={`Negocio ${business.name}`}
      style={styles.card}
    >
      <View style={styles.coverWrap}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.cover} contentFit="cover" transition={150} />
        ) : (
          <View
            style={[styles.cover, styles.coverFallback, { backgroundColor: theme.colors.muted }]}
          >
            <Text style={styles.coverEmoji}>{cat?.emoji ?? '🏪'}</Text>
          </View>
        )}
        {business.isFeatured ? (
          <View style={styles.featured}>
            <Badge label="⭐ Destacado" variant="gold" />
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: theme.colors.foreground }]} numberOfLines={1}>
            {business.name}
          </Text>
          {business.isVerified ? <BadgeCheck size={15} color="#3b82f6" /> : null}
        </View>

        <Text style={[styles.category, { color: theme.colors.mutedForeground }]} numberOfLines={1}>
          {cat ? `${cat.emoji} ${cat.label} · ` : ''}
          {business.zone}
        </Text>

        <View style={styles.ratingRow}>
          <RatingStars value={business.rating} size={13} />
          <Text style={[styles.ratingText, { color: theme.colors.mutedForeground }]}>
            {business.rating.toFixed(1)} ({formatNumber(business.reviewCount)})
          </Text>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  coverWrap: { position: 'relative' },
  cover: { width: '100%', aspectRatio: 16 / 10 },
  coverFallback: { alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 40 },
  featured: { position: 'absolute', top: 8, left: 8 },
  body: { padding: 12, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { flex: 1, fontSize: 15, fontWeight: '700' },
  category: { fontSize: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  ratingText: { fontSize: 12, fontWeight: '500' },
})
