import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { FamilyCard } from '@/components/families/family-card'
import type { FamilySummary } from '@/hooks/use-families'

export function FamiliesGrid({ families }: { families: Array<FamilySummary> }) {
  const { t } = useTranslation()

  const sortedFamilies = useMemo(
    () => [...families].sort((a, b) => a.name.localeCompare(b.name)),
    [families],
  )

  if (sortedFamilies.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {t('families.empty')}
      </p>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sortedFamilies.map((family) => (
        <FamilyCard key={family.id} family={family} />
      ))}
    </div>
  )
}
