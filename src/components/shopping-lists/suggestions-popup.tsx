import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import type { SuggestedProduct } from '@/hooks/use-suggestions'
import type { ProductSuggestion } from '@/hooks/use-product-suggestions'

const priceFormatter = new Intl.NumberFormat('lt-LT', {
  style: 'currency',
  currency: 'EUR',
})

export function SuggestionsPopup({
  suggestions,
  isPending,
  onSelect,
  productOffers = [],
  onSelectOffer,
  term = '',
}: {
  suggestions: Array<SuggestedProduct>
  isPending: boolean
  onSelect: (product: SuggestedProduct) => void
  productOffers?: Array<ProductSuggestion>
  onSelectOffer?: (offer: ProductSuggestion) => void
  term?: string
}) {
  const { t } = useTranslation()
  const hasPastSuggestions = suggestions.length > 0
  const hasOffers = productOffers.length > 0

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 flex flex-col gap-2 rounded-lg border bg-popover p-2 text-popover-foreground shadow-md">
      {hasPastSuggestions && (
        <div className="flex flex-col gap-1">
          <div className="px-2 text-xs font-medium text-muted-foreground">
            {t('shoppingLists.suggestions.title')}
          </div>
          {suggestions.map((product) => (
            <button
              key={product.name}
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
              disabled={isPending}
              onMouseDown={(e) => {
                e.preventDefault()
                onSelect(product)
              }}
            >
              <span className="block truncate">
                {highlight(product.name, term)}
              </span>
              <Plus className="size-4 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {hasOffers && onSelectOffer && (
        <div className="flex flex-col gap-1">
          {hasPastSuggestions && <div className="border-t" />}
          <div className="px-2 pt-1 text-xs font-medium text-muted-foreground">
            {t('shoppingLists.productSuggestions.title')}
          </div>
          {productOffers.map((offer) => (
            <button
              key={offer.id}
              type="button"
              className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
              disabled={isPending}
              onMouseDown={(e) => {
                e.preventDefault()
                onSelectOffer(offer)
              }}
            >
              {offer.imageUrl ? (
                <img
                  src={offer.imageUrl}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="size-8 shrink-0 rounded-sm object-contain bg-muted"
                />
              ) : (
                <div className="size-8 shrink-0 rounded-sm bg-muted" />
              )}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{highlight(offer.name, term)}</span>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  {offer.price !== null && (
                    <span className="font-medium text-foreground">
                      {priceFormatter.format(offer.price)}
                    </span>
                  )}
                  {offer.discountPct !== null && (
                    <span className="rounded bg-destructive/10 px-1 font-medium text-destructive">
                      -{offer.discountPct}%
                    </span>
                  )}
                  {offer.promo && (
                    <span className="rounded bg-primary/10 px-1 font-medium text-primary">
                      {offer.promo}
                    </span>
                  )}
                  {offer.validTo && (
                    <span>
                      {t('shoppingLists.productSuggestions.validUntil', {
                        date: offer.validTo,
                      })}
                    </span>
                  )}
                </span>
                {offer.unitPrice && (
                  <span className="truncate text-xs text-muted-foreground">
                    {offer.unitPrice}
                  </span>
                )}
              </div>
              <Plus className="size-4 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function highlight(text: string, term: string): ReactNode {
  const trimmed = term.trim()
  if (!trimmed) return text
  const lower = text.toLowerCase()
  const idx = lower.indexOf(trimmed.toLowerCase())
  if (idx < 0) return text
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-semibold">
        {text.slice(idx, idx + trimmed.length)}
      </strong>
      {text.slice(idx + trimmed.length)}
    </>
  )
}
