import { useLocalSearchParams } from 'expo-router'
import { PlaceholderScreen } from '@/components/feedback/PlaceholderScreen'

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <PlaceholderScreen title="Publicación" note={`Detalle (${id}) + CTA WhatsApp — Fase 3.`} />
}
