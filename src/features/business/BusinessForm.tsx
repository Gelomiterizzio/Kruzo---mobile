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
import { Chip } from '@/components/ui/Chip'
import { ImagePickerField } from '@/components/ui/ImagePickerField'
import { toast } from '@/components/overlay/toast'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/hooks/useAuth'
import { createBusiness, updateBusiness, linkBusinessToOwner } from '@/services/firestore'
import { uploadBusinessImages } from '@/services/storage'
import { businessSchema, type BusinessFormValues, type BusinessFormInput } from '@/utils/validators'
import { BUSINESS_CATEGORIES, SCZ_ZONES } from '@/constants'
import type { Business } from '@/types/business'

const TOGGLES = [
  { field: 'hasDelivery', label: '🚚 Ofrece Delivery', desc: 'Entregas a domicilio' },
  { field: 'hasOnlinePayment', label: '💳 Pagos en línea', desc: 'Transferencias, tarjetas' },
  { field: 'acceptsQR', label: '📱 Acepta QR', desc: 'Tigo Money, Simple' },
] as const

export function BusinessForm({ existing }: { existing?: Business }) {
  const { theme } = useTheme()
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [logo, setLogo] = useState<string[]>([])
  const [cover, setCover] = useState<string[]>([])
  const [gallery, setGallery] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessFormInput, unknown, BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: existing
      ? {
          name: existing.name,
          tagline: existing.tagline,
          description: existing.description,
          category: existing.category,
          subcategory: existing.subcategory,
          tags: existing.tags?.join(', ') ?? '',
          whatsapp: existing.whatsapp,
          phone: existing.phone,
          email: existing.email,
          instagram: existing.instagram,
          facebook: existing.facebook,
          tiktok: existing.tiktok,
          website: existing.website,
          address: existing.address,
          zone: existing.zone,
          hasDelivery: existing.hasDelivery,
          hasOnlinePayment: existing.hasOnlinePayment,
          acceptsQR: existing.acceptsQR,
        }
      : {
          name: '',
          tagline: '',
          description: '',
          category: [],
          subcategory: '',
          tags: '',
          whatsapp: '',
          phone: '',
          email: '',
          instagram: '',
          facebook: '',
          tiktok: '',
          website: '',
          address: '',
          zone: '',
          hasDelivery: false,
          hasOnlinePayment: false,
          acceptsQR: false,
        },
  })

  const onSubmit = async (data: BusinessFormValues) => {
    if (!user) return
    setSaving(true)
    try {
      let businessId = existing?.id
      if (!businessId) {
        businessId = await createBusiness(user.id, user.displayName, data)
        await linkBusinessToOwner(user.id, businessId)
        toast.success('Negocio creado. Pendiente de aprobación.')
      } else {
        await updateBusiness(businessId, {
          ...data,
          tags: data.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        } as Partial<Business>)
        toast.success('Negocio actualizado correctamente')
      }

      if (logo.length) {
        const [url] = await uploadBusinessImages(businessId, logo, 'logo')
        if (url) await updateBusiness(businessId, { logo: url })
      }
      if (cover.length) {
        const [url] = await uploadBusinessImages(businessId, cover, 'cover')
        if (url) await updateBusiness(businessId, { coverImage: url })
      }
      if (gallery.length) {
        const urls = await uploadBusinessImages(businessId, gallery, 'gallery')
        await updateBusiness(businessId, { images: urls })
      }

      await refreshUser()
      router.replace('/dashboard/business')
    } catch {
      toast.error('Error al guardar negocio. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={styles.form}>
      <Card style={styles.section}>
        <Text style={[styles.heading, { color: theme.colors.foreground }]}>Información básica</Text>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              label="Nombre del negocio *"
              placeholder="Ej: Pastelería Mamá Lucía"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="tagline"
          render={({ field }) => (
            <Input
              label="Slogan"
              placeholder="Los mejores pasteles de la ciudad"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.tagline?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextArea
              label="Descripción completa *"
              placeholder="Describe tu negocio, qué ofreces, tu historia…"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              maxLength={1000}
              error={errors.description?.message}
            />
          )}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.heading, { color: theme.colors.foreground }]}>
          Categorías <Text style={styles.hint}>(máx. 3)</Text>
        </Text>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <View style={styles.chips}>
              {BUSINESS_CATEGORIES.map((c) => {
                const selected = field.value.includes(c.key)
                return (
                  <Chip
                    key={c.key}
                    label={c.label}
                    emoji={c.emoji}
                    selected={selected}
                    onPress={() => {
                      if (selected) field.onChange(field.value.filter((x) => x !== c.key))
                      else if (field.value.length < 3) field.onChange([...field.value, c.key])
                    }}
                  />
                )
              })}
            </View>
          )}
        />
        {errors.category ? (
          <Text style={[styles.error, { color: theme.colors.destructive }]}>
            {errors.category.message}
          </Text>
        ) : null}
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <Input
              label="Etiquetas (separadas por coma)"
              placeholder="delivery, tortas personalizadas"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.heading, { color: theme.colors.foreground }]}>Contacto</Text>
        <Controller
          control={control}
          name="whatsapp"
          render={({ field }) => (
            <Input
              label="WhatsApp * (número boliviano)"
              placeholder="70000000"
              keyboardType="phone-pad"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.whatsapp?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Input
              label="Teléfono"
              placeholder="33000000"
              keyboardType="phone-pad"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              label="Email"
              placeholder="negocio@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="instagram"
          render={({ field }) => (
            <Input
              label="Instagram (usuario)"
              placeholder="mi_negocio"
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="website"
          render={({ field }) => (
            <Input
              label="Sitio web"
              placeholder="https://minegocio.com"
              autoCapitalize="none"
              keyboardType="url"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.website?.message}
            />
          )}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.heading, { color: theme.colors.foreground }]}>Ubicación</Text>
        <Controller
          control={control}
          name="zone"
          render={({ field }) => (
            <Select
              label="Zona *"
              value={field.value}
              placeholder="Seleccionar zona…"
              options={SCZ_ZONES.map((z) => ({ label: z, value: z }))}
              onChange={field.onChange}
              error={errors.zone?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <Input
              label="Dirección *"
              placeholder="Av. Roca y Coronado #123"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.address?.message}
            />
          )}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.heading, { color: theme.colors.foreground }]}>Opciones</Text>
        {TOGGLES.map((t) => (
          <View key={t.field} style={styles.toggleRow}>
            <View style={styles.toggleMeta}>
              <Text style={[styles.toggleLabel, { color: theme.colors.foreground }]}>
                {t.label}
              </Text>
              <Text style={[styles.toggleDesc, { color: theme.colors.mutedForeground }]}>
                {t.desc}
              </Text>
            </View>
            <Controller
              control={control}
              name={t.field}
              render={({ field }) => (
                <Switch
                  value={field.value ?? false}
                  onValueChange={field.onChange}
                  accessibilityLabel={t.label}
                />
              )}
            />
          </View>
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.heading, { color: theme.colors.foreground }]}>Imágenes</Text>
        <ImagePickerField
          label="Logo (1 imagen)"
          maxFiles={1}
          existing={existing?.logo ? [existing.logo] : []}
          value={logo}
          onChange={setLogo}
        />
        <ImagePickerField
          label="Portada (1 imagen)"
          maxFiles={1}
          existing={existing?.coverImage ? [existing.coverImage] : []}
          value={cover}
          onChange={setCover}
        />
        <ImagePickerField
          label="Galería (hasta 5)"
          maxFiles={5}
          existing={existing?.images ?? []}
          value={gallery}
          onChange={setGallery}
        />
      </Card>

      <Button
        label={saving ? 'Guardando…' : existing ? 'Actualizar negocio' : 'Crear negocio'}
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
  hint: { fontSize: 13, fontWeight: '400' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { fontSize: 12 },
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
