import * as Haptics from 'expo-haptics'

// Thin, fire-and-forget haptics wrapper. Adds premium tactile feedback to key
// actions (favorite, primary CTAs, destructive confirms). Errors are swallowed
// (e.g. unsupported device) so haptics never block an interaction.
const ignore = () => {}

export const haptics = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(ignore),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(ignore),
  selection: () => Haptics.selectionAsync().catch(ignore),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(ignore),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(ignore),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(ignore),
}
