import { useMemo } from 'react'

import { MemberRow } from '@/components/families/member-row'
import type { FamilyMember } from '@/hooks/use-families'

export function MembersList({
  members,
  familyId,
  currentUserId,
  viewerIsAdmin,
}: {
  members: Array<FamilyMember>
  familyId: string
  currentUserId: string
  viewerIsAdmin: boolean
}) {
  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1
        return (a.email ?? a.userId).localeCompare(b.email ?? b.userId)
      }),
    [members],
  )

  return (
    <div className="flex flex-col divide-y divide-border">
      {sortedMembers.map((member) => (
        <MemberRow
          key={member.userId}
          member={member}
          familyId={familyId}
          isCurrentUser={member.userId === currentUserId}
          viewerIsAdmin={viewerIsAdmin}
        />
      ))}
    </div>
  )
}
