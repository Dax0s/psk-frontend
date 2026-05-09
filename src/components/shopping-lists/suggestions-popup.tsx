import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import type { SuggestedProduct } from '@/hooks/use-suggestions'

export function SuggestionsPopup({
  suggestions,
  isPending,
  onSelect,
}: {
  suggestions: Array<SuggestedProduct>
  isPending: boolean
  onSelect: (product: SuggestedProduct) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 flex flex-col gap-1 rounded-lg border bg-popover p-2 text-popover-foreground shadow-md">
      <div className="px-2 text-xs font-medium text-muted-foreground">
        {t('shoppingLists.suggestions.title')}
      </div>
      {suggestions.map((product) => (
        <button
          key={product.productKey}
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
          disabled={isPending}
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(product)
          }}
        >
          <span className="block truncate font-medium">
            {product.displayName}
          </span>
          <Plus className="size-4 shrink-0" />
        </button>
      ))}
    </div>
  )
}
