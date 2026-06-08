import { FlatList, View, Text, StyleSheet } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, CheckCircle2 } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Select } from '@/components/ui/Select'
import { IconButton } from '@/components/ui/IconButton'
import { LoadingState } from '@/components/feedback/LoadingState'
import { toast } from '@/components/overlay/toast'
import { getAllUsers, setUserRole, setUserBanned } from '@/services/admin'
import { useTheme } from '@/providers/ThemeProvider'
import { formatRelativeTime } from '@/utils/formatters'
import { haptics } from '@/utils/haptics'
import type { AppUser, UserRole } from '@/types/user'

const ROLE_OPTIONS = [
  { label: 'Usuario', value: 'user' },
  { label: 'Emprendedor', value: 'entrepreneur' },
  { label: 'Admin', value: 'admin' },
]

export default function AdminUsersScreen() {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAllUsers(100),
  })

  const key = ['admin-users']
  const patchUser = (uid: string, p: Partial<AppUser>) =>
    queryClient.setQueryData<AppUser[]>(key, (old) =>
      old?.map((u) => (u.id === uid ? { ...u, ...p } : u)),
    )

  const changeRole = (uid: string, role: string) => {
    const prev = queryClient.getQueryData<AppUser[]>(key)
    patchUser(uid, { role: role as UserRole })
    haptics.light()
    setUserRole(uid, role as UserRole)
      .then(() => toast.success('Rol actualizado'))
      .catch(() => {
        queryClient.setQueryData(key, prev)
        toast.error('Error al actualizar')
      })
  }

  const toggleBan = (uid: string, banned: boolean) => {
    const prev = queryClient.getQueryData<AppUser[]>(key)
    patchUser(uid, { isBanned: !banned })
    haptics.light()
    setUserBanned(uid, !banned)
      .then(() => toast.success(!banned ? 'Usuario suspendido' : 'Usuario reactivado'))
      .catch(() => {
        queryClient.setQueryData(key, prev)
        toast.error('Error')
      })
  }

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Usuarios" />
      {isLoading ? (
        <LoadingState fullScreen label="Cargando…" />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(u) => u.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={[styles.row, item.isBanned && { opacity: 0.6 }]}>
              <View style={styles.top}>
                <Avatar uri={item.photoURL} name={item.displayName} size={40} />
                <View style={styles.meta}>
                  <View style={styles.nameRow}>
                    <Text
                      style={[styles.name, { color: theme.colors.foreground }]}
                      numberOfLines={1}
                    >
                      {item.displayName || '(sin nombre)'}
                    </Text>
                    {item.isBanned ? (
                      <Text style={[styles.banned, { color: theme.colors.destructive }]}>
                        BANEADO
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    style={[styles.sub, { color: theme.colors.mutedForeground }]}
                    numberOfLines={1}
                  >
                    {item.email} · {item.businessIds?.length ?? 0} negocios ·{' '}
                    {formatRelativeTime(item.createdAt)}
                  </Text>
                </View>
                <IconButton
                  icon={
                    item.isBanned ? (
                      <CheckCircle2 size={16} color="#16a34a" />
                    ) : (
                      <Ban size={16} color={theme.colors.destructive} />
                    )
                  }
                  accessibilityLabel={item.isBanned ? 'Reactivar' : 'Suspender'}
                  variant="soft"
                  size="sm"
                  onPress={() => toggleBan(item.id, item.isBanned)}
                />
              </View>
              <Select
                value={item.role}
                options={ROLE_OPTIONS}
                onChange={(role) => changeRole(item.id, role)}
              />
            </Card>
          )}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.colors.mutedForeground }]}>
              Sin usuarios
            </Text>
          }
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10 },
  row: { gap: 10 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  meta: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  banned: { fontSize: 10, fontWeight: '700' },
  sub: { fontSize: 12, marginTop: 1 },
  empty: { textAlign: 'center', paddingVertical: 32 },
})
