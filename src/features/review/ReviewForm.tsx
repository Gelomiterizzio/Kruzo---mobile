import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'
import { RatingStars } from '@/components/ui/RatingStars'
import { toast } from '@/components/overlay/toast'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/hooks/useAuth'
import { createReview } from '@/services/firestore'
import { reviewSchema, type ReviewFormValues } from '@/utils/validators'

export interface ReviewFormProps {
  businessId: string
}

export function ReviewForm({ businessId }: ReviewFormProps) {
  const { theme } = useTheme()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  })

  if (!isAuthenticated) {
    return (
      <Card>
        <Text style={[styles.prompt, { color: theme.colors.mutedForeground }]}>
          Inicia sesión para dejar una reseña.
        </Text>
        <Button
          label="Iniciar sesión"
          variant="outline"
          size="sm"
          onPress={() => router.push('/login')}
          style={styles.promptBtn}
        />
      </Card>
    )
  }

  const onSubmit = async (data: ReviewFormValues) => {
    if (!user) return
    try {
      await createReview(businessId, user.id, user.displayName, user.photoURL, data)
      toast.success('¡Reseña publicada! Gracias por tu opinión.')
      reset()
      queryClient.invalidateQueries({ queryKey: ['reviews', businessId] })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      const isDuplicate = msg.includes('already-reviewed') || msg.includes('permission-denied')
      toast.error(
        isDuplicate ? 'Ya dejaste una reseña en este negocio' : 'Error al publicar reseña',
      )
    }
  }

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>Dejar una reseña</Text>

      <Controller
        control={control}
        name="rating"
        render={({ field }) => (
          <View>
            <RatingStars value={field.value} readonly={false} onChange={field.onChange} size={30} />
            {errors.rating ? (
              <Text style={[styles.error, { color: theme.colors.destructive }]}>
                {errors.rating.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="comment"
        render={({ field }) => (
          <TextArea
            placeholder="Comparte tu experiencia con este negocio…"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            maxLength={500}
            error={errors.comment?.message}
          />
        )}
      />

      <Button
        label={isSubmitting ? 'Publicando…' : 'Publicar reseña'}
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        fullWidth
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  title: { fontSize: 16, fontWeight: '700' },
  error: { fontSize: 12, marginTop: 6 },
  prompt: { fontSize: 14, textAlign: 'center' },
  promptBtn: { marginTop: 12, alignSelf: 'center' },
})
