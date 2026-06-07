import { useState } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import {
  Phone,
  Globe,
  AtSign,
  MapPin,
  Clock,
  BadgeCheck,
  Heart,
  Share2,
  Eye,
  Truck,
  CreditCard,
} from 'lucide-react-native'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RatingStars } from '@/components/ui/RatingStars'
import { Tabs } from '@/components/ui/Tabs'
import { toast } from '@/components/overlay/toast'
import { PostCard } from '@/features/post/PostCard'
import { ReviewCard } from '@/features/review/ReviewCard'
import { ReviewForm } from '@/features/review/ReviewForm'
import { BusinessMap } from './BusinessMap'
import { useFavorites } from '@/hooks/useFavorites'
import { usePosts } from '@/hooks/usePosts'
import { useReviews } from '@/hooks/useReviews'
import { useTheme } from '@/providers/ThemeProvider'
import { formatNumber, isOpenNow } from '@/utils/formatters'
import { buildWhatsAppContactURL } from '@/utils/whatsapp'
import { openWhatsApp, callPhone, openURL, shareLink } from '@/utils/contact'
import { BUSINESS_CATEGORIES } from '@/constants'
import type { Business } from '@/types/business'
import type { Post } from '@/types/post'
import type { Review } from '@/types/review'

const TABS = ['Publicaciones', 'Reseñas', 'Información', 'Mapa']
const DAYS: { key: keyof Business['hours']; label: string }[] = [
  { key: 'mon', label: 'Lun' },
  { key: 'tue', label: 'Mar' },
  { key: 'wed', label: 'Mié' },
  { key: 'thu', label: 'Jue' },
  { key: 'fri', label: 'Vie' },
  { key: 'sat', label: 'Sáb' },
  { key: 'sun', label: 'Dom' },
]

function catLabel(key: string): string {
  const c = BUSINESS_CATEGORIES.find((x) => x.key === key)
  return c ? `${c.emoji} ${c.label}` : key
}

