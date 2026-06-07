import { useLocalSearchParams } from 'expo-router'
import { PlaceholderScreen } from '@/components/feedback/PlaceholderScreen'

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <PlaceholderScreen title="Perfil de usuario" note={`Perfil público (${id}) — Fase 3.`} />
}
