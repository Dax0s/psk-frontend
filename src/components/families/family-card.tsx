import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FamilySummary } from '@/hooks/use-families'

export function FamilyCard({ family }: { family: FamilySummary }) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <Link
          to="/families/$familyId"
          params={{ familyId: family.id }}
          className="hover:underline"
        >
          <CardTitle>{family.name}</CardTitle>
        </Link>
        <CardDescription>
          {t('families.memberCount', { count: family.memberCount })}
        </CardDescription>
        {family.isAdmin && (
          <Badge variant="secondary" className="w-fit">
            {t('families.admin')}
          </Badge>
        )}
      </CardHeader>
    </Card>
  )
}
