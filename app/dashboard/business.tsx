import { ScrollView } from 'react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { LoadingState } from '@/components/feedback/LoadingState'
import { BusinessForm } from '@/features/business/BusinessForm'
import { useMyBusiness } from '@/hooks/useMyBusiness'

export default function DashboardBusinessScreen() {
  const { business, isLoading } = useMyBusiness()

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title={business ? 'Mi negocio' : 'Crear negocio'} />
      {isLoading ? (
        <LoadingState fullScreen label="Cargando…" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BusinessForm existing={business ?? undefined} />
        </ScrollView>
      )}
    </Screen>
  )
}
