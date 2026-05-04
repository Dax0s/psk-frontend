import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EditShoppingListDialog } from '@/components/shopping-lists/edit-shopping-list-dialog'
import { DeleteShoppingListDialog } from '@/components/shopping-lists/delete-shopping-list-dialog'
import type { ShoppingList } from '@/hooks/use-shopping-lists'

export function ShoppingListHeader({ list }: { list: ShoppingList }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const checkedCount = list.items.filter((i) => i.checked).length

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{list.name}</h1>
          <p className="text-sm text-muted-foreground">
            {t('shoppingLists.itemsProgress', {
              checked: checkedCount,
              total: list.items.length,
            })}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setEditOpen(true)}
            aria-label={t('shoppingLists.actions.edit')}
          >
            <Pencil />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDeleteOpen(true)}
            aria-label={t('shoppingLists.actions.delete')}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <EditShoppingListDialog
        list={list}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteShoppingListDialog
        list={list}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate({ to: '/shopping-lists' })}
      />
    </>
  )
}
