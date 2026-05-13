import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pin } from 'lucide-react'

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { PinnedProductRow } from '@/components/shopping-lists/pinned-product-row'
import { PinnedProductsPagination } from '@/components/shopping-lists/pinned-products-pagination'
import { useCreateShoppingListItem } from '@/hooks/use-shopping-lists'
import {
  useDeletePinnedProduct,
  usePinnedProducts,
  useUpdatePinnedProduct,
} from '@/hooks/use-suggestions'
import type { PinnedProduct } from '@/hooks/use-suggestions'

const PAGE_SIZE = 10

export function PinnedProductsPanel({ listId }: { listId: string }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [movingIds, setMovingIds] = useState<Set<string>>(() => new Set())

  const pinnedProductsQuery = usePinnedProducts()
  const createItem = useCreateShoppingListItem(listId)
  const deletePin = useDeletePinnedProduct()
  const updatePin = useUpdatePinnedProduct()

  const pinnedProducts = pinnedProductsQuery.data ?? []
  const totalPages = Math.max(1, Math.ceil(pinnedProducts.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const firstVisibleIndex = safePage * PAGE_SIZE
  const visibleProducts = pinnedProducts.slice(
    firstVisibleIndex,
    firstVisibleIndex + PAGE_SIZE,
  )

  function addToList(product: PinnedProduct, quantity: number) {
    createItem.mutate({
      name: product.name,
      quantity,
      category: product.category,
    })
  }

  function changeQuantity(product: PinnedProduct, quantity: number) {
    updatePin.mutate({
      id: product.id,
      body: pinnedProductRequest(product, { defaultQuantity: quantity }),
    })
  }

  async function movePinnedProduct(product: PinnedProduct, direction: -1 | 1) {
    const currentIndex = pinnedProducts.findIndex((p) => p.id === product.id)
    const targetIndex = currentIndex + direction
    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= pinnedProducts.length ||
      updatePin.isPending
    ) {
      return
    }

    const target = pinnedProducts[targetIndex]
    const sameSortOrder = product.sortOrder === target.sortOrder
    const nextProductOrder = sameSortOrder ? targetIndex : target.sortOrder
    const nextTargetOrder = sameSortOrder ? currentIndex : product.sortOrder

    setMovingIds(new Set([product.id, target.id]))
    try {
      await updatePin.mutateAsync({
        id: product.id,
        body: pinnedProductRequest(product, { sortOrder: nextProductOrder }),
      })
      await updatePin.mutateAsync({
        id: target.id,
        body: pinnedProductRequest(target, { sortOrder: nextTargetOrder }),
      })
    } finally {
      setMovingIds(new Set())
    }
  }

  return (
    <Card className="lg:sticky lg:top-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pin className="size-4" />
          {t('shoppingLists.pins.title')}
        </CardTitle>
        <CardAction>
          <PinnedProductsPagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <PinnedProductsBody
          isLoading={pinnedProductsQuery.isLoading}
          isError={pinnedProductsQuery.isError}
          products={visibleProducts}
          firstVisibleIndex={firstVisibleIndex}
          totalProductCount={pinnedProducts.length}
          adding={createItem.isPending}
          deletingId={deletePin.isPending ? deletePin.variables : undefined}
          updatingId={updatePin.isPending ? updatePin.variables.id : undefined}
          movingIds={movingIds}
          onAdd={addToList}
          onDelete={(id) => deletePin.mutate(id)}
          onQuantityChange={changeQuantity}
          onMove={movePinnedProduct}
        />
      </CardContent>
    </Card>
  )
}

function PinnedProductsBody({
  isLoading,
  isError,
  products,
  firstVisibleIndex,
  totalProductCount,
  adding,
  deletingId,
  updatingId,
  movingIds,
  onAdd,
  onDelete,
  onQuantityChange,
  onMove,
}: {
  isLoading: boolean
  isError: boolean
  products: Array<PinnedProduct>
  firstVisibleIndex: number
  totalProductCount: number
  adding: boolean
  deletingId?: string
  updatingId?: string
  movingIds: Set<string>
  onAdd: (product: PinnedProduct, quantity: number) => void
  onDelete: (id: string) => void
  onQuantityChange: (product: PinnedProduct, quantity: number) => void
  onMove: (product: PinnedProduct, direction: -1 | 1) => void
}) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {t('shoppingLists.pins.loadError')}
      </p>
    )
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('shoppingLists.pins.empty')}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {products.map((product, index) => {
        const productIndex = firstVisibleIndex + index
        return (
          <PinnedProductRow
            key={product.id}
            product={product}
            adding={adding}
            deleting={deletingId === product.id}
            updating={updatingId === product.id}
            moving={movingIds.has(product.id)}
            canMoveUp={productIndex > 0}
            canMoveDown={productIndex < totalProductCount - 1}
            onAdd={onAdd}
            onDelete={onDelete}
            onQuantityChange={onQuantityChange}
            onMove={onMove}
          />
        )
      })}
    </div>
  )
}

function pinnedProductRequest(
  product: PinnedProduct,
  overrides: { defaultQuantity?: number; sortOrder?: number },
) {
  return {
    name: product.name,
    defaultQuantity: overrides.defaultQuantity ?? product.defaultQuantity,
    sortOrder: overrides.sortOrder ?? product.sortOrder,
    category: product.category,
  }
}
