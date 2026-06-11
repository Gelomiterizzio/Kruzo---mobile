import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import {
  LayoutDashboard,
  Shield,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Bell,
  Settings,
} from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/providers/ThemeProvider'
import type { UserRole } from '@/types/user'

const ROLE_META: Record<UserRole, { label: string; variant: BadgeVariant }> = {
  user: { label: 'Usuario', variant: 'neutral' },
  entrepreneur: { label: 'Emprendedor', variant: 'primary' },
  admin: { label: 'Administrador', variant: 'gold' },
}

export default function ProfileScreen() {
  const router = useRouter()
  const { theme, scheme, setPreference } = useTheme()
  const { user, isAuthenticated, isAdmin, isEntrepreneur, signOut } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <Screen>
        <EmptyState
          title="Tu perfil"
          description="Inicia sesión para gestionar tu cuenta, negocios y favoritos."
          emoji="👤"
          actionLabel="Iniciar sesión"
          onAction={() => router.push('/login')}
        />
      </Screen>
    )
  }

  const role = ROLE_META[user.role]

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text
          style={[styles.heading, { color: theme.colors.foreground }]}
          accessibilityRole="header"
        >
          Perfil
        </Text>

        <Card style={styles.profileCard}>
          <Avatar uri={user.photoURL} name={user.displayName} size={64} ring />
          <View style={styles.profileMeta}>
            <Text style={[styles.name, { color: theme.colors.foreground }]} numberOfLines={1}>
              {user.displayName}
            </Text>
            <Text style={[styles.email, { color: theme.colors.mutedForeground }]} numberOfLines={1}>
              {user.email}
            </Text>
            <Badge label={role.label} variant={role.variant} style={styles.roleBadge} />
          </View>
        </Card>

        <Card padding={0} style={styles.menu}>
          {/* Auth-only, like web /dashboard: plain users enter to create their
              first business (a Cloud Function promotes them afterwards). */}
          <MenuRow
            icon={<LayoutDashboard size={18} color={theme.colors.primary} />}
            label={isEntrepreneur ? 'Panel de control' : 'Registra tu negocio'}
            onPress={() => router.push('/dashboard')}
          />
          {isAdmin ? (
            <MenuRow
              icon={<Shield size={18} color={theme.gold[600]} />}
              label="Administración"
              onPress={() => router.push('/admin')}
            />
          ) : null}
          <MenuRow
            icon={<Bell size={18} color={theme.colors.foreground} />}
            label="Notificaciones"
            onPress={() => router.push('/notifications')}
          />
          <MenuRow
            icon={<Settings size={18} color={theme.colors.foreground} />}
            label="Configuración"
            onPress={() => router.push('/settings')}
          />
          <MenuRow
            icon={
              scheme === 'dark' ? (
                <Sun size={18} color={theme.colors.foreground} />
              ) : (
                <Moon size={18} color={theme.colors.foreground} />
              )
            }
            label={scheme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
            onPress={() => setPreference(scheme === 'dark' ? 'light' : 'dark')}
            last
          />
        </Card>

        <Button
          label="Cerrar sesión"
          variant="outline"
          leftIcon={<LogOut size={16} color={theme.colors.destructive} />}
          onPress={signOut}
          style={styles.signOut}
        />
      </ScrollView>
    </Screen>
  )
}

function MenuRow({
  icon,
  label,
  onPress,
  last = false,
}: {
  icon: React.ReactNode
  label: string
  onPress: () => void
  last?: boolean
}) {
  const { theme } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.menuRow,
        !last && {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      {icon}
      <Text style={[styles.menuLabel, { color: theme.colors.foreground }]}>{label}</Text>
      <ChevronRight size={18} color={theme.colors.mutedForeground} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  heading: { fontSize: 28, fontWeight: '900' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  profileMeta: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontSize: 18, fontWeight: '800' },
  email: { fontSize: 13 },
  roleBadge: { marginTop: 6 },
  menu: { overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  signOut: { borderColor: 'transparent' },
})
