import { render, type RenderOptions } from '@testing-library/react-native'
import { ThemeProvider } from '@/providers/ThemeProvider'

// Renders a component inside the Theme context so DS components that call
// useTheme() work in tests.
export function renderWithTheme(ui: React.ReactElement, options?: RenderOptions) {
  return render(<ThemeProvider>{ui}</ThemeProvider>, options)
}
