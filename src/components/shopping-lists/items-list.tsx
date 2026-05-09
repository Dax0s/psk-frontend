import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ItemRow } from '@/components/shopping-lists/item-row'
import type { ShoppingList } from '@/hooks/use-shopping-lists'
import { productCategoryOrder } from '@/hooks/use-product-suggestions'
import type { ProductCategory } from '@/hooks/use-product-suggestions'
import { usePinnedProducts } from '@/hooks/use-suggestions'
import { normalize } from '@/lib/utils'

export function ItemsList({ list }: { list: ShoppingList }) {
  const { t } = useTranslation()
  const pinnedProductsQuery = usePinnedProducts()

  const { groups, pinnedItemIds } = useMemo(() => {
    const pinnedNames = new Set(
      (pinnedProductsQuery.data ?? []).map((product) =>
        normalize(product.name),
      ),
    )
    const pinnedItemIds = new Set<string>()
    const grouped = new Map<ProductCategory, typeof list.items>()
    for (const item of list.items) {
      if (pinnedNames.has(normalize(item.name))) pinnedItemIds.add(item.id)
      const existing = grouped.get(item.category) ?? []
      existing.push(item)
      grouped.set(item.category, existing)
    }
    for (const [, items] of grouped) {
      items.sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1
        return a.name.localeCompare(b.name)
      })
    }
    const groups = productCategoryOrder
      .filter((category) => grouped.has(category))
      .map((category) => ({ category, items: grouped.get(category)! }))
    return { groups, pinnedItemIds }
  }, [list.items, pinnedProductsQuery.data])

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {t('shoppingLists.detail.noItems')}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ category, items }) => (
        <section key={category} className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t(`productCategories.${category}`)}
          </h2>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <ItemRow
                key={item.id}
                listId={list.id}
                item={item}
                isPinned={pinnedItemIds.has(item.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
