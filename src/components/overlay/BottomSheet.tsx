import { useEffect, useRef, useCallback } from 'react'
import { Text, StyleSheet } from 'react-native'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import { useTheme } from '@/providers/ThemeProvider'

export interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  snapPoints?: (string | number)[]
  title?: string
}

// Themed wrapper over @gorhom/bottom-sheet's modal. Controlled via `visible`.
// Requires <BottomSheetModalProvider> at the root (wired in app/_layout).
export function BottomSheet({
  visible,
  onClose,
  children,
  snapPoints = ['50%'],
  title,
}: BottomSheetProps) {
  const { theme } = useTheme()
  const ref = useRef<BottomSheetModal>(null)

  useEffect(() => {
    if (visible) ref.current?.present()
    else ref.current?.dismiss()
  }, [visible])

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    [],
  )

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.card }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
    >
      <BottomSheetView style={styles.content}>
        {title ? (
          <Text style={[styles.title, { color: theme.colors.foreground }]}>{title}</Text>
        ) : null}
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32, gap: 12 },
  title: { fontSize: 17, fontWeight: '700' },
})
