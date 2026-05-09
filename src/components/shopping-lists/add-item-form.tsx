import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useAuth } from 'react-oidc-context'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { SuggestionsPopup } from '@/components/shopping-lists/suggestions-popup'
import { useCreateShoppingListItem } from '@/hooks/use-shopping-lists'
import { useSuggestions } from '@/hooks/use-suggestions'
import type { SuggestedProduct } from '@/hooks/use-suggestions'

const personalScopeType = 'PERSONAL'
const maxSuggestions = 5

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

  const matchingSuggestions = useMemo(() => {
    const term = normalize(name)
    return (suggestionsQuery.data ?? [])
      .filter(
        (product) =>
          !term ||
          normalize(product.displayName).includes(term) ||
          normalize(product.productKey).includes(term),
      )
      .slice(0, maxSuggestions)
  }, [suggestionsQuery.data, name])

  const showSuggestions =
    inputFocused && !!scopeReferenceId && matchingSuggestions.length > 0

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

  function selectSuggestion(product: SuggestedProduct) {
    setError(null)
    createMutation.mutate(
      {
        name: product.displayName.trim(),
        quantity: product.suggestedQuantity ?? 1,
      },
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
                {showSuggestions && (
                  <SuggestionsPopup
                    suggestions={matchingSuggestions}
                    isPending={createMutation.isPending}
                    onSelect={selectSuggestion}
                  />
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

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}
