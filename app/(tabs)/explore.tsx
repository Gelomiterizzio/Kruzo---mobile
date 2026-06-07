import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SlidersHorizontal } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Chip } from '@/components/ui/Chip'
import { BottomSheet } from '@/components/overlay/BottomSheet'
import { BusinessGrid } from '@/features/business/BusinessGrid'
import { useTheme } from '@/providers/ThemeProvider'
import { BUSINESS_CATEGORIES, SCZ_ZONES } from '@/constants'

export default function ExploreScreen() {
  const { theme } = useTheme()
  const params = useLocalSearchParams<{ cat?: string; filter?: string; zone?: string }>()
  const [cat, setCat] = useState<string | undefined>(params.cat)
  const [zone, setZone] = useState<string | undefined>(params.zone)
  const [zoneSheet, setZoneSheet] = useState(false)
  const featured = params.filter === 'featured'

  const header = (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>Explorar</Text>
      <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
        Negocios y emprendimientos de Santa Cruz
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip label="Todas" selected={!cat} onPress={() => setCat(undefined)} />
        {BUSINESS_CATEGORIES.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            emoji={c.emoji}
            selected={cat === c.key}
            onPress={() => setCat(cat === c.key ? undefined : c.key)}
          />
        ))}
      </ScrollView>

      <View style={styles.zoneRow}>
        <Chip
          label={zone ? `Zona: ${zone}` : 'Filtrar por zona'}
          leftIcon={
            <SlidersHorizontal
              size={13}
              color={zone ? theme.colors.primaryForeground : theme.colors.foreground}
            />
          }
          selected={!!zone}
          onPress={() => setZoneSheet(true)}
        />
        {zone ? <Chip label="Limpiar" onPress={() => setZone(undefined)} /> : null}
      </View>
    </View>
  )

  return (
    <Screen edges={['top']} padded={false}>
      <BusinessGrid
        category={cat}
        zone={zone}
        featured={featured ? true : undefined}
        ListHeaderComponent={header}
      />

      <BottomSheet
        visible={zoneSheet}
        onClose={() => setZoneSheet(false)}
        title="Selecciona una zona"
        snapPoints={['55%']}
      >
        <View style={styles.zoneWrap}>
          <Chip
            label="Todas las zonas"
            selected={!zone}
            onPress={() => {
              setZone(undefined)
              setZoneSheet(false)
            }}
          />
          {SCZ_ZONES.map((z) => (
            <Chip
              key={z}
              label={z}
              selected={zone === z}
              onPress={() => {
                setZone(z)
                setZoneSheet(false)
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, gap: 10 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, marginTop: -6 },
  chips: { gap: 8, paddingVertical: 4 },
  zoneRow: { flexDirection: 'row', gap: 8 },
  zoneWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
})
