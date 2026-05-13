import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserMinus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RemoveMemberDialog } from '@/components/families/remove-member-dialog'
import type { FamilyMember } from '@/hooks/use-families'

export function MemberRow({
  member,
  familyId,
  isCurrentUser,
  viewerIsAdmin,
}: {
  member: FamilyMember
  familyId: string
  isCurrentUser: boolean
  viewerIsAdmin: boolean
}) {
  const { t, i18n } = useTranslation()
  const [removeOpen, setRemoveOpen] = useState(false)

  const displayName = member.email ?? member.userId
  const canRemove = viewerIsAdmin && !member.isAdmin && !isCurrentUser
  const joinedAgo = formatRelativeTime(
    new Date(member.joinedAt),
    i18n.resolvedLanguage ?? 'en',
  )

  return (
    <>
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{displayName}</span>
            {isCurrentUser && (
              <span className="text-xs text-muted-foreground">
                {t('families.you')}
              </span>
            )}
            {member.isAdmin && (
              <Badge variant="secondary" className="text-xs">
                {t('families.admin')}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {t('families.joinedAgo', { time: joinedAgo })}
          </span>
        </div>

        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRemoveOpen(true)}
            aria-label={t('families.actions.remove')}
          >
            <UserMinus />
            {t('families.actions.remove')}
          </Button>
        )}
      </div>

      {canRemove && (
        <RemoveMemberDialog
          familyId={familyId}
          member={member}
          open={removeOpen}
          onOpenChange={setRemoveOpen}
        />
      )}
    </>
  )
}

function formatRelativeTime(date: Date, lang: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (lang === 'lt') {
    if (years > 0) return `prieš ${years} m.`
    if (months > 0) return `prieš ${months} mėn.`
    if (days > 0) return `prieš ${days} d.`
    if (hours > 0) return `prieš ${hours} val.`
    if (minutes > 0) return `prieš ${minutes} min.`
    return 'ką tik'
  }
  if (years > 0) return `${years}y ago`
  if (months > 0) return `${months}mo ago`
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}min ago`
  return 'just now'
}
