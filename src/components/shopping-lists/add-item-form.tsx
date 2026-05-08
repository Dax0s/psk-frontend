import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useAuth } from 'react-oidc-context'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useCreateShoppingListItem } from '@/hooks/use-shopping-lists'
import { useSuggestions } from '@/hooks/use-suggestions'
import type { SuggestedProduct } from '@/hooks/use-suggestions'

const personalScopeType = 'PERSONAL'

export function AddItemForm({ listId }: { listId: string }) {
  const { t } = useTranslation()
  const auth = useAuth()
  const scopeReferenceId = auth.user?.profile.sub ?? ''
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [error, setError] = useState<string | null>(null)
  const [inputFocused, setInputFocused] = useState(false)
  const createMutation = useCreateShoppingListItem(listId)
  const suggestionsQuery = useSuggestions(personalScopeType, scopeReferenceId)
  const searchTerm = normalizeSearch(name)

  const matchingSuggestions = useMemo(
    () =>
      (suggestionsQuery.data ?? [])
        .filter((product) => matchesProduct(product, searchTerm))
        .slice(0, 5),
    [suggestionsQuery.data, searchTerm],
  )

  const showPopup =
    inputFocused && Boolean(scopeReferenceId) && matchingSuggestions.length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('shoppingLists.form.itemNameRequired'))
      return
    }
    const parsed = Number(quantity)
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError(t('shoppingLists.form.quantityInvalid'))
      return
    }
    setError(null)
    createMutation.mutate(
      { name: name.trim(), quantity: parsed },
      {
        onSuccess: () => {
          setName('')
          setQuantity('1')
        },
        onError: () => setError(t('shoppingLists.form.createItemError')),
      },
    )
  }

  function addMatchedProduct(product: SuggestedProduct) {
    const itemName = product.displayName.trim()
    const itemQuantity = product.suggestedQuantity ?? 1

    setError(null)
    createMutation.mutate(
      { name: itemName, quantity: itemQuantity },
      {
        onSuccess: () => {
          setName('')
          setQuantity('1')
          setInputFocused(false)
        },
        onError: () => setError(t('shoppingLists.form.createItemError')),
      },
    )
  }

  return (
    <Card className="overflow-visible">
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
            <Field>
              <FieldLabel htmlFor="new-item-name">
                {t('shoppingLists.form.itemName')}
              </FieldLabel>
              <div className="relative">
                <Input
                  id="new-item-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder={t('shoppingLists.form.itemNamePlaceholder')}
                  disabled={createMutation.isPending}
                />
                {showPopup && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 rounded-lg border bg-popover p-2 text-popover-foreground shadow-md">
                    <ProductMatches
                      suggestions={matchingSuggestions}
                      isPending={createMutation.isPending}
                      onSelect={addMatchedProduct}
                    />
                  </div>
                )}
              </div>
            </Field>
            <Field className="sm:w-28">
              <FieldLabel htmlFor="new-item-quantity">
                {t('shoppingLists.form.quantity')}
              </FieldLabel>
              <Input
                id="new-item-quantity"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={createMutation.isPending}
              />
            </Field>
            <Button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
            >
              {createMutation.isPending ? <Spinner /> : <Plus />}
              {t('shoppingLists.form.addItem')}
            </Button>
          </div>
          {error && <FieldError>{error}</FieldError>}
        </form>
      </CardContent>
    </Card>
  )
}

function ProductMatches({
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
    <div className="flex flex-col gap-2">
      <ProductMatchGroup
        label={t('shoppingLists.suggestions.title')}
        products={suggestions}
        isPending={isPending}
        onSelect={onSelect}
      />
    </div>
  )
}

function ProductMatchGroup({
  label,
  products,
  isPending,
  onSelect,
}: {
  label: string
  products: Array<SuggestedProduct>
  isPending: boolean
  onSelect: (product: SuggestedProduct) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground">
        {label}
      </div>
      {products.map((product) => (
        <button
          key={productKey(product)}
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
          disabled={isPending}
          onMouseDown={(event) => {
            event.preventDefault()
            onSelect(product)
          }}
        >
          <span className="min-w-0">
            <span className="block truncate font-medium">
              {product.displayName}
            </span>
          </span>
          <Plus className="size-4 shrink-0" />
        </button>
      ))}
    </div>
  )
}

function matchesProduct(product: SuggestedProduct, searchTerm: string) {
  if (!searchTerm) {
    return true
  }

  return (
    normalizeSearch(product.displayName).includes(searchTerm) ||
    normalizeSearch(product.productKey).includes(searchTerm)
  )
}

function productKey(product: SuggestedProduct) {
  return `suggestion-${product.productKey}`
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}
