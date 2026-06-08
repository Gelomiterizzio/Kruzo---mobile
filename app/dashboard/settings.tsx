import { ScrollView } from 'react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { ProfileSettingsForm } from '@/features/settings/ProfileSettingsForm'

export default function DashboardSettingsScreen() {
  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Configuración" />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProfileSettingsForm />
      </ScrollView>
    </Screen>
  )
}
