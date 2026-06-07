import { FlatList, View, Text, RefreshControl, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Screen } from '@/components/layout/Screen'
import { EmptyState } from '@/components/feedback/EmptyState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { BusinessCard } from '@/features/business/BusinessCard'
import { useAuth } from '@/hooks/useAuth'
import { useFavorites } from '@/hooks/useFavorites'
import { getBusinessById } from '@/services/firestore'
import { useTheme } from '@/providers/ThemeProvider'
import type { Business } from '@/types/business'

export default function FavoritesScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { isAuthenticated } = useAuth()
  const { favorites } = useFavorites()

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['favorites-businesses', favorites],
    enabled: isAuthenticated && favorites.length > 0,
    queryFn: async () => {
      const res = await Promise.all(favorites.map((id) => getBusinessById(id)))
      return res.filter((b): b is Business => b !== null)
    },
  })

  if (!isAuthenticated) {
    return (
      <Screen>
        <EmptyState
          title="Tus favoritos"
          description="Inicia sesión para guardar y ver tus negocios favoritos."
          emoji="🤍"
          actionLabel="Iniciar sesión"
          onAction={() => router.push('/login')}
        />
      </Screen>
    )
  }

  const businesses = data ?? []

  return (
    <Screen edges={['top']} padded={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>Favoritos</Text>
        <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
          {favorites.length} {favorites.length === 1 ? 'negocio guardado' : 'negocios guardados'}
        </Text>
      </View>

      {isLoading ? (
        <LoadingState label="Cargando favoritos…" />
      ) : (
        <FlatList
          data={businesses}
          keyExtractor={(b) => b.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <BusinessCard business={item} />
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No tienes favoritos aún"
              description="Guarda negocios tocando el corazón en su perfil."
              emoji="🤍"
              actionLabel="Explorar negocios"
              onAction={() => router.push('/explore')}
            />
          }
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, marginTop: 2 },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 12, flexGrow: 1 },
  row: { gap: 12 },
  cell: { flex: 1, maxWidth: '50%' },
})
