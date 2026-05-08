import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Pin,
  Trash2,
} from 'lucide-react'
import { useAuth } from 'react-oidc-context'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useCreateShoppingListItem } from '@/hooks/use-shopping-lists'
import {
  useDeletePinnedProduct,
  usePinnedProducts,
  useUpdatePinnedProduct,
} from '@/hooks/use-suggestions'
import type { PinnedProduct } from '@/hooks/use-suggestions'

const personalScopeType = 'PERSONAL'
const pageSize = 10

export function PinnedProductsPanel({ listId }: { listId: string }) {
  const { t } = useTranslation()
  const auth = useAuth()
  const scopeReferenceId = auth.user?.profile.sub ?? ''
  const [page, setPage] = useState(0)
  const pinnedProductsQuery = usePinnedProducts(
    personalScopeType,
    scopeReferenceId,
  )
  const createItem = useCreateShoppingListItem(listId)
  const deletePinnedProduct = useDeletePinnedProduct(
    personalScopeType,
    scopeReferenceId,
  )
  const updatePinnedProduct = useUpdatePinnedProduct(
    personalScopeType,
    scopeReferenceId,
  )
  const pinnedProducts = pinnedProductsQuery.data ?? []
  const totalPages = Math.max(1, Math.ceil(pinnedProducts.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const firstVisibleIndex = safePage * pageSize
  const [movingProductIds, setMovingProductIds] = useState<Set<number>>(
    () => new Set(),
  )
  const visibleProducts = useMemo(
    () => pinnedProducts.slice(firstVisibleIndex, firstVisibleIndex + pageSize),
    [pinnedProducts, firstVisibleIndex],
  )

  function addPinnedProduct(product: PinnedProduct, quantity: number) {
    createItem.mutate({
      name: product.displayName,
      quantity,
    })
  }

  function updatePinnedQuantity(product: PinnedProduct, quantity: number) {
    updatePinnedProduct.mutate({
      id: product.id,
      body: {
        displayName: product.displayName,
        productKey: product.productKey,
        defaultQuantity: quantity,
        unit: product.unit,
        sortOrder: product.sortOrder,
      },
    })
  }

  async function movePinnedProduct(product: PinnedProduct, direction: -1 | 1) {
    const currentIndex = pinnedProducts.findIndex(
      (pin) => pin.id === product.id,
    )
    const targetIndex = currentIndex + direction

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= pinnedProducts.length ||
      updatePinnedProduct.isPending
    ) {
      return
    }

    const targetProduct = pinnedProducts[targetIndex]
    const productSortOrder =
      product.sortOrder === targetProduct.sortOrder
        ? targetIndex
        : targetProduct.sortOrder
    const targetSortOrder =
      product.sortOrder === targetProduct.sortOrder
        ? currentIndex
        : product.sortOrder
    const movingIds = new Set([product.id, targetProduct.id])

    setMovingProductIds(movingIds)
    try {
      await updatePinnedProduct.mutateAsync({
        id: product.id,
        body: pinnedProductRequest(product, productSortOrder),
      })
      await updatePinnedProduct.mutateAsync({
        id: targetProduct.id,
        body: pinnedProductRequest(targetProduct, targetSortOrder),
      })
    } finally {
      setMovingProductIds(new Set())
    }
  }

  return (
    <Card className="lg:sticky lg:top-20">
      <CardHeader className="grid-cols-[1fr_auto]">
        <CardTitle className="flex items-center gap-2">
          <Pin className="size-4" />
          {t('shoppingLists.pins.title')}
        </CardTitle>
        <PinnedProductsPagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </CardHeader>
      <CardContent>
        <PinnedProductsContent
          products={visibleProducts}
          firstVisibleIndex={firstVisibleIndex}
          totalProductCount={pinnedProducts.length}
          isLoading={pinnedProductsQuery.isLoading}
          isError={pinnedProductsQuery.isError}
          adding={createItem.isPending}
          deletingId={
            deletePinnedProduct.isPending
              ? deletePinnedProduct.variables
              : undefined
          }
          updatingId={
            updatePinnedProduct.isPending
              ? updatePinnedProduct.variables.id
              : undefined
          }
          movingIds={movingProductIds}
          onAdd={addPinnedProduct}
          onDelete={(id) => deletePinnedProduct.mutate(id)}
          onQuantityChange={updatePinnedQuantity}
          onMove={movePinnedProduct}
        />
        <PinnedProductsPagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-3 justify-center"
        />
      </CardContent>
    </Card>
  )
}

function PinnedProductsPagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}) {
  const { t } = useTranslation()

  if (totalPages <= 1) {
    return null
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-end gap-1 ${className}`}
    >
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        aria-label={t('shoppingLists.pins.previous')}
      >
        <ChevronLeft />
      </Button>
      {Array.from({ length: totalPages }, (_, index) => (
        <Button
          key={index}
          variant={index === currentPage ? 'secondary' : 'ghost'}
          size="icon-xs"
          onClick={() => onPageChange(index)}
          aria-label={t('shoppingLists.pins.pageLabel', {
            page: index + 1,
          })}
        >
          {index + 1}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage >= totalPages - 1}
        aria-label={t('shoppingLists.pins.next')}
      >
        <ChevronRight />
      </Button>
    </div>
  )
}

function PinnedProductsContent({
  products,
  firstVisibleIndex,
  totalProductCount,
  isLoading,
  isError,
  adding,
  deletingId,
  updatingId,
  movingIds,
  onAdd,
  onDelete,
  onQuantityChange,
  onMove,
}: {
  products: Array<PinnedProduct>
  firstVisibleIndex: number
  totalProductCount: number
  isLoading: boolean
  isError: boolean
  adding: boolean
  deletingId?: number
  updatingId?: number
  movingIds: Set<number>
  onAdd: (product: PinnedProduct, quantity: number) => void
  onDelete: (id: number) => void
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

function PinnedProductRow({
  product,
  adding,
  deleting,
  updating,
  moving,
  canMoveUp,
  canMoveDown,
  onAdd,
  onDelete,
  onQuantityChange,
  onMove,
}: {
  product: PinnedProduct
  adding: boolean
  deleting: boolean
  updating: boolean
  moving: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onAdd: (product: PinnedProduct, quantity: number) => void
  onDelete: (id: number) => void
  onQuantityChange: (product: PinnedProduct, quantity: number) => void
  onMove: (product: PinnedProduct, direction: -1 | 1) => void
}) {
  const initialQuantity = quantityValue(product)
  const [quantity, setQuantity] = useState(formatQuantity(initialQuantity))
  const parsedQuantity = parseQuantity(quantity)
  const canUseQuantity = parsedQuantity !== null
  const { t } = useTranslation()

  useEffect(() => {
    setQuantity(formatQuantity(initialQuantity))
  }, [initialQuantity])

  function saveQuantity() {
    if (parsedQuantity === null || parsedQuantity === initialQuantity) {
      return
    }

    onQuantityChange(product, parsedQuantity)
  }

  function addCurrentQuantity() {
    if (canUseQuantity && !adding) {
      onAdd(product, parsedQuantity)
    }
  }

  return (
    <div
      role="button"
      tabIndex={canUseQuantity && !adding ? 0 : -1}
      className="grid cursor-pointer grid-cols-[1.75rem_minmax(0,1fr)_4.5rem_auto] items-center gap-2 rounded-lg border px-2 py-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      onClick={addCurrentQuantity}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          addCurrentQuantity()
        }
      }}
      aria-label={t('shoppingLists.pins.addLabel', {
        name: product.displayName,
      })}
    >
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(event) => {
            event.stopPropagation()
            onMove(product, -1)
          }}
          disabled={!canMoveUp || moving}
          aria-label={t('shoppingLists.pins.moveUpLabel', {
            name: product.displayName,
          })}
        >
          {moving ? <Spinner /> : <ArrowUp />}
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(event) => {
            event.stopPropagation()
            onMove(product, 1)
          }}
          disabled={!canMoveDown || moving}
          aria-label={t('shoppingLists.pins.moveDownLabel', {
            name: product.displayName,
          })}
        >
          <ArrowDown />
        </Button>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{product.displayName}</p>
        {product.unit && (
          <p className="truncate text-xs text-muted-foreground">
            {product.unit}
          </p>
        )}
      </div>
      <Input
        type="number"
        min="0"
        step="any"
        inputMode="decimal"
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
        onBlur={saveQuantity}
        onKeyDown={(event) => {
          event.stopPropagation()
          if (event.key === 'Enter') {
            event.currentTarget.blur()
          }
        }}
        disabled={updating}
        aria-label={t('shoppingLists.pins.quantityLabel', {
          name: product.displayName,
        })}
        className="h-7 px-2 text-sm"
        onClick={(event) => event.stopPropagation()}
      />
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={(event) => {
          event.stopPropagation()
          onDelete(product.id)
        }}
        disabled={deleting}
        aria-label={t('shoppingLists.pins.deleteLabel', {
          name: product.displayName,
        })}
      >
        {deleting ? <Spinner /> : <Trash2 />}
      </Button>
    </div>
  )
}

function pinnedProductRequest(product: PinnedProduct, sortOrder: number) {
  return {
    displayName: product.displayName,
    productKey: product.productKey,
    defaultQuantity: product.defaultQuantity,
    unit: product.unit,
    sortOrder,
  }
}

function quantityValue(product: PinnedProduct) {
  return product.defaultQuantity ?? 1
}

function formatQuantity(quantity: number) {
  return Number.isInteger(quantity) ? String(quantity) : String(quantity)
}

function parseQuantity(value: string) {
  const quantity = Number(value)
  return Number.isFinite(quantity) && quantity >= 0 ? quantity : null
}
