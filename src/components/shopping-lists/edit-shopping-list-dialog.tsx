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
import { Spinner } from '@/components/ui/spinner'
import { useUpdateShoppingList } from '@/hooks/use-shopping-lists'
import type { ShoppingList } from '@/hooks/use-shopping-lists'

export function EditShoppingListDialog({
  list,
  open,
  onOpenChange,
}: {
  list: ShoppingList
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(list.name)
  const [error, setError] = useState<string | null>(null)
  const updateMutation = useUpdateShoppingList()

  function handleOpenChange(next: boolean) {
    if (next) {
      setName(list.name)
      setError(null)
    }
    onOpenChange(next)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('shoppingLists.form.nameRequired'))
      return
    }
    setError(null)
    updateMutation.mutate(
      { id: list.id, body: { name: name.trim() } },
      {
        onSuccess: () => onOpenChange(false),
        onError: () => setError(t('shoppingLists.form.updateError')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('shoppingLists.edit.title')}</DialogTitle>
          <DialogDescription>
            {t('shoppingLists.edit.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor={`edit-list-${list.id}`}>
              {t('shoppingLists.form.name')}
            </FieldLabel>
            <Input
              id={`edit-list-${list.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={updateMutation.isPending}
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
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
