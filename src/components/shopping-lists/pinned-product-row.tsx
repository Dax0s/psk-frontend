import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import type { PinnedProduct } from '@/hooks/use-suggestions'

export function PinnedProductRow({
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
  const { t } = useTranslation()
  const initialQuantity = product.defaultQuantity ?? 1
  const [quantity, setQuantity] = useState(String(initialQuantity))

  useEffect(() => {
    setQuantity(String(initialQuantity))
  }, [initialQuantity])

  const parsedQuantity = parseQuantity(quantity)

  function saveQuantity() {
    if (parsedQuantity === null || parsedQuantity === initialQuantity) {
      return
    }
    onQuantityChange(product, parsedQuantity)
  }

  function addToList() {
    if (parsedQuantity !== null && !adding) {
      onAdd(product, parsedQuantity)
    }
  }

  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-2">
        <div className="flex flex-col">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onMove(product, -1)}
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
            onClick={() => onMove(product, 1)}
            disabled={!canMoveDown || moving}
            aria-label={t('shoppingLists.pins.moveDownLabel', {
              name: product.displayName,
            })}
          >
            <ArrowDown />
          </Button>
        </div>
        <div className="flex-1 min-w-0">
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
          onChange={(e) => setQuantity(e.target.value)}
          onBlur={saveQuantity}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
          disabled={updating}
          aria-label={t('shoppingLists.pins.quantityLabel', {
            name: product.displayName,
          })}
          className="h-7 w-16 px-2 text-sm"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={addToList}
          disabled={adding || parsedQuantity === null}
          aria-label={t('shoppingLists.pins.addLabel', {
            name: product.displayName,
          })}
        >
          {adding ? <Spinner /> : <Plus />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(product.id)}
          disabled={deleting}
          aria-label={t('shoppingLists.pins.deleteLabel', {
            name: product.displayName,
          })}
        >
          {deleting ? <Spinner /> : <Trash2 />}
        </Button>
      </CardContent>
    </Card>
  )
}

function parseQuantity(value: string) {
  const quantity = Number(value)
  return Number.isFinite(quantity) && quantity >= 0 ? quantity : null
}
