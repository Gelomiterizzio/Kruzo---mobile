import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native'
import { useTheme } from '@/providers/ThemeProvider'
import type { Theme } from '@/theme'
import { useToastStore, type ToastItem, type ToastType } from './toastStore'

// Renders the toast queue near the top, above content. Mounted once in
// app/_layout. Each toast auto-dismisses after its duration.
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts)
  const insets = useSafeAreaInsets()

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 8 }]}>
      {toasts.map((t) => (
        <ToastView key={t.id} item={t} />
      ))}
    </View>
  )
}

function accent(theme: Theme, type: ToastType): string {
  if (type === 'success') return '#16a34a'
  if (type === 'error') return theme.colors.destructive
  return theme.colors.primary
}

function ToastView({ item }: { item: ToastItem }) {
  const { theme } = useTheme()
  const dismiss = useToastStore((s) => s.dismiss)
  const color = accent(theme, item.type)

  useEffect(() => {
    const id = setTimeout(() => dismiss(item.id), item.duration)
    return () => clearTimeout(id)
  }, [item.id, item.duration, dismiss])

  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      exiting={FadeOutUp.duration(180)}
      accessibilityRole="alert"
      style={[
        styles.toast,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderLeftColor: color,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      {item.type === 'success' ? (
        <CheckCircle2 size={18} color={color} />
      ) : item.type === 'error' ? (
        <AlertCircle size={18} color={color} />
      ) : (
        <Info size={18} color={color} />
      )}
      <Text style={[styles.message, { color: theme.colors.foreground }]} numberOfLines={2}>
        {item.message}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, zIndex: 1000, gap: 8 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  message: { flex: 1, fontSize: 14, fontWeight: '500' },
})
