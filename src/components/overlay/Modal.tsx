import { Modal as RNModal, View, Text, Pressable, StyleSheet } from 'react-native'
import { X } from 'lucide-react-native'
import { useTheme } from '@/providers/ThemeProvider'
import { IconButton } from '@/components/ui/IconButton'

export interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  dismissable?: boolean
}

// Centered themed dialog. Uses the platform Modal (robust focus/back-button
// handling on Android) with a fade transition + tap-outside to dismiss.
export function Modal({ visible, onClose, title, children, dismissable = true }: ModalProps) {
  const { theme } = useTheme()
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={dismissable ? onClose : undefined}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
      >
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderRadius: theme.radius['2xl'],
            },
          ]}
          // Stop propagation so taps inside the card don't dismiss.
          onPress={() => {}}
        >
          {(title || dismissable) && (
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.foreground }]} numberOfLines={1}>
                {title ?? ''}
              </Text>
              {dismissable ? (
                <IconButton
                  icon={<X size={18} color={theme.colors.mutedForeground} />}
                  accessibilityLabel="Cerrar"
                  onPress={onClose}
                  size="sm"
                />
              ) : null}
            </View>
          )}
          <View>{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: { width: '100%', maxWidth: 420, borderWidth: StyleSheet.hairlineWidth, padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: '700', flex: 1 },
})
