import { useCallback } from 'react'
import { FlatList, RefreshControl, View, ActivityIndicator, StyleSheet } from 'react-native'
import { useBusinesses } from '@/hooks/useBusinesses'
import { BusinessCard } from './BusinessCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useTheme } from '@/providers/ThemeProvider'
import type { Business } from '@/types/business'

export interface BusinessGridProps {
  category?: string
  zone?: string
  featured?: boolean
  ListHeaderComponent?: React.ComponentProps<typeof FlatList>['ListHeaderComponent']
  emptyAction?: { label: string; onPress: () => void }
}

function CardSkeleton() {
  const { theme } = useTheme()
  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: theme.radius.xl,
        overflow: 'hidden',
      }}
    >
      <Skeleton width="100%" height={120} radius={0} />
      <View style={{ padding: 12, gap: 8 }}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="45%" height={11} />
        <Skeleton width="55%" height={11} />
      </View>
    </View>
  )
}

export function BusinessGrid({
  category,
  zone,
  featured,
  ListHeaderComponent,
  emptyAction,
}: BusinessGridProps) {
  const { theme } = useTheme()
  const { businesses, loading, loadingMore, hasMore, error, loadMore, refetch, isRefetching } =
    useBusinesses({ category, zone, featured })

  const renderItem = useCallback(
    ({ item }: { item: Business }) => (
      <View style={styles.cell}>
        <BusinessCard business={item} />
      </View>
    ),
    [],
  )

  return (
    <FlatList
      data={businesses}
      keyExtractor={(b) => b.id}
      renderItem={renderItem}
      numColumns={2}
      ListHeaderComponent={ListHeaderComponent}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onEndReached={() => {
        if (hasMore) loadMore()
      }}
      onEndReachedThreshold={0.4}
      removeClippedSubviews
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
      ListEmptyComponent={
        loading ? (
          <View style={styles.skeletonWrap}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : error ? (
          <EmptyState title="Error al cargar" description={error} emoji="⚠️" />
        ) : (
          <EmptyState
            title="No hay negocios aquí"
            description="Sé el primero en registrar tu negocio en esta categoría."
            emoji="🏪"
            actionLabel={emptyAction?.label}
            onAction={emptyAction?.onPress}
          />
        )
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator style={styles.footer} color={theme.colors.mutedForeground} />
        ) : null
      }
    />
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  row: { gap: 12 },
  cell: { flex: 1, maxWidth: '50%' },
  skeletonWrap: { paddingHorizontal: 16, gap: 12 },
  footer: { paddingVertical: 16 },
})
