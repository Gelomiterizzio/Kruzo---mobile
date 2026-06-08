import { FlatList, View, Text, StyleSheet } from 'react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { RatingStars } from '@/components/ui/RatingStars'
import { LoadingState } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ReviewCard } from '@/features/review/ReviewCard'
import { useMyBusiness } from '@/hooks/useMyBusiness'
import { useReviews } from '@/hooks/useReviews'
import { useTheme } from '@/providers/ThemeProvider'
import { formatNumber } from '@/utils/formatters'

export default function DashboardReviewsScreen() {
  const { theme } = useTheme()
  const { business, hasBusiness, isLoading } = useMyBusiness()
  const { reviews, loading, hasMore, loadMore } = useReviews(business?.id ?? '')

  const summary = business ? (
    <Card style={styles.summary}>
      <View style={styles.summaryLeft}>
        <Text style={[styles.big, { color: theme.colors.foreground }]}>
          {business.rating.toFixed(1)}
        </Text>
        <RatingStars value={Math.round(business.rating)} size={14} />
        <Text style={[styles.muted, { color: theme.colors.mutedForeground }]}>
          {formatNumber(business.reviewCount)} reseñas
        </Text>
      </View>
      <View style={styles.bars}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = business.ratingDistribution?.[star] ?? 0
          const pct = business.reviewCount > 0 ? (count / business.reviewCount) * 100 : 0
          return (
            <View key={star} style={styles.barRow}>
              <Text style={[styles.barStar, { color: theme.colors.mutedForeground }]}>{star}</Text>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.muted }]}>
                <View
                  style={[styles.barFill, { width: `${pct}%`, backgroundColor: theme.gold[400] }]}
                />
              </View>
            </View>
          )
        })}
      </View>
    </Card>
  ) : null

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Reseñas" />
      {isLoading ? (
        <LoadingState fullScreen label="Cargando…" />
      ) : !hasBusiness ? (
        <EmptyState
          title="Sin reseñas"
          description="Crea tu negocio para recibir reseñas."
          emoji="⭐"
        />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(r) => r.id}
          ListHeaderComponent={summary}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ReviewCard review={item} />}
          onEndReached={() => {
            if (hasMore) loadMore()
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            loading ? (
              <LoadingState label="Cargando reseñas…" />
            ) : (
              <Text style={[styles.empty, { color: theme.colors.mutedForeground }]}>
                Aún no tienes reseñas
              </Text>
            )
          }
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  summary: { flexDirection: 'row', gap: 20, alignItems: 'center', marginBottom: 4 },
  summaryLeft: { alignItems: 'center', gap: 2 },
  big: { fontSize: 36, fontWeight: '800' },
  muted: { fontSize: 12 },
  bars: { flex: 1, gap: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barStar: { fontSize: 12, width: 10 },
  barTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  empty: { textAlign: 'center', paddingVertical: 32 },
})
