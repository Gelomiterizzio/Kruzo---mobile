import { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Screen } from '@/components/layout/Screen'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/providers/ThemeProvider'
import { loginSchema, type LoginFormValues } from '@/utils/validators'

export default function LoginScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { loginEmail, loginGoogle, error } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginEmail(data.email, data.password)
      router.replace('/')
    } catch {
      /* handled in hook */
    }
  }

  const onGoogle = async () => {
    setGoogleLoading(true)
    try {
      await loginGoogle()
      router.replace('/')
    } catch {
      /* handled in hook */
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>Bienvenido de vuelta</Text>
        <Text style={[styles.sub, { color: theme.colors.mutedForeground }]}>
          Inicia sesión para acceder a tu cuenta
        </Text>

        <Button
          label="Continuar con Google"
          variant="outline"
          onPress={onGoogle}
          loading={googleLoading}
          fullWidth
        />

        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.or, { color: theme.colors.mutedForeground }]}>o con email</Text>
          <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: theme.colors.destructive + '1A' }]}>
            <Text style={{ color: theme.colors.destructive, fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              placeholder="tu@email.com"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input
              placeholder="Contraseña"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              secureTextEntry
              autoComplete="current-password"
              error={errors.password?.message}
            />
          )}
        />

        <Pressable onPress={() => router.push('/forgot-password')} style={styles.forgot}>
          <Text style={{ color: theme.colors.primary, fontSize: 13 }}>
            ¿Olvidaste tu contraseña?
          </Text>
        </Pressable>

        <Button
          label={isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          fullWidth
        />

        <View style={styles.footer}>
          <Text style={{ color: theme.colors.mutedForeground }}>¿No tienes cuenta? </Text>
          <Pressable onPress={() => router.replace('/register')}>
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
              Regístrate gratis
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800' },
  sub: { fontSize: 14, marginTop: -8, marginBottom: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 2 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  or: { fontSize: 12 },
  errorBox: { padding: 12, borderRadius: 12 },
  forgot: { alignSelf: 'flex-end' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
})
