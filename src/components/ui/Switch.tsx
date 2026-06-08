import { Switch as RNSwitch } from 'react-native'
import { useTheme } from '@/providers/ThemeProvider'

export interface SwitchProps {
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
  accessibilityLabel?: string
}

// Themed wrapper over RN's Switch (uses the OS-native, accessible control).
export function Switch({ value, onValueChange, disabled, accessibilityLabel }: SwitchProps) {
  const { theme } = useTheme()
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
      thumbColor="#ffffff"
      ios_backgroundColor={theme.colors.border}
      accessibilityLabel={accessibilityLabel}
    />
  )
}
