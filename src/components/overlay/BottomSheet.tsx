import { Modal, View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'

export interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  /** Percentage strings ('55%') or absolute numbers; the max becomes the sheet height cap. */
  snapPoints?: (string | number)[]
  title?: string
}

// Themed bottom sheet over React Native's core Modal. This replaced the
// @gorhom/bottom-sheet implementation: in RELEASE builds (RN 0.79 + new arch)
// BottomSheetModal.present() silently never mounted the sheet — verified via
// uiautomator on the production APK — which blocked the required Zona select in
// the business form (no business could ever be created) and the explore zone
// filter. The core Modal has no such failure mode; we keep the same props so
// Select/Explore need no changes (drag-to-dismiss is traded for reliability).
export function BottomSheet({
  visible,
  onClose,
  children,
  snapPoints = ['50%'],
  title,
}: BottomSheetProps) {
  const { theme } = useTheme()
  const { height: windowHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  const maxHeight = Math.max(
    ...snapPoints.map((p) =>
      typeof p === 'number' ? p : (parseFloat(p) / 100) * windowHeight || windowHeight * 0.5,
    ),
  )

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
      />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.colors.card,
            maxHeight,
            paddingBottom: 32 + insets.bottom,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
        {title ? (
          <Text style={[styles.title, { color: theme.colors.foreground }]}>{title}</Text>
        ) : null}
        {children}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  title: { fontSize: 17, fontWeight: '700' },
})
