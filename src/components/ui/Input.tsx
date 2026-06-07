import { forwardRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { Eye, EyeOff } from 'lucide-react-native'
import { useTheme } from '@/providers/ThemeProvider'

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerStyle?: StyleProp<ViewStyle>
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, leftIcon, rightIcon, secureTextEntry, containerStyle, ...props },
  ref,
) {
  const { theme } = useTheme()
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(!!secureTextEntry)

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
          },
        ]}
      >
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
        <TextInput
          ref={ref}
          {...props}
          style={[styles.input, { color: theme.colors.foreground }]}
          placeholderTextColor={theme.colors.mutedForeground}
          secureTextEntry={hidden}
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
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            style={styles.iconRight}
          >
            {hidden ? (
              <EyeOff size={18} color={theme.colors.mutedForeground} />
            ) : (
              <Eye size={18} color={theme.colors.mutedForeground} />
            )}
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.iconRight}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.helper, { color: theme.colors.destructive }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.helper, { color: theme.colors.mutedForeground }]}>{hint}</Text>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  field: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: 12 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  helper: { fontSize: 12, marginTop: 5 },
})
