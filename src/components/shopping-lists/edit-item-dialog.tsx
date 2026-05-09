import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { Spinner } from '@/components/ui/spinner'
import { CategorySelect } from '@/components/shopping-lists/category-select'
import { useUpdateShoppingListItem } from '@/hooks/use-shopping-lists'
import type { ShoppingListItem } from '@/hooks/use-shopping-lists'
import type { ProductCategory } from '@/hooks/use-product-suggestions'
import { parseQuantity } from '@/lib/utils'

export function EditItemDialog({
  listId,
  item,
  open,
  onOpenChange,
}: {
  listId: string
  item: ShoppingListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(item.name)
  const [quantity, setQuantity] = useState(String(item.quantity))
  const [category, setCategory] = useState<ProductCategory>(item.category)
  const [error, setError] = useState<string | null>(null)
  const updateMutation = useUpdateShoppingListItem(listId)

  function handleOpenChange(next: boolean) {
    if (next) {
      setName(item.name)
      setQuantity(String(item.quantity))
      setCategory(item.category)
      setError(null)
    }
    onOpenChange(next)
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
    setError(null)
    updateMutation.mutate(
      {
        itemId: item.id,
        body: {
          name: name.trim(),
          quantity: parsed,
          checked: item.checked,
          category,
        },
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: () => setError(t('shoppingLists.form.updateItemError')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('shoppingLists.itemEdit.title')}</DialogTitle>
          <DialogDescription>
            {t('shoppingLists.itemEdit.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor={`edit-item-name-${item.id}`}>
              {t('shoppingLists.form.itemName')}
            </FieldLabel>
            <Input
              id={`edit-item-name-${item.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={updateMutation.isPending}
            />
          </Field>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor={`edit-item-quantity-${item.id}`}>
              {t('shoppingLists.form.quantity')}
            </FieldLabel>
            <NumberInput
              id={`edit-item-quantity-${item.id}`}
              min={0}
              value={quantity}
              onChange={setQuantity}
              disabled={updateMutation.isPending}
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor={`edit-item-category-${item.id}`}>
              {t('shoppingLists.form.category')}
            </FieldLabel>
            <CategorySelect
              id={`edit-item-category-${item.id}`}
              value={category}
              onChange={setCategory}
              disabled={updateMutation.isPending}
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              {t('shoppingLists.actions.cancel')}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Spinner />}
              {t('shoppingLists.actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
