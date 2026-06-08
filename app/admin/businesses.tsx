import { useState } from 'react'
import { FlatList, View, Text, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, CheckCircle2, Ban, Star, Eye } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { IconButton } from '@/components/ui/IconButton'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { LoadingState } from '@/components/feedback/LoadingState'
import { toast } from '@/components/overlay/toast'
import {
  getAllBusinesses,
  setBusinessStatus,
  setBusinessFeatured,
  setBusinessVerified,
} from '@/services/admin'
import { useTheme } from '@/providers/ThemeProvider'
import { formatRelativeTime } from '@/utils/formatters'
import type { BusinessStatus } from '@/types/business'

const STATUS_META: Record<BusinessStatus, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Activo', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  suspended: { label: 'Suspendido', variant: 'danger' },
  rejected: { label: 'Rechazado', variant: 'neutral' },
}
const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'active', label: 'Activos' },
  { key: 'suspended', label: 'Suspendidos' },
]

export default function AdminBusinessesScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')
  const { data, isLoading } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: () => getAllBusinesses(100),
  })

  const run = async (action: () => Promise<void>, msg: string) => {
    try {
      await action()
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] })
      toast.success(msg)
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const businesses = (data ?? []).filter((b) => filter === 'all' || b.status === filter)

  const header = (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>Gestión de negocios</Text>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            selected={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </View>
    </View>
  )

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Negocios" />
      {isLoading ? (
        <LoadingState fullScreen label="Cargando…" />
      ) : (
        <FlatList
          data={businesses}
          keyExtractor={(b) => b.id}
          ListHeaderComponent={header}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status]
            return (
              <Card style={styles.row}>
                <View style={styles.rowTop}>
                  {item.logo ? (
                    <Image source={{ uri: item.logo }} style={styles.logo} contentFit="cover" />
                  ) : (
                    <View
                      style={[
                        styles.logo,
                        styles.logoFallback,
                        { backgroundColor: theme.colors.muted },
                      ]}
                    >
                      <Text>🏪</Text>
                    </View>
                  )}
                  <View style={styles.meta}>
                    <View style={styles.nameRow}>
                      <Text
                        style={[styles.name, { color: theme.colors.foreground }]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      {item.isVerified ? <BadgeCheck size={13} color="#3b82f6" /> : null}
                      {item.isFeatured ? (
                        <Star size={13} color={theme.gold[500]} fill={theme.gold[500]} />
                      ) : null}
                    </View>
                    <Text
                      style={[styles.sub, { color: theme.colors.mutedForeground }]}
                      numberOfLines={1}
                    >
                      {item.zone} · ⭐ {item.rating.toFixed(1)} ·{' '}
                      {formatRelativeTime(item.createdAt)}
                    </Text>
                  </View>
                  <Badge label={meta.label} variant={meta.variant} />
                </View>
                <View style={styles.actions}>
                  {item.status === 'pending' ? (
                    <IconButton
                      icon={<CheckCircle2 size={16} color="#16a34a" />}
                      accessibilityLabel="Aprobar"
                      variant="soft"
                      size="sm"
                      onPress={() =>
                        run(() => setBusinessStatus(item.id, 'active'), 'Negocio aprobado')
                      }
                    />
                  ) : null}
                  {item.status === 'active' ? (
                    <IconButton
                      icon={<Ban size={16} color={theme.colors.destructive} />}
                      accessibilityLabel="Suspender"
                      variant="soft"
                      size="sm"
                      onPress={() =>
                        run(() => setBusinessStatus(item.id, 'suspended'), 'Negocio suspendido')
                      }
                    />
                  ) : null}
                  <IconButton
                    icon={
                      <Star
                        size={16}
                        color={item.isFeatured ? theme.gold[500] : theme.colors.mutedForeground}
                      />
                    }
                    accessibilityLabel="Destacar"
                    variant="soft"
                    size="sm"
                    onPress={() =>
                      run(
                        () => setBusinessFeatured(item.id, !item.isFeatured),
                        item.isFeatured ? 'Quitado de destacados' : 'Negocio destacado',
                      )
                    }
                  />
                  <IconButton
                    icon={
                      <BadgeCheck
                        size={16}
                        color={item.isVerified ? '#3b82f6' : theme.colors.mutedForeground}
                      />
                    }
                    accessibilityLabel="Verificar"
                    variant="soft"
                    size="sm"
                    onPress={() =>
                      run(
                        () => setBusinessVerified(item.id, !item.isVerified),
                        item.isVerified ? 'Verificación removida' : 'Negocio verificado',
                      )
                    }
                  />
                  <IconButton
                    icon={<Eye size={16} color={theme.colors.mutedForeground} />}
                    accessibilityLabel="Ver"
                    variant="soft"
                    size="sm"
                    onPress={() =>
                      router.push({ pathname: '/business/[slug]', params: { slug: item.slug } })
                    }
                  />
                </View>
              </Card>
            )
          }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.colors.mutedForeground }]}>
              No hay negocios con este filtro
            </Text>
          }
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { paddingBottom: 8, gap: 10 },
  title: { fontSize: 22, fontWeight: '800' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  content: { padding: 16, gap: 10 },
  row: { gap: 10 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 10 },
  logoFallback: { alignItems: 'center', justifyContent: 'center' },
  meta: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  sub: { fontSize: 12, marginTop: 1 },
  actions: { flexDirection: 'row', gap: 6, justifyContent: 'flex-end' },
  empty: { textAlign: 'center', paddingVertical: 32 },
})
