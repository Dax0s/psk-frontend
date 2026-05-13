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
  onDelete: (id: string) => void
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
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm font-medium break-words" title={product.name}>
          {product.name}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onMove(product, -1)}
            disabled={!canMoveUp || moving}
            aria-label={t('shoppingLists.pins.moveUpLabel', {
              name: product.name,
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
              name: product.name,
            })}
          >
            <ArrowDown />
          </Button>
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
              name: product.name,
            })}
            className="h-7 flex-1 min-w-0 px-2 text-sm"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={addToList}
            disabled={adding || parsedQuantity === null}
            aria-label={t('shoppingLists.pins.addLabel', {
              name: product.name,
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
              name: product.name,
            })}
          >
            {deleting ? <Spinner /> : <Trash2 />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function parseQuantity(value: string) {
  const quantity = Number(value)
  return Number.isFinite(quantity) && quantity >= 0 ? quantity : null
}
