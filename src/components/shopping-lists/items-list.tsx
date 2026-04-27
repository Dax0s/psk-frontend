import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ItemRow } from '@/components/shopping-lists/item-row'
import type { ShoppingList } from '@/hooks/use-shopping-lists'

export function ItemsList({ list }: { list: ShoppingList }) {
  const { t } = useTranslation()

  const sortedItems = useMemo(
    () =>
      [...list.items].sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1
        return a.name.localeCompare(b.name)
      }),
    [list.items],
  )

  if (sortedItems.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {t('shoppingLists.detail.noItems')}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {sortedItems.map((item) => (
        <ItemRow key={item.id} listId={list.id} item={item} />
      ))}
    </div>
  )
}
