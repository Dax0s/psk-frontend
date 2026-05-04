import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ShoppingListCard } from '@/components/shopping-lists/shopping-list-card'
import type { ShoppingList } from '@/hooks/use-shopping-lists'

export function ShoppingListsGrid({ lists }: { lists: Array<ShoppingList> }) {
  const { t } = useTranslation()

  const sortedLists = useMemo(
    () =>
      [...lists].sort((a, b) => {
        const aHasUnchecked = a.items.some((i) => !i.checked)
        const bHasUnchecked = b.items.some((i) => !i.checked)
        if (aHasUnchecked !== bHasUnchecked) return aHasUnchecked ? -1 : 1
        return a.name.localeCompare(b.name)
      }),
    [lists],
  )

  if (sortedLists.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {t('shoppingLists.empty')}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sortedLists.map((list) => (
        <ShoppingListCard key={list.id} list={list} />
      ))}
    </div>
  )
}
