import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { Spinner } from '@/components/ui/spinner'
import { CategorySelect } from '@/components/shopping-lists/category-select'
import { SuggestionsPopup } from '@/components/shopping-lists/suggestions-popup'
import { useCreateShoppingListItem } from '@/hooks/use-shopping-lists'
import { useSuggestions } from '@/hooks/use-suggestions'
import type { SuggestedProduct } from '@/hooks/use-suggestions'
import {
  MIN_PRODUCT_QUERY_LENGTH,
  useProductSuggestions,
} from '@/hooks/use-product-suggestions'
import type {
  ProductCategory,
  ProductSuggestion,
} from '@/hooks/use-product-suggestions'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { normalize, parseQuantity } from '@/lib/utils'

const MAX_PAST_SUGGESTIONS = 5
const PRODUCT_SUGGESTION_LIMIT = 5
const PRODUCT_SUGGESTION_DEBOUNCE_MS = 250

export function AddItemForm({ listId }: { listId: string }) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [category, setCategory] = useState<ProductCategory>('OTHER')
  const [error, setError] = useState<string | null>(null)
  const [inputFocused, setInputFocused] = useState(false)
  const createMutation = useCreateShoppingListItem(listId)
  const suggestionsQuery = useSuggestions()
  const debouncedName = useDebouncedValue(name, PRODUCT_SUGGESTION_DEBOUNCE_MS)
  const productSuggestionsQuery = useProductSuggestions(
    debouncedName,
    PRODUCT_SUGGESTION_LIMIT,
  )

  const debouncedTerm = normalize(debouncedName)
  const isQueryReady = debouncedTerm.length >= MIN_PRODUCT_QUERY_LENGTH

  const matchingSuggestions = useMemo(() => {
    if (!isQueryReady) return []
    return (suggestionsQuery.data ?? [])
      .filter((product) => normalize(product.name).includes(debouncedTerm))
      .slice(0, MAX_PAST_SUGGESTIONS)
  }, [suggestionsQuery.data, debouncedTerm, isQueryReady])

  const productOffers = productSuggestionsQuery.data ?? []
  const showSuggestions =
    inputFocused &&
    isQueryReady &&
    debouncedName === name &&
    productSuggestionsQuery.isSuccess &&
    !productSuggestionsQuery.isFetching &&
    matchingSuggestions.length + productOffers.length > 0

  function addItem(payload: {
    name: string
    quantity: number
    category: ProductCategory
    closePopup?: boolean
  }) {
    setError(null)
    createMutation.mutate(
      {
        name: payload.name.trim(),
        quantity: payload.quantity,
        category: payload.category,
      },
      {
        onSuccess: () => {
          setName('')
          setQuantity('1')
          setCategory('OTHER')
          if (payload.closePopup) setInputFocused(false)
        },
        onError: () => setError(t('shoppingLists.form.createItemError')),
      },
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('shoppingLists.form.itemNameRequired'))
      return
    }
    const parsed = parseQuantity(quantity)
    if (parsed === null) {
      setError(t('shoppingLists.form.quantityInvalid'))
      return
    }
    addItem({ name, quantity: parsed, category })
  }

  function selectSuggestion(product: SuggestedProduct) {
    addItem({
      name: product.name,
      quantity: product.suggestedQuantity,
      category: product.category,
      closePopup: true,
    })
  }

  function selectProductOffer(offer: ProductSuggestion) {
    const parsed = parseQuantity(quantity)
    addItem({
      name: offer.name,
      quantity: parsed != null && parsed > 0 ? parsed : 1,
      category: offer.category,
      closePopup: true,
    })
  }

  return (
    <Card className="overflow-visible">
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
          autoComplete="off"
        >
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
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
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  autoFocus
                />
                {showSuggestions && (
                  <SuggestionsPopup
                    suggestions={matchingSuggestions}
                    isPending={createMutation.isPending}
                    onSelect={selectSuggestion}
                    productOffers={productOffers}
                    onSelectOffer={selectProductOffer}
                    term={debouncedTerm}
                  />
                )}
              </div>
            </Field>
            <Field className="sm:w-44">
              <FieldLabel htmlFor="new-item-category">
                {t('shoppingLists.form.category')}
              </FieldLabel>
              <CategorySelect
                id="new-item-category"
                value={category}
                onChange={setCategory}
                disabled={createMutation.isPending}
              />
            </Field>
            <Field className="sm:w-28">
              <FieldLabel htmlFor="new-item-quantity">
                {t('shoppingLists.form.quantity')}
              </FieldLabel>
              <NumberInput
                id="new-item-quantity"
                min={0}
                value={quantity}
                onChange={setQuantity}
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
