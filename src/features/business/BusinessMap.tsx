import { View, StyleSheet } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/providers/ThemeProvider'
import { openMaps } from '@/utils/contact'
import { SCZ_CENTER } from '@/constants'
import type { Business } from '@/types/business'

export interface BusinessMapProps {
  business: Business
  height?: number
}

// Static map preview (pointerEvents none so it never fights the page scroll) +
// a button that hands off to the native Maps app for full interaction.
export function BusinessMap({ business, height = 260 }: BusinessMapProps) {
  const { theme } = useTheme()
  const coords = business.coordinates

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.mapWrap,
          { height, borderColor: theme.colors.border, borderRadius: theme.radius.xl },
        ]}
        pointerEvents="none"
      >
        <MapView
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: coords?.lat ?? SCZ_CENTER.lat,
            longitude: coords?.lng ?? SCZ_CENTER.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {coords ? (
            <Marker
              coordinate={{ latitude: coords.lat, longitude: coords.lng }}
              title={business.name}
              description={business.address}
            />
          ) : null}
        </MapView>
      </View>

      <Button
        label="Abrir en Google Maps"
        variant="outline"
        onPress={() =>
          openMaps({
            lat: coords?.lat,
            lng: coords?.lng,
            label: `${business.name} ${business.address}`.trim(),
          })
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  mapWrap: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
})
