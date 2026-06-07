import { fireEvent } from '@testing-library/react-native'
import { Chip } from '@/components/ui/Chip'
import { Badge } from '@/components/ui/Badge'
import { renderWithTheme } from '@/test-utils/renderWithTheme'

describe('Chip', () => {
  it('reflects selected state via accessibilityState and fires onPress', async () => {
    const onPress = jest.fn()
    const { getByRole } = await renderWithTheme(<Chip label="Comida" selected onPress={onPress} />)
    const chip = getByRole('button', { name: 'Comida' })
    expect(chip.props.accessibilityState).toMatchObject({ selected: true })
    fireEvent.press(chip)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('is not selected by default', async () => {
    const { getByRole } = await renderWithTheme(<Chip label="Ropa" />)
    const chip = getByRole('button', { name: 'Ropa' })
    expect(chip.props.accessibilityState).toMatchObject({ selected: false })
  })
})

describe('Badge', () => {
  it('renders its label', async () => {
    const { getByText } = await renderWithTheme(<Badge label="Activo" variant="success" />)
    expect(getByText('Activo')).toBeTruthy()
  })
})
