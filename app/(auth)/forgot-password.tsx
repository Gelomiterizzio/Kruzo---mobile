import { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/providers/ThemeProvider'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { sendReset } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async () => {
    if (!email) {
      setError('Ingresa tu email')
      return
    }
    setError('')
    setLoading(true)
    const ok = await sendReset(email)
    setLoading(false)
    if (ok) setSent(true)
    else setError('No se encontró una cuenta con ese email')
  }

  if (sent) {
    return (
      <Screen>
        <View style={styles.success}>
          <View style={[styles.successIcon, { backgroundColor: '#dcfce7' }]}>
            <CheckCircle2 size={32} color="#16a34a" />
          </View>
          <Text style={[styles.title, { color: theme.colors.foreground }]}>¡Email enviado!</Text>
          <Text style={[styles.sub, { color: theme.colors.mutedForeground }]}>
            Revisa tu bandeja de entrada en {email} y sigue las instrucciones para restablecer tu
            contraseña.
          </Text>
          <Button
            label="Volver al inicio de sesión"
            onPress={() => router.replace('/login')}
            fullWidth
          />
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={16} color={theme.colors.mutedForeground} />
          <Text style={{ color: theme.colors.mutedForeground, fontSize: 14 }}>Volver</Text>
        </Pressable>

        <Text style={[styles.title, { color: theme.colors.foreground }]}>Recuperar contraseña</Text>
        <Text style={[styles.sub, { color: theme.colors.mutedForeground }]}>
          Te enviaremos un enlace para restablecer tu contraseña
        </Text>

        <Input
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={error || undefined}
        />

        <Button
          label={loading ? 'Enviando…' : 'Enviar enlace'}
          onPress={onSubmit}
          loading={loading}
          fullWidth
        />
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800' },
  sub: { fontSize: 14, marginTop: -8, marginBottom: 4, lineHeight: 20 },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 8 },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
