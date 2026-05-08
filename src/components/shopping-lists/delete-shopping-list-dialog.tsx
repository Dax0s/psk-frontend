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
import { Spinner } from '@/components/ui/spinner'
import { useDeleteShoppingList } from '@/hooks/use-shopping-lists'
import type { ShoppingList } from '@/hooks/use-shopping-lists'

export function DeleteShoppingListDialog({
  list,
  open,
  onOpenChange,
  onDeleted,
}: {
  list: ShoppingList
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const { t } = useTranslation()
  const deleteMutation = useDeleteShoppingList()

  function handleDelete() {
    deleteMutation.mutate(list.id, {
      onSuccess: () => {
        onOpenChange(false)
        onDeleted?.()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('shoppingLists.delete.title')}</DialogTitle>
          <DialogDescription>
            {t('shoppingLists.delete.description', { name: list.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            {t('shoppingLists.actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && <Spinner />}
            {t('shoppingLists.actions.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
