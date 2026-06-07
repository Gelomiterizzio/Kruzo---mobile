import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { Search, X } from 'lucide-react-native'
import { useTheme } from '@/providers/ThemeProvider'

export interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  onSubmit?: () => void
  onClear?: () => void
  autoFocus?: boolean
  testID?: string
  style?: StyleProp<ViewStyle>
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar negocio, servicio…',
  onSubmit,
  onClear,
  autoFocus = false,
  testID,
  style,
}: SearchBarProps) {
  const { theme } = useTheme()

  const handleClear = () => {
    onChangeText('')
    onClear?.()
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.muted,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.full,
        },
        style,
      ]}
    >
      <Search size={18} color={theme.colors.mutedForeground} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mutedForeground}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCorrect={false}
        style={[styles.input, { color: theme.colors.foreground }]}
        accessibilityLabel="Campo de búsqueda"
        testID={testID}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={handleClear}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
        >
          <X size={16} color={theme.colors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
})
