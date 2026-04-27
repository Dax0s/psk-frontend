import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useCreateShoppingListItem } from '@/hooks/use-shopping-lists'

export function AddItemForm({ listId }: { listId: string }) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [error, setError] = useState<string | null>(null)
  const createMutation = useCreateShoppingListItem(listId)

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

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
            <Field>
              <FieldLabel htmlFor="new-item-name">
                {t('shoppingLists.form.itemName')}
              </FieldLabel>
              <Input
                id="new-item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('shoppingLists.form.itemNamePlaceholder')}
                disabled={createMutation.isPending}
              />
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
