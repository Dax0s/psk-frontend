import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { CreateShoppingListForm } from '@/components/shopping-lists/create-shopping-list-form'
import { useFamilyShoppingLists } from '@/hooks/use-shopping-lists'

export function FamilyGroceryLists({ familyId }: { familyId: string }) {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useFamilyShoppingLists(familyId)

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t('families.groceryLists')}</h2>

      <CreateShoppingListForm familyId={familyId} />

      {isLoading && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {t('families.groceryListsLoadError')}
        </p>
      )}

      {data && data.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t('families.noGroceryLists')}
        </p>
      )}

      {data && data.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.map((list) => (
            <Button
              key={list.id}
              asChild
              variant="outline"
              className="justify-start"
            >
              <Link to="/shopping-lists/$id" params={{ id: list.id }}>
                <ShoppingCart />
                {list.name}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
