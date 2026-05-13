import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useRemoveFamilyMember } from '@/hooks/use-families'
import type { FamilyMember } from '@/hooks/use-families'

export function RemoveMemberDialog({
  familyId,
  member,
  open,
  onOpenChange,
}: {
  familyId: string
  member: FamilyMember
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const removeMutation = useRemoveFamilyMember(familyId)
  const displayName = member.email ?? member.userId

  function handleRemove() {
    removeMutation.mutate(member.userId, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('families.removeMember.title')}</DialogTitle>
          <DialogDescription>
            {t('families.removeMember.description', { name: displayName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={removeMutation.isPending}
          >
            {t('families.actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemove}
            disabled={removeMutation.isPending}
          >
            {removeMutation.isPending && <Spinner />}
            {t('families.actions.remove')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
