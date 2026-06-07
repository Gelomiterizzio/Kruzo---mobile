import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Sun, Moon, Bell } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { IconButton } from '@/components/ui/IconButton'
import { Avatar } from '@/components/ui/Avatar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { HomeHero } from '@/features/home/HomeHero'
import { CategoryGrid } from '@/features/home/CategoryGrid'
import { FeaturedRow } from '@/features/home/FeaturedRow'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME } from '@/constants'

export default function HomeScreen() {
  const { theme, scheme, setPreference } = useTheme()
  const router = useRouter()
  const { user } = useAuth()

  return (
    <Screen edges={['top']} padded={false}>
      {/* Top bar */}
      <View style={styles.topbar}>
        <Text style={[styles.wordmark, { color: theme.colors.primary }]}>{APP_NAME}</Text>
        <View style={styles.topActions}>
          <IconButton
            icon={
              scheme === 'dark' ? (
                <Sun size={20} color={theme.colors.foreground} />
              ) : (
                <Moon size={20} color={theme.colors.foreground} />
              )
            }
            accessibilityLabel="Cambiar tema"
            onPress={() => setPreference(scheme === 'dark' ? 'light' : 'dark')}
          />
          {user ? (
            <IconButton
              icon={<Avatar uri={user.photoURL} name={user.displayName} size={30} />}
              accessibilityLabel="Mi perfil"
              onPress={() => router.push('/profile')}
            />
          ) : (
            <IconButton
              icon={<Bell size={20} color={theme.colors.foreground} />}
              accessibilityLabel="Entrar"
              onPress={() => router.push('/login')}
            />
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HomeHero />

        <View style={styles.section}>
          <SectionHeader
            title="Explorar categorías"
            subtitle="Encuentra lo que necesitas"
            actionLabel="Ver todas"
            onActionPress={() => router.push('/explore')}
          />
          <View style={styles.categoryWrap}>
            <CategoryGrid />
          </View>
        </View>

        <FeaturedRow title="Negocios destacados" subtitle="Seleccionados para ti" featured />
        <FeaturedRow title="Comida & Repostería" category="comida" />
        <FeaturedRow title="Servicios técnicos" category="servicios" />
        <FeaturedRow title="Tecnología" category="tecnologia" />

        <View style={styles.bottomSpace} />
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  wordmark: { fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  content: { paddingBottom: 8, gap: 8 },
  section: { paddingHorizontal: 16, gap: 12, marginTop: 8 },
  categoryWrap: { marginTop: 2 },
  bottomSpace: { height: 16 },
})
