import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LogOut, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteFamilyDialog } from '@/components/families/delete-family-dialog'
import { LeaveFamilyDialog } from '@/components/families/leave-family-dialog'
import type { Family } from '@/hooks/use-families'

export function FamilyHeader({ family }: { family: Family }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{family.name}</h1>
          <p className="text-sm text-muted-foreground">
            {t('families.memberCount', { count: family.memberCount })}
          </p>
          {family.isAdmin && (
            <Badge variant="secondary" className="w-fit">
              {t('families.admin')}
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          {family.isAdmin ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 />
              {t('families.actions.delete')}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeaveOpen(true)}
            >
              <LogOut />
              {t('families.actions.leave')}
            </Button>
          )}
        </div>
      </div>

      <DeleteFamilyDialog
        family={family}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate({ to: '/families' })}
      />
      <LeaveFamilyDialog
        family={family}
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        onLeft={() => navigate({ to: '/families' })}
      />
    </>
  )
}
