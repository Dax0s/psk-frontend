import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Pin, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { EditItemDialog } from '@/components/shopping-lists/edit-item-dialog'
import {
  useDeleteShoppingListItem,
  useUpdateShoppingListItem,
} from '@/hooks/use-shopping-lists'
import type { ShoppingListItem } from '@/hooks/use-shopping-lists'
import { useCreatePinnedProduct } from '@/hooks/use-suggestions'

export function ItemRow({
  listId,
  item,
  isPinned,
}: {
  listId: string
  item: ShoppingListItem
  isPinned: boolean
}) {
  const { t } = useTranslation()
  const [editOpen, setEditOpen] = useState(false)
  const updateMutation = useUpdateShoppingListItem(listId)
  const deleteMutation = useDeleteShoppingListItem(listId)
  const pinMutation = useCreatePinnedProduct()

  function toggleChecked(next: boolean) {
    updateMutation.mutate({
      itemId: item.id,
      body: {
        name: item.name,
        quantity: item.quantity,
        checked: next,
        category: item.category,
      },
    })
  }

  function pinItem() {
    pinMutation.mutate({
      name: item.name,
      defaultQuantity: item.quantity,
      category: item.category,
    })
  }

  return (
    <>
      <Card size="sm">
        <CardContent className="flex items-center gap-3">
          <Checkbox
            checked={item.checked}
            onCheckedChange={(value) => toggleChecked(value === true)}
            disabled={updateMutation.isPending}
            aria-label={t('shoppingLists.actions.toggle')}
          />
          <div className="flex-1 min-w-0">
            <p
              className={
                item.checked
                  ? 'line-through text-muted-foreground truncate'
                  : 'truncate'
              }
            >
              {item.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('shoppingLists.detail.quantityLabel', {
                quantity: item.quantity,
              })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditOpen(true)}
            aria-label={t('shoppingLists.actions.edit')}
          >
            <Pencil />
          </Button>
          <Button
            variant={isPinned ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={pinItem}
            disabled={isPinned || pinMutation.isPending}
            aria-label={t('shoppingLists.actions.pin')}
          >
            {pinMutation.isPending ? <Spinner /> : <Pin />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => deleteMutation.mutate(item.id)}
            disabled={deleteMutation.isPending}
            aria-label={t('shoppingLists.actions.delete')}
          >
            {deleteMutation.isPending ? <Spinner /> : <Trash2 />}
          </Button>
        </CardContent>
      </Card>

      <EditItemDialog
        listId={listId}
        item={item}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
