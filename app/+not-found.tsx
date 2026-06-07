import { Link, Stack } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/providers/ThemeProvider'

export default function NotFoundScreen() {
  const { theme } = useTheme()
  return (
    <>
      <Stack.Screen options={{ title: 'No encontrado' }} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>
          Esta pantalla no existe.
        </Text>
        <Link href="/" style={[styles.link, { color: theme.colors.primary }]}>
          Volver al inicio
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 12 },
  title: { fontSize: 18, fontWeight: '600' },
  link: { fontSize: 15, fontWeight: '600' },
})
