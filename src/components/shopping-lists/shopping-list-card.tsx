import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { EditShoppingListDialog } from '@/components/shopping-lists/edit-shopping-list-dialog'
import { DeleteShoppingListDialog } from '@/components/shopping-lists/delete-shopping-list-dialog'
import type { ShoppingList } from '@/hooks/use-shopping-lists'

export function ShoppingListCard({ list }: { list: ShoppingList }) {
  const { t } = useTranslation()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const checkedCount = list.items.filter((i) => i.checked).length
  const totalCount = list.items.length

  return (
    <>
      <Card>
        <CardHeader>
          <Link
            to="/shopping-lists/$id"
            params={{ id: list.id }}
            className="hover:underline"
          >
            <CardTitle>{list.name}</CardTitle>
          </Link>
          <CardDescription>
            {t('shoppingLists.itemsProgress', {
              checked: checkedCount,
              total: totalCount,
            })}
          </CardDescription>
          <CardAction>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditOpen(true)}
                aria-label={t('shoppingLists.actions.edit')}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleteOpen(true)}
                aria-label={t('shoppingLists.actions.delete')}
              >
                <Trash2 />
              </Button>
            </div>
          </CardAction>
        </CardHeader>
      </Card>

      <EditShoppingListDialog
        list={list}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteShoppingListDialog
        list={list}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
