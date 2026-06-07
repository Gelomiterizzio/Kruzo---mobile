import { View, Text, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '@/providers/ThemeProvider'
import { getInitials } from '@/utils/formatters'

export interface AvatarProps {
  uri?: string | null
  name?: string
  size?: number
  ring?: boolean
  testID?: string
}

export function Avatar({ uri, name = '', size = 40, ring = false, testID }: AvatarProps) {
  const { theme } = useTheme()
  const radius = theme.radius.full

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    borderWidth: ring ? 2 : 0,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.muted,
  }

  return (
    <View
      style={[styles.container, containerStyle]}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={name ? `Avatar de ${name}` : 'Avatar'}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: radius }}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
        />
      ) : (
        <Text
          style={[
            styles.initials,
            { color: theme.colors.primary, fontSize: Math.round(size * 0.4) },
          ]}
        >
          {getInitials(name || '?')}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: { fontWeight: '700' },
})
