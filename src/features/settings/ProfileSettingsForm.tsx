import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Switch } from '@/components/ui/Switch'
import { toast } from '@/components/overlay/toast'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/hooks/useAuth'
import { updateUserProfile } from '@/services/firestore'
import type { UserNotificationSettings } from '@/types/user'

const NOTIF_ROWS: { key: keyof UserNotificationSettings; label: string; desc: string }[] = [
  { key: 'email', label: 'Email', desc: 'Resúmenes y actualizaciones' },
  { key: 'push', label: 'Push', desc: 'Alertas en el dispositivo' },
  { key: 'newReviews', label: 'Nuevas reseñas', desc: 'Cuando califican tu negocio' },
  { key: 'newMessages', label: 'Mensajes', desc: 'Consultas de clientes' },
  { key: 'promotions', label: 'Promociones', desc: 'Ofertas y novedades de KRUZO' },
]

const DEFAULT_NOTIFS: UserNotificationSettings = {
  email: true,
  push: true,
  whatsapp: false,
  newReviews: true,
  newMessages: true,
  promotions: false,
}

export function ProfileSettingsForm() {
  const { theme } = useTheme()
  const { user, refreshUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [location, setLocation] = useState(user?.location ?? 'Santa Cruz de la Sierra')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [notifications, setNotifications] = useState<UserNotificationSettings>(
    user?.notifications ?? DEFAULT_NOTIFS,
  )

  const save = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateUserProfile(user.id, { displayName, phone, location, bio, notifications })
      await refreshUser()
      toast.success('Configuración guardada')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={styles.form}>
      <Card style={styles.section}>
        <Text style={[styles.heading, { color: theme.colors.foreground }]}>
          Información personal
        </Text>
        <Input
          label="Nombre"
          placeholder="Tu nombre"
          value={displayName}
          onChangeText={setDisplayName}
        />
        <Input
          label="Teléfono"
          placeholder="70000000"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <Input
          label="Ubicación"
          placeholder="Santa Cruz de la Sierra"
          value={location}
          onChangeText={setLocation}
        />
        <TextArea
          label="Bio"
          placeholder="Cuéntanos sobre ti…"
          value={bio}
          onChangeText={setBio}
          maxLength={300}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.heading, { color: theme.colors.foreground }]}>Notificaciones</Text>
        {NOTIF_ROWS.map((row) => (
          <View key={row.key} style={styles.toggleRow}>
            <View style={styles.toggleMeta}>
              <Text style={[styles.toggleLabel, { color: theme.colors.foreground }]}>
                {row.label}
              </Text>
              <Text style={[styles.toggleDesc, { color: theme.colors.mutedForeground }]}>
                {row.desc}
              </Text>
            </View>
            <Switch
              value={notifications[row.key]}
              onValueChange={(v) => setNotifications((n) => ({ ...n, [row.key]: v }))}
              accessibilityLabel={row.label}
            />
          </View>
        ))}
      </Card>

      <Button
        label={saving ? 'Guardando…' : 'Guardar cambios'}
        onPress={save}
        loading={saving}
        size="lg"
        fullWidth
      />
    </View>
  )
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  section: { gap: 12 },
  heading: { fontSize: 16, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleMeta: { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  toggleDesc: { fontSize: 12, marginTop: 1 },
})
