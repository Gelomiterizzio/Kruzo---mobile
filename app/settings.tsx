import { ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { LogOut } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ProfileSettingsForm } from '@/features/settings/ProfileSettingsForm'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/providers/ThemeProvider'

export default function SettingsScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { isAuthenticated, signOut } = useAuth()

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Configuración" />
      {!isAuthenticated ? (
        <EmptyState
          title="Configuración"
          description="Inicia sesión para administrar tu cuenta."
          emoji="⚙️"
          actionLabel="Iniciar sesión"
          onAction={() => router.push('/login')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ProfileSettingsForm />
          <Button
            label="Cerrar sesión"
            variant="outline"
            leftIcon={<LogOut size={16} color={theme.colors.destructive} />}
            onPress={signOut}
          />
        </ScrollView>
      )}
    </Screen>
  )
}