export function BusinessProfile({ business }: { business: Business }) {
  const { theme } = useTheme()
  const [tab, setTab] = useState(0)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { posts, loading: postsLoading } = usePosts({ businessId: business.id })
  const { reviews, loadMore: loadMoreReviews, hasMore: reviewsHasMore } = useReviews(business.id)

  const fav = isFavorite(business.id)
  const open = isOpenNow(
    business.hours as unknown as Record<string, { open: string; close: string } | null>,
  )
  const coverUri = business.coverImage || business.images[0] || business.logo || ''

  const onFavorite = async () => {
    const res = await toggleFavorite(business.id)
    if (res.status === 'unauthenticated') toast.info('Inicia sesión para guardar favoritos')
    else if (res.status === 'added') toast.success(`${business.name} guardado en favoritos`)
    else if (res.status === 'removed') toast.success('Eliminado de favoritos')
    else if (res.status === 'error') toast.error('Error al actualizar favoritos')
  }

  const styles = makeStyles(theme)

  const header = (
    <View>
      {/* Cover */}
      <View style={styles.cover}>
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <Text style={styles.coverEmoji}>🏪</Text>
        )}
      </View>

      <View style={styles.body}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={styles.logo}>
            {business.logo ? (
              <Image source={{ uri: business.logo }} style={styles.logoImg} contentFit="cover" />
            ) : (
              <Text style={styles.logoEmoji}>🏪</Text>
            )}
          </View>
          <View style={styles.titleMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {business.name}
              </Text>
              {business.isVerified ? <BadgeCheck size={18} color="#3b82f6" /> : null}
            </View>
            {business.tagline ? (
              <Text style={styles.tagline} numberOfLines={2}>
                {business.tagline}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Categories + featured */}
        <View style={styles.cats}>
          {business.isFeatured ? <Badge label="⭐ Destacado" variant="gold" /> : null}
          {business.category.map((c) => (
            <Badge key={c} label={catLabel(c)} variant="neutral" />
          ))}
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <RatingStars value={business.rating} size={14} />
            <Text style={styles.statStrong}>{business.rating.toFixed(1)}</Text>
            <Text style={styles.statMuted}>({formatNumber(business.reviewCount)})</Text>
          </View>
          <View style={styles.statItem}>
            <Eye size={14} color={theme.colors.mutedForeground} />
            <Text style={styles.statMuted}>{formatNumber(business.viewCount)}</Text>
          </View>
          <View
            style={[styles.openBadge, { backgroundColor: open ? '#dcfce7' : theme.colors.muted }]}
          >
            <Clock size={11} color={open ? '#15803d' : theme.colors.mutedForeground} />
            <Text
              style={[styles.openText, { color: open ? '#15803d' : theme.colors.mutedForeground }]}
            >
              {open ? 'Abierto ahora' : 'Cerrado'}
            </Text>
          </View>
        </View>

        {/* CTAs */}
        <Button
          label="Contactar por WhatsApp"
          onPress={() => openWhatsApp(buildWhatsAppContactURL(business.whatsapp, business.name))}
          style={styles.whatsapp}
          fullWidth
        />
        <View style={styles.ctaRow}>
          {business.phone ? (
            <Button
              label="Llamar"
              variant="outline"
              size="sm"
              leftIcon={<Phone size={15} color={theme.colors.foreground} />}
              onPress={() => callPhone(business.phone)}
              style={styles.ctaBtn}
            />
          ) : null}
          <Button
            label={fav ? 'Guardado' : 'Guardar'}
            variant="outline"
            size="sm"
            leftIcon={
              <Heart
                size={15}
                color={fav ? '#ef4444' : theme.colors.foreground}
                fill={fav ? '#ef4444' : 'transparent'}
              />
            }
            onPress={onFavorite}
            style={styles.ctaBtn}
          />
          <Button
            label="Compartir"
            variant="outline"
            size="sm"
            leftIcon={<Share2 size={15} color={theme.colors.foreground} />}
            onPress={() => shareLink(business.name, `/business/${business.slug}`)}
            style={styles.ctaBtn}
          />
        </View>

        {/* Feature badges */}
        {business.hasDelivery || business.acceptsQR ? (
          <View style={styles.features}>
            {business.hasDelivery ? (
              <Badge
                label="Delivery"
                variant="info"
                leftIcon={<Truck size={11} color="#1d4ed8" />}
              />
            ) : null}
            {business.acceptsQR ? (
              <Badge
                label="Acepta QR"
                variant="primary"
                leftIcon={<CreditCard size={11} color={theme.brand[700]} />}
              />
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Tabs */}
      <Tabs items={TABS} value={tab} onChange={setTab} scrollable />

      {/* Per-tab leading content */}
      {tab === 1 ? (
        <View style={styles.tabLead}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryBig}>{business.rating.toFixed(1)}</Text>
              <RatingStars value={Math.round(business.rating)} size={14} />
              <Text style={styles.statMuted}>{formatNumber(business.reviewCount)} reseñas</Text>
            </View>
            <View style={styles.summaryBars}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = business.ratingDistribution?.[star] ?? 0
                const pct = business.reviewCount > 0 ? (count / business.reviewCount) * 100 : 0
                return (
                  <View key={star} style={styles.barRow}>
                    <Text style={styles.barStar}>{star}</Text>
                    <View style={[styles.barTrack, { backgroundColor: theme.colors.muted }]}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${pct}%`, backgroundColor: theme.gold[400] },
                        ]}
                      />
                    </View>
                  </View>
                )
              })}
            </View>
          </Card>
          <ReviewForm businessId={business.id} />
        </View>
      ) : null}

      {tab === 2 ? (
        <View style={styles.tabLead}>
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Información</Text>
            {business.description ? (
              <Text style={styles.infoDesc}>{business.description}</Text>
            ) : null}
            {business.address ? (
              <InfoRow
                icon={<MapPin size={15} color={theme.colors.mutedForeground} />}
                text={`${business.address}, ${business.zone}`}
              />
            ) : null}
            {business.phone ? (
              <InfoRow
                icon={<Phone size={15} color={theme.colors.mutedForeground} />}
                text={business.phone}
                onPress={() => callPhone(business.phone)}
              />
            ) : null}
            {business.website ? (
              <InfoRow
                icon={<Globe size={15} color={theme.colors.mutedForeground} />}
                text={business.website.replace(/^https?:\/\//, '')}
                onPress={() => openURL(business.website)}
              />
            ) : null}
            {business.instagram ? (
              <InfoRow
                icon={<AtSign size={15} color={theme.colors.mutedForeground} />}
                text={`@${business.instagram}`}
                onPress={() => openURL(`https://instagram.com/${business.instagram}`)}
              />
            ) : null}
          </Card>

          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Horario</Text>
            {DAYS.map(({ key, label }) => {
              const h = business.hours[key]
              return (
                <View key={key} style={styles.hoursRow}>
                  <Text style={styles.hoursDay}>{label}</Text>
                  <Text style={styles.hoursVal}>{h ? `${h.open} – ${h.close}` : 'Cerrado'}</Text>
                </View>
              )
            })}
          </Card>
        </View>
      ) : null}

      {tab === 3 ? (
        <View style={styles.tabLead}>
          <BusinessMap business={business} />
        </View>
      ) : null}

      {tab === 0 ? <View style={styles.postsTop} /> : null}
    </View>
  )

  const data: (Post | Review)[] = tab === 0 ? posts : tab === 1 ? reviews : []

  return (
    <FlatList
      key={`tab-${tab}`}
      data={data}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      numColumns={tab === 0 ? 2 : 1}
      columnWrapperStyle={tab === 0 ? styles.postsRow : undefined}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) =>
        tab === 0 ? (
          <View style={styles.postCell}>
            <PostCard post={item as Post} />
          </View>
        ) : (
          <View style={styles.reviewCell}>
            <ReviewCard review={item as Review} />
          </View>
        )
      }
      onEndReached={() => {
        if (tab === 1 && reviewsHasMore) loadMoreReviews()
      }}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={
        tab === 0 ? (
          <Text style={styles.empty}>
            {postsLoading ? 'Cargando publicaciones…' : 'Este negocio aún no tiene publicaciones'}
          </Text>
        ) : tab === 1 ? (
          <Text style={styles.empty}>Sé el primero en dejar una reseña</Text>
        ) : null
      }
    />
  )
}

