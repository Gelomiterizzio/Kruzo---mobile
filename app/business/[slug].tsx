import { useLocalSearchParams } from 'expo-router'
import { PlaceholderScreen } from '@/components/feedback/PlaceholderScreen'

export default function BusinessDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  return (
    <PlaceholderScreen
      title="Negocio"
      note={`Perfil (${slug}): galería, reseñas, info, mapa — Fase 3.`}
    />
  )
}
