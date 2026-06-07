import { View, FlatList, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { BusinessCard } from '@/features/business/BusinessCard'
import { useBusinesses } from '@/hooks/useBusinesses'
import type { Business } from '@/types/business'

export interface FeaturedRowProps {
  title: string
  subtitle?: string
  featured?: boolean
  category?: string
}

// Horizontal carousel of businesses (mobile-native pattern; same data/logic as
// the web FeaturedSection grid).
export function FeaturedRow({ title, subtitle, featured, category }: FeaturedRowProps) {
  const router = useRouter()
  const { businesses, loading } = useBusinesses({ featured, category, pageSize: 8 })

  if (!loading && businesses.length === 0) return null

  const seeAll = () =>
    featured
      ? router.push({ pathname: '/explore', params: { filter: 'featured' } })
      : category
        ? router.push({ pathname: '/explore', params: { cat: category } })
        : router.push('/explore')

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <SectionHeader
          title={title}
          subtitle={subtitle}
          actionLabel="Ver todos"
          onActionPress={seeAll}
        />
      </View>

      {loading ? (
        <View style={styles.rowLoading}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width={220} height={190} radius={16} />
          ))}
        </View>
      ) : (
        <FlatList
          horizontal
          data={businesses}
          keyExtractor={(b: Business) => b.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <BusinessCard business={item} />
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  header: { paddingHorizontal: 16 },
  row: { paddingHorizontal: 16, gap: 12 },
  rowLoading: { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },
  card: { width: 230 },
})
