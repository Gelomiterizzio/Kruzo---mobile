import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { Image } from 'expo-image'
import * as ExpoImagePicker from 'expo-image-picker'
import { X, ImagePlus } from 'lucide-react-native'
import { useTheme } from '@/providers/ThemeProvider'
import { logger } from '@/lib/logger'

export interface ImagePickerFieldProps {
  label?: string
  maxFiles?: number
  /** Already-uploaded image URLs (shown as "current" until new ones are picked). */
  existing?: string[]
  /** Newly-picked local URIs (controlled). */
  value: string[]
  onChange: (uris: string[]) => void
}

// Replaces the web dropzone ImageUpload. Uses expo-image-picker to select local
// images; the parent uploads them on submit (services/storage). Mirrors web:
// picking new images replaces the existing ones on save.
export function ImagePickerField({
  label,
  maxFiles = 5,
  existing = [],
  value,
  onChange,
}: ImagePickerFieldProps) {
  const { theme } = useTheme()

  const pick = async () => {
    try {
      const perm = await ExpoImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Permiso requerido', 'Concede acceso a tus fotos para subir imágenes.')
        return
      }
      const remaining = Math.max(1, maxFiles - value.length)
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: maxFiles > 1,
        selectionLimit: remaining,
        quality: 0.8,
      })
      if (!result.canceled) {
        const uris = result.assets.map((a) => a.uri)
        onChange([...value, ...uris].slice(0, maxFiles))
      }
    } catch (e) {
      logger.warn('image pick failed', e)
      Alert.alert('Error', 'No se pudo seleccionar la imagen.')
    }
  }

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const showExisting = value.length === 0 && existing.length > 0

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.foreground }]}>{label}</Text>
      ) : null}
      <View style={styles.grid}>
        {showExisting
          ? existing.map((url, i) => (
              <View key={`e-${i}`} style={styles.thumb}>
                <Image source={{ uri: url }} style={styles.img} contentFit="cover" />
                <View style={styles.currentTag}>
                  <Text style={styles.currentText}>Actual</Text>
                </View>
              </View>
            ))
          : null}
        {value.map((uri, i) => (
          <View key={uri} style={styles.thumb}>
            <Image source={{ uri }} style={styles.img} contentFit="cover" />
            <Pressable
              onPress={() => remove(i)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Quitar imagen"
              style={styles.removeBtn}
            >
              <X size={12} color="#fff" />
            </Pressable>
          </View>
        ))}
        {value.length < maxFiles ? (
          <Pressable
            onPress={pick}
            accessibilityRole="button"
            accessibilityLabel="Agregar imagen"
            style={[styles.addBtn, { borderColor: theme.colors.border }]}
          >
            <ImagePlus size={22} color={theme.colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

const SIZE = 86

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumb: { width: SIZE, height: SIZE, borderRadius: 12, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 9999,
    padding: 3,
  },
  currentTag: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  currentText: { color: '#fff', fontSize: 9, fontWeight: '600' },
  addBtn: {
    width: SIZE,
    height: SIZE,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
