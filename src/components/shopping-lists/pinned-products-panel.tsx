import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Pin, Trash2 } from 'lucide-react'
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
const pageSize = 6

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
  const visibleProducts = useMemo(
    () =>
      pinnedProducts.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [pinnedProducts, safePage],
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
      },
    })
  }

  return (
    <Card className="lg:sticky lg:top-20">
      <CardHeader className="grid-cols-[1fr_auto]">
        <CardTitle className="flex items-center gap-2">
          <Pin className="size-4" />
          {t('shoppingLists.pins.title')}
        </CardTitle>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={safePage === 0}
              aria-label={t('shoppingLists.pins.previous')}
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-8 text-center text-xs text-muted-foreground">
              {safePage + 1}/{totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() =>
                setPage((current) => Math.min(totalPages - 1, current + 1))
              }
              disabled={safePage >= totalPages - 1}
              aria-label={t('shoppingLists.pins.next')}
            >
              <ChevronRight />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <PinnedProductsContent
          products={visibleProducts}
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
          onAdd={addPinnedProduct}
          onDelete={(id) => deletePinnedProduct.mutate(id)}
          onQuantityChange={updatePinnedQuantity}
        />
      </CardContent>
    </Card>
  )
}

function PinnedProductsContent({
  products,
  isLoading,
  isError,
  adding,
  deletingId,
  updatingId,
  onAdd,
  onDelete,
  onQuantityChange,
}: {
  products: Array<PinnedProduct>
  isLoading: boolean
  isError: boolean
  adding: boolean
  deletingId?: number
  updatingId?: number
  onAdd: (product: PinnedProduct, quantity: number) => void
  onDelete: (id: number) => void
  onQuantityChange: (product: PinnedProduct, quantity: number) => void
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
      {products.map((product) => (
        <PinnedProductRow
          key={product.id}
          product={product}
          adding={adding}
          deleting={deletingId === product.id}
          updating={updatingId === product.id}
          onAdd={onAdd}
          onDelete={onDelete}
          onQuantityChange={onQuantityChange}
        />
      ))}
    </div>
  )
}

function PinnedProductRow({
  product,
  adding,
  deleting,
  updating,
  onAdd,
  onDelete,
  onQuantityChange,
}: {
  product: PinnedProduct
  adding: boolean
  deleting: boolean
  updating: boolean
  onAdd: (product: PinnedProduct, quantity: number) => void
  onDelete: (id: number) => void
  onQuantityChange: (product: PinnedProduct, quantity: number) => void
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
      className="grid cursor-pointer grid-cols-[minmax(0,1fr)_4.5rem_auto] items-center gap-2 rounded-lg border px-2 py-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
