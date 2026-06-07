import { forwardRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { useTheme } from '@/providers/ThemeProvider'

export interface TextAreaProps extends Omit<TextInputProps, 'style' | 'multiline'> {
  label?: string
  error?: string
  maxLength?: number
  showCount?: boolean
  minHeight?: number
  containerStyle?: StyleProp<ViewStyle>
}

export const TextArea = forwardRef<TextInput, TextAreaProps>(function TextArea(
  { label, error, maxLength, showCount = true, minHeight = 110, value, containerStyle, ...props },
  ref,
) {
  const { theme } = useTheme()
  const [focused, setFocused] = useState(false)
  const count = typeof value === 'string' ? value.length : 0

  const borderColor = error
    ? theme.colors.destructive
    : focused
      ? theme.colors.primary
      : theme.colors.border

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.foreground }]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.field,
          {
            borderColor,
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.lg,
            borderWidth: focused || error ? 1.5 : StyleSheet.hairlineWidth,
            minHeight,
          },
        ]}
      >
        <TextInput
          ref={ref}
          {...props}
          multiline
          textAlignVertical="top"
          maxLength={maxLength}
          value={value}
          style={[styles.input, { color: theme.colors.foreground, minHeight: minHeight - 20 }]}
          placeholderTextColor={theme.colors.mutedForeground}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          accessibilityLabel={label}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.helper, { color: theme.colors.destructive }]}>{error ?? ''}</Text>
        {showCount && maxLength ? (
          <Text style={[styles.helper, { color: theme.colors.mutedForeground }]}>
            {count}/{maxLength}
          </Text>
        ) : null}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  field: { paddingHorizontal: 12, paddingVertical: 10 },
  input: { fontSize: 15 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  helper: { fontSize: 12 },
})
