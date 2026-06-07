import { Component, type ReactNode } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

// Last-resort error boundary wrapping the whole app (above the providers), so it
// uses self-contained styles instead of the theme. Catches render-time crashes
// and offers a retry instead of a white screen.
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    logger.error(error, { componentStack: info.componentStack ?? undefined })
  }

  private reset = () => this.setState({ error: null })

  override render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>😕</Text>
        <Text style={styles.title}>Algo salió mal</Text>
        <Text style={styles.message}>
          Ocurrió un error inesperado. Puedes reintentar; si persiste, reinicia la app.
        </Text>
        <Pressable style={styles.button} onPress={this.reset}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fffaf5',
    gap: 10,
  },
  emoji: { fontSize: 44 },
  title: { fontSize: 20, fontWeight: '700', color: '#1a120c' },
  message: { fontSize: 14, color: '#6b5b4f', textAlign: 'center', maxWidth: 320 },
  button: {
    marginTop: 8,
    backgroundColor: '#ff4500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
})