function InfoRow({
  icon,
  text,
  onPress,
}: {
  icon: React.ReactNode
  text: string
  onPress?: () => void
}) {
  const { theme } = useTheme()
  return (
    <View style={infoRowStyles.row}>
      {icon}
      <Text
        onPress={onPress}
        style={[
          infoRowStyles.text,
          { color: onPress ? theme.colors.primary : theme.colors.foreground },
        ]}
      >
        {text}
      </Text>
    </View>
  )
}

const infoRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 14, flex: 1 },
})

function makeStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    cover: {
      height: 200,
      backgroundColor: theme.colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    coverEmoji: { fontSize: 64 },
    body: { paddingHorizontal: 16, paddingTop: 14, gap: 12 },
    titleRow: { flexDirection: 'row', gap: 12, marginTop: -44 },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 18,
      backgroundColor: theme.colors.card,
      borderWidth: 2,
      borderColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    logoImg: { width: '100%', height: '100%' },
    logoEmoji: { fontSize: 30 },
    titleMeta: { flex: 1, paddingTop: 48, minWidth: 0 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { fontSize: 20, fontWeight: '800', color: theme.colors.foreground, flexShrink: 1 },
    tagline: { fontSize: 13, color: theme.colors.mutedForeground, marginTop: 2 },
    cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    stats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statStrong: { fontSize: 13, fontWeight: '700', color: theme.colors.foreground },
    statMuted: { fontSize: 13, color: theme.colors.mutedForeground },
    openBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 9999,
    },
    openText: { fontSize: 11, fontWeight: '600' },
    whatsapp: { backgroundColor: '#25D366' },
    ctaRow: { flexDirection: 'row', gap: 8 },
    ctaBtn: { flex: 1 },
    features: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tabLead: { padding: 16, gap: 14 },
    summaryCard: { flexDirection: 'row', gap: 20, alignItems: 'center' },
    summaryLeft: { alignItems: 'center', gap: 2 },
    summaryBig: { fontSize: 36, fontWeight: '800', color: theme.colors.foreground },
    summaryBars: { flex: 1, gap: 6 },
    barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    barStar: { fontSize: 12, color: theme.colors.mutedForeground, width: 10 },
    barTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 3 },
    infoCard: { gap: 10 },
    infoTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.foreground },
    infoDesc: { fontSize: 14, lineHeight: 20, color: theme.colors.mutedForeground },
    hoursRow: { flexDirection: 'row', justifyContent: 'space-between' },
    hoursDay: { fontSize: 13, color: theme.colors.mutedForeground, width: 40 },
    hoursVal: { fontSize: 13, fontWeight: '500', color: theme.colors.foreground },
    postsTop: { height: 16 },
    postsRow: { gap: 12, paddingHorizontal: 16 },
    postCell: { flex: 1, maxWidth: '50%' },
    reviewCell: { paddingHorizontal: 16, paddingBottom: 12 },
    listContent: { paddingBottom: 32 },
    empty: {
      textAlign: 'center',
      color: theme.colors.mutedForeground,
      paddingVertical: 32,
      paddingHorizontal: 16,
    },
  })
}
