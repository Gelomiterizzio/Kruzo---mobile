import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Timestamp } from 'firebase/firestore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'
import { RatingStars } from '@/components/ui/RatingStars'
import { toast } from '@/components/overlay/toast'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/hooks/useAuth'
import { createReview } from '@/services/firestore'
import { haptics } from '@/utils/haptics'
import { reviewSchema, type ReviewFormValues, type ReviewFormInput } from '@/utils/validators'
import type { Review } from '@/types/review'

export interface ReviewFormProps {
  businessId: string
}

interface ReviewsPage {
  reviews: Review[]
  lastDoc: unknown
}
interface ReviewsData {
  pages: ReviewsPage[]
  pageParams: unknown[]
}

export function ReviewForm({ businessId }: ReviewFormProps) {
  const { theme } = useTheme()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['reviews', businessId]

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormInput, unknown, ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  })

  // Optimistic: the new review appears instantly; rolls back on error (e.g. the
  // one-review-per-user rule), then reconciles with the server on settle.
  const mutation = useMutation({
    mutationFn: (data: ReviewFormValues) =>
      createReview(businessId, user!.id, user!.displayName, user!.photoURL, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey })
      const prev = queryClient.getQueryData<ReviewsData>(queryKey)
      const temp: Review = {
        id: user!.id,
        businessId,
        userId: user!.id,
        userName: user!.displayName,
        userPhoto: user!.photoURL,
        rating: data.rating,
        comment: data.comment,
        images: [],
        ownerReply: null,
        ownerRepliedAt: null,
        isVerified: false,
        reportCount: 0,
        isHidden: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
      queryClient.setQueryData<ReviewsData>(queryKey, (old) => {
        if (!old || old.pages.length === 0) return old
        const firstPage = old.pages[0]
        if (!firstPage) return old
        const newFirst: ReviewsPage = {
          reviews: [temp, ...firstPage.reviews],
          lastDoc: firstPage.lastDoc,
        }
        return { ...old, pages: [newFirst, ...old.pages.slice(1)] }
      })
      reset()
      haptics.success()
      return { prev }
    },
    onError: (e, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev)
      const msg = e instanceof Error ? e.message : String(e)
      const dup = msg.includes('already-reviewed') || msg.includes('permission-denied')
      toast.error(dup ? 'Ya dejaste una reseña en este negocio' : 'Error al publicar reseña')
    },
    onSuccess: () => toast.success('¡Reseña publicada! Gracias por tu opinión.'),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
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

  const onSubmit = (data: ReviewFormValues) => {
    if (!user) return
    mutation.mutate(data)
  }

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: theme.colors.foreground }]} accessibilityRole="header">
        Dejar una reseña
      </Text>

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
        label={mutation.isPending ? 'Publicando…' : 'Publicar reseña'}
        onPress={handleSubmit(onSubmit)}
        loading={mutation.isPending}
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
