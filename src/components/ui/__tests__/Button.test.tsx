import { fireEvent } from '@testing-library/react-native'
import { Button } from '@/components/ui/Button'
import { renderWithTheme } from '@/test-utils/renderWithTheme'

// NOTE: @testing-library/react-native v14's `render` is async (React 19).
describe('Button', () => {
  it('renders its label and fires onPress', async () => {
    const onPress = jest.fn()
    const { getByText, getByRole } = await renderWithTheme(
      <Button label="Guardar" onPress={onPress} />,
    )
    expect(getByText('Guardar')).toBeTruthy()
    fireEvent.press(getByRole('button', { name: 'Guardar' }))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not fire onPress when disabled', async () => {
    const onPress = jest.fn()
    const { getByRole } = await renderWithTheme(
      <Button label="Enviar" onPress={onPress} disabled />,
    )
    fireEvent.press(getByRole('button', { name: 'Enviar' }))
    expect(onPress).not.toHaveBeenCalled()
  })

  it('does not fire onPress while loading', async () => {
    const onPress = jest.fn()
    const { getByRole } = await renderWithTheme(
      <Button label="Cargando" onPress={onPress} loading accessibilityLabel="cargar" />,
    )
    fireEvent.press(getByRole('button', { name: 'cargar' }))
    expect(onPress).not.toHaveBeenCalled()
  })
})
