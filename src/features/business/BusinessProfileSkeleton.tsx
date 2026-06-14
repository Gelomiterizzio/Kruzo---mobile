import { View, StyleSheet } from 'react-native'
import { Skeleton } from '@/components/ui/Skeleton'

// Content-shaped placeholder for the business detail screen so the load reads as
// the page filling in (no spinner → content jump). Mirrors BusinessProfile:
// cover, title/meta, rating, CTA row, then a couple of post cards.
export function BusinessProfileSkeleton() {
  return (
    <View style={styles.root}>
      <Skeleton width="100%" height={190} radius={0} />
      <View style={styles.body}>
        <Skeleton width="65%" height={22} />
        <Skeleton width="40%" height={14} />
        <Skeleton width="30%" height={14} />

        <View style={styles.ctaRow}>
          <Skeleton width={104} height={38} radius={10} />
          <Skeleton width={104} height={38} radius={10} />
          <Skeleton width={104} height={38} radius={10} />
        </View>

        <View style={styles.cards}>
          <Skeleton width="100%" height={120} radius={14} />
          <Skeleton width="100%" height={120} radius={14} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: 16, gap: 12 },
  ctaRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  cards: { gap: 12, marginTop: 8 },
})
