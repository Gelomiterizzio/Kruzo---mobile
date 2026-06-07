import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react-native'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { RatingStars } from '@/components/ui/RatingStars'
import { useTheme } from '@/providers/ThemeProvider'
import { formatRelativeTime, truncate } from '@/utils/formatters'
import type { Review } from '@/types/review'

export interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { theme } = useTheme()
  const [expanded, setExpanded] = useState(false)
  const isLong = review.comment.length > 200

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.author}>
          <Avatar uri={review.userPhoto} name={review.userName} size={36} />
          <View style={styles.authorMeta}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: theme.colors.foreground }]} numberOfLines={1}>
                {review.userName}
              </Text>
              {review.isVerified ? <CheckCircle2 size={13} color="#3b82f6" /> : null}
            </View>
            <Text style={[styles.time, { color: theme.colors.mutedForeground }]}>
              {formatRelativeTime(review.createdAt)}
            </Text>
          </View>
        </View>
        <RatingStars value={review.rating} size={14} />
      </View>

      <Text style={[styles.comment, { color: theme.colors.foreground }]}>
        {isLong && !expanded ? truncate(review.comment, 200) : review.comment}
      </Text>
      {isLong ? (
        <Pressable
          onPress={() => setExpanded((e) => !e)}
          hitSlop={6}
          accessibilityRole="button"
          style={styles.more}
        >
          {expanded ? (
            <ChevronUp size={12} color={theme.colors.primary} />
          ) : (
            <ChevronDown size={12} color={theme.colors.primary} />
          )}
          <Text style={[styles.moreText, { color: theme.colors.primary }]}>
            {expanded ? 'Ver menos' : 'Ver más'}
          </Text>
        </Pressable>
      ) : null}

      {review.ownerReply ? (
        <View
          style={[
            styles.reply,
            { backgroundColor: theme.colors.muted, borderLeftColor: theme.colors.primary },
          ]}
        >
          <Text style={[styles.replyTitle, { color: theme.colors.primary }]}>
            Respuesta del propietario
          </Text>
          <Text style={[styles.replyText, { color: theme.colors.mutedForeground }]}>
            {review.ownerReply}
          </Text>
        </View>
      ) : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  author: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  authorMeta: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: 14, fontWeight: '600' },
  time: { fontSize: 12, marginTop: 1 },
  comment: { fontSize: 14, lineHeight: 20 },
  more: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  moreText: { fontSize: 12, fontWeight: '600' },
  reply: { borderLeftWidth: 2, borderRadius: 10, padding: 12, gap: 3 },
  replyTitle: { fontSize: 12, fontWeight: '700' },
  replyText: { fontSize: 12, lineHeight: 17 },
})
