import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { ImagePickerField } from '@/components/ui/ImagePickerField'
import { toast } from '@/components/overlay/toast'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/hooks/useAuth'
import { createPost, updatePost } from '@/services/firestore'
import { uploadPostImages } from '@/services/storage'
import { postSchema, type PostFormValues, type PostFormInput } from '@/utils/validators'
import { POST_CATEGORIES, PRICE_TYPE_LABELS } from '@/constants'
import type { Business } from '@/types/business'
import type { Post, PostFormData } from '@/types/post'

const PRICE_TYPES = (['fixed', 'negotiable', 'free', 'consult'] as const).map((v) => ({
  value: v,
  label: PRICE_TYPE_LABELS[v],
}))
const CATEGORY_OPTIONS = POST_CATEGORIES.map((c) => ({ label: c, value: c.toLowerCase() }))

export function PostForm({ business, existing }: { business: Business; existing?: Post }) {
  const { theme } = useTheme()
  const router = useRouter()
  const { user } = useAuth()
  const [images, setImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PostFormInput, unknown, PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: existing
      ? {
          title: existing.title,
          description: existing.description,
          price: existing.price,
          priceType: existing.priceType,
          originalPrice: existing.originalPrice,
          category: existing.category,
          subcategory: existing.subcategory,
          tags: existing.tags?.join(', ') ?? '',
          inStock: existing.inStock,
          stockCount: existing.stockCount ?? undefined,
          hasDelivery: existing.hasDelivery,
          deliveryZones: existing.deliveryZones?.join(', ') ?? '',
          deliveryPrice: existing.deliveryPrice,
          whatsappMessage: existing.whatsappMessage,
        }
      : {
          title: '',
          description: '',
          price: 0,
          priceType: 'fixed',
          category: '',
          subcategory: '',
          tags: '',
          inStock: true,
          hasDelivery: false,
          deliveryZones: '',
          deliveryPrice: 0,
          whatsappMessage: '',
        },
  })

  const priceType = watch('priceType')
  const hasDelivery = watch('hasDelivery')
  const showPrice = priceType !== 'free' && priceType !== 'consult'

  const onSubmit = async (data: PostFormValues) => {
    if (!user) return
    setSaving(true)
    try {
      let postId = existing?.id
      if (!postId) {
        postId = await createPost(
          user.id,
          business.id,
          business.name,
          business.slug,
          business.logo,
          business.whatsapp,
          data as PostFormData,
        )
        toast.success('¡Publicación creada!')
      } else {
        await updatePost(postId, {
          ...data,
          tags: data.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          deliveryZones: data.deliveryZones
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        } as Partial<Post>)
        toast.success('Publicación actualizada')
      }
      if (images.length) {
        const urls = await uploadPostImages(postId, images)
        await updatePost(postId, { images: urls })
      }
      router.replace('/dashboard/posts')
    } catch {
      toast.error('Error al guardar publicación')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={styles.form}>
      <Card style={styles.section}>
        <Text style={[styles.heading, { color: theme.colors.foreground }]}>
          Producto / servicio
        </Text>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <Input
              label="Título *"
              placeholder="Torta de chocolate personalizada"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.title?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextArea
              label="Descripción *"
              placeholder="Describe el producto, detalles, materiales…"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              maxLength={800}
              error={errors.description?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select
              label="Categoría *"
              value={field.value}
              options={CATEGORY_OPTIONS}
              onChange={field.onChange}
              error={errors.category?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <Input
              label="Etiquetas"
              placeholder="cumpleaños, encargo, decorado"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.heading, { color: theme.colors.foreground }]}>Precio</Text>
        <Controller
          control={control}
          name="priceType"
          render={({ field }) => (
            <Select
              label="Tipo de precio"
              value={field.value}
              options={PRICE_TYPES}
              onChange={field.onChange}
            />
          )}
        />
        {showPrice ? (
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <Input
                label="Precio (Bs.) *"
                placeholder="0"
                keyboardType="numeric"
                value={field.value ? String(field.value) : ''}
                onChangeText={(t) => field.onChange(Number(t.replace(/[^0-9.]/g, '')) || 0)}
                onBlur={field.onBlur}
                error={errors.price?.message}
              />
            )}
          />
        ) : null}
        {priceType === 'fixed' ? (
          <Controller
            control={control}
            name="originalPrice"
            render={({ field }) => (
              <Input
                label="Precio original (opcional, para descuento)"
                placeholder="0"
                keyboardType="numeric"
                value={field.value ? String(field.value) : ''}
                onChangeText={(t) => {
                  const n = Number(t.replace(/[^0-9.]/g, ''))
                  field.onChange(n > 0 ? n : undefined)
                }}
                onBlur={field.onBlur}
              />
            )}
          />
        ) : null}

        <View style={styles.toggleRow}>
          <View style={styles.toggleMeta}>
            <Text style={[styles.toggleLabel, { color: theme.colors.foreground }]}>
              ¿Tiene delivery?
            </Text>
            <Text style={[styles.toggleDesc, { color: theme.colors.mutedForeground }]}>
              Entregas a domicilio
            </Text>
          </View>
          <Controller
            control={control}
            name="hasDelivery"
            render={({ field }) => (
              <Switch
                value={field.value ?? false}
                onValueChange={field.onChange}
                accessibilityLabel="Delivery"
              />
            )}
          />
        </View>
        {hasDelivery ? (
          <>
            <Controller
              control={control}
              name="deliveryPrice"
              render={({ field }) => (
                <Input
                  label="Costo de delivery (Bs.)"
                  placeholder="0"
                  keyboardType="numeric"
                  value={field.value ? String(field.value) : ''}
                  onChangeText={(t) => field.onChange(Number(t.replace(/[^0-9.]/g, '')) || 0)}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              control={control}
              name="deliveryZones"
              render={({ field }) => (
                <Input
                  label="Zonas de delivery"
                  placeholder="Norte, Sur, Plan 3000"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.heading, { color: theme.colors.foreground }]}>Imágenes</Text>
        <ImagePickerField
          label="Hasta 5 imágenes"
          maxFiles={5}
          existing={existing?.images ?? []}
          value={images}
          onChange={setImages}
        />
        <Controller
          control={control}
          name="whatsappMessage"
          render={({ field }) => (
            <Input
              label="Mensaje de WhatsApp (opcional)"
              placeholder="Hola, me interesa este producto…"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </Card>

      <Button
        label={saving ? 'Guardando…' : existing ? 'Actualizar publicación' : 'Crear publicación'}
        onPress={handleSubmit(onSubmit)}
        loading={saving}
        size="lg"
        fullWidth
      />
    </View>
  )
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  section: { gap: 12 },
  heading: { fontSize: 16, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleMeta: { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  toggleDesc: { fontSize: 12, marginTop: 1 },
})
