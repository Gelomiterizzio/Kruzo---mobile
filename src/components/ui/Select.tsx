import { useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { ChevronDown, Check } from 'lucide-react-native'
import { BottomSheet } from '@/components/overlay/BottomSheet'
import { useTheme } from '@/providers/ThemeProvider'

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps {
  label?: string
  value?: string
  placeholder?: string
  options: SelectOption[]
  onChange: (value: string) => void
  error?: string
}

// A select rendered as a tappable field that opens a themed bottom sheet list.
export function Select({
  label,
  value,
  placeholder = 'Seleccionar…',
  options,
  onChange,
  error,
}: SelectProps) {
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <View>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.foreground }]}>{label}</Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        style={[
          styles.field,
          {
            borderColor: error ? theme.colors.destructive : theme.colors.border,
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.lg,
          },
        ]}
      >
        <Text
          style={{
            flex: 1,
            color: selected ? theme.colors.foreground : theme.colors.mutedForeground,
          }}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={18} color={theme.colors.mutedForeground} />
      </Pressable>
      {error ? (
        <Text style={[styles.error, { color: theme.colors.destructive }]}>{error}</Text>
      ) : null}

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label} snapPoints={['70%']}>
        <ScrollView style={styles.list}>
          {options.map((o) => {
            const active = o.value === value
            return (
              <Pressable
                key={o.value}
                onPress={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.option, { borderBottomColor: theme.colors.border }]}
              >
                <Text
                  style={{
                    flex: 1,
                    color: active ? theme.colors.primary : theme.colors.foreground,
                    fontWeight: active ? '700' : '400',
                  }}
                >
                  {o.label}
                </Text>
                {active ? <Check size={18} color={theme.colors.primary} /> : null}
              </Pressable>
            )
          })}
        </ScrollView>
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  error: { fontSize: 12, marginTop: 5 },
  list: { maxHeight: 400 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
})
