import { useState } from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { Heart, Plus, Search as SearchIcon } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import {
  Button,
  IconButton,
  Card,
  Avatar,
  Badge,
  Chip,
  Input,
  TextArea,
  SearchBar,
  RatingStars,
  Skeleton,
  SectionHeader,
  Tabs,
} from '@/components/ui'
import { EmptyState, LoadingState } from '@/components/feedback'
import { Modal, BottomSheet, toast } from '@/components/overlay'
import { BusinessCard } from '@/features/business/BusinessCard'
import { useTheme } from '@/providers/ThemeProvider'
import { BUSINESS_CATEGORIES } from '@/constants'
import type { Business } from '@/types/business'

// Living catalog of the Design System. Serves as visual QA + documentation and
// ensures every component is reachable by the bundler. (Dev/QA route.)
const MOCK_BUSINESS = {
  id: 'demo',
  slug: 'pizzeria-centro',
  name: 'Pizzería Centro',
  category: ['comida'],
  zone: 'Centro',
  logo: '',
  coverImage: '',
  rating: 4.5,
  reviewCount: 128,
  isFeatured: true,
  isVerified: true,
} as unknown as Business

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>
}

export default function DesignSystemScreen() {
  const { theme } = useTheme()
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('comida')
  const [tab, setTab] = useState(0)
  const [rating, setRating] = useState(4)
  const [modal, setModal] = useState(false)
  const [sheet, setSheet] = useState(false)

  const label = { color: theme.colors.mutedForeground, fontSize: 12, fontWeight: '600' as const }

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.h1, { color: theme.colors.foreground }]}>Design System</Text>

        <SectionHeader title="Buttons" />
        <Row>
          <Button label="Primary" onPress={() => {}} />
          <Button label="Secondary" variant="secondary" onPress={() => {}} />
          <Button label="Outline" variant="outline" onPress={() => {}} />
        </Row>
        <Row>
          <Button label="Ghost" variant="ghost" onPress={() => {}} />
          <Button label="Destructive" variant="destructive" onPress={() => {}} />
          <Button label="Loading" loading onPress={() => {}} />
        </Row>
        <Row>
          <Button label="Sm" size="sm" onPress={() => {}} />
          <Button label="Md" size="md" onPress={() => {}} />
          <Button
            label="Lg"
            size="lg"
            leftIcon={<Plus size={16} color="#fff" />}
            onPress={() => {}}
          />
        </Row>

        <SectionHeader title="IconButton" />
        <Row>
          <IconButton
            icon={<Heart size={18} color={theme.colors.primary} />}
            accessibilityLabel="favorito"
            variant="soft"
          />
          <IconButton
            icon={<SearchIcon size={18} color={theme.colors.foreground} />}
            accessibilityLabel="buscar"
            variant="outline"
          />
          <IconButton
            icon={<Plus size={18} color="#fff" />}
            accessibilityLabel="agregar"
            variant="solid"
          />
        </Row>

        <SectionHeader title="Inputs" />
        <Input label="Nombre" placeholder="Tu nombre" />
        <Input label="Contraseña" placeholder="••••••" secureTextEntry hint="Mínimo 6 caracteres" />
        <Input label="Con error" placeholder="email" error="Email inválido" />
        <TextArea label="Descripción" placeholder="Cuéntanos…" maxLength={200} />
        <SearchBar value={search} onChangeText={setSearch} />

        <SectionHeader title="Badges" />
        <Row>
          <Badge label="Neutral" />
          <Badge label="Primary" variant="primary" />
          <Badge label="Activo" variant="success" />
          <Badge label="Pendiente" variant="warning" />
          <Badge label="Suspendido" variant="danger" />
          <Badge label="⭐ Destacado" variant="gold" />
        </Row>

        <SectionHeader title="Chips (categorías)" />
        <Row>
          {BUSINESS_CATEGORIES.slice(0, 5).map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              emoji={c.emoji}
              selected={selectedCat === c.key}
              onPress={() => setSelectedCat(c.key)}
            />
          ))}
        </Row>

        <SectionHeader title="Avatar · RatingStars" />
        <Row>
          <Avatar name="Ana López" size={48} ring />
          <Avatar name="JK" size={40} />
          <View style={styles.col}>
            <RatingStars value={4.5} />
            <RatingStars value={rating} readonly={false} onChange={setRating} size={24} />
          </View>
        </Row>

        <SectionHeader title="Tabs" />
        <Tabs
          items={['Publicaciones', 'Reseñas', 'Información', 'Mapa']}
          value={tab}
          onChange={setTab}
        />

        <SectionHeader title="Skeleton" />
        <View style={styles.col}>
          <Skeleton width="60%" height={20} />
          <Skeleton width="100%" height={14} />
          <Skeleton width="80%" height={14} />
        </View>

        <SectionHeader title="Card" />
        <Card elevated>
          <Text style={{ color: theme.colors.foreground, fontWeight: '700' }}>Card elevada</Text>
          <Text style={{ color: theme.colors.mutedForeground, marginTop: 4 }}>
            Contenedor base con sombra y borde temáticos.
          </Text>
        </Card>
        <Card onPress={() => toast.info('Card presionada')}>
          <Text style={{ color: theme.colors.foreground }}>
            Card presionable (animación de escala)
          </Text>
        </Card>

        <SectionHeader title="BusinessCard" />
        <BusinessCard business={MOCK_BUSINESS} onPress={() => {}} />

        <SectionHeader title="Overlays" />
        <Row>
          <Button
            label="Toast éxito"
            variant="outline"
            onPress={() => toast.success('¡Guardado!')}
          />
          <Button label="Toast error" variant="outline" onPress={() => toast.error('Algo falló')} />
        </Row>
        <Row>
          <Button label="Abrir Modal" variant="secondary" onPress={() => setModal(true)} />
          <Button label="Abrir Sheet" variant="secondary" onPress={() => setSheet(true)} />
        </Row>

        <SectionHeader title="States" />
        <Text style={label}>LoadingState</Text>
        <LoadingState label="Cargando negocios…" />
        <Text style={label}>EmptyState</Text>
        <EmptyState
          title="No hay negocios aquí"
          description="Sé el primero en registrar tu negocio."
          actionLabel="Registrar negocio"
          onAction={() => {}}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={modal} onClose={() => setModal(false)} title="Modal de ejemplo">
        <Text style={{ color: theme.colors.foreground }}>Contenido del modal.</Text>
        <Button label="Cerrar" onPress={() => setModal(false)} style={{ marginTop: 16 }} />
      </Modal>

      <BottomSheet visible={sheet} onClose={() => setSheet(false)} title="Bottom Sheet">
        <Text style={{ color: theme.colors.mutedForeground }}>Contenido del sheet.</Text>
        <Button label="Cerrar" onPress={() => setSheet(false)} />
      </BottomSheet>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  h1: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  col: { gap: 8 },
})
