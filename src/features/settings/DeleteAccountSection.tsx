import { useState } from 'react'
import { View, Text, Alert, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Trash2 } from 'lucide-react-native'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/overlay/toast'
import { useTheme } from '@/providers/ThemeProvider'
import { deleteMyAccount } from '@/services/account'
import { googleSignOut } from '@/services/googleSignIn'

// Play Store policy: an in-app, clearly-labelled path to delete the account and
// its data. Deletion is privileged (Cloud Function) so it works without a recent
// re-login, unlike the client-side user.delete(). Double confirmation because it
// is irreversible.
export function DeleteAccountSection() {
  const { theme } = useTheme()
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const runDelete = async () => {
    setDeleting(true)
    try {
      await deleteMyAccount()
      await googleSignOut().catch(() => {})
      toast.success('Tu cuenta fue eliminada.')
      // AuthProvider's onAuthChange clears the session; send the user home.
      router.replace('/')
    } catch {
      toast.error('No se pudo eliminar la cuenta. Inténtalo de nuevo.')
      setDeleting(false)
    }
  }

  const confirm = () => {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción es permanente. Se eliminarán tu cuenta, tus negocios, publicaciones y reseñas. No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: runDelete },
      ],
    )
  }

  return (
    <View style={[styles.zone, { borderColor: theme.colors.destructive }]}>
      <Text style={[styles.title, { color: theme.colors.destructive }]}>Zona de peligro</Text>
      <Text style={[styles.body, { color: theme.colors.mutedForeground }]}>
        Eliminar tu cuenta borra de forma permanente tu perfil y todo tu contenido en KRUZO.
      </Text>
      <Button
        label="Eliminar cuenta"
        variant="destructive"
        leftIcon={<Trash2 size={16} color="#fff" />}
        onPress={confirm}
        loading={deleting}
        disabled={deleting}
        accessibilityLabel="Eliminar mi cuenta permanentemente"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  zone: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 16, gap: 10, marginTop: 8 },
  title: { fontSize: 15, fontWeight: '800' },
  body: { fontSize: 13, lineHeight: 18 },
})
