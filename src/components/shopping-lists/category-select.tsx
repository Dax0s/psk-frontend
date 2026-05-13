import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'

import { productCategoryOrder } from '@/hooks/use-product-suggestions'
import type { ProductCategory } from '@/hooks/use-product-suggestions'

export function CategorySelect({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string
  value: ProductCategory
  onChange: (next: ProductCategory) => void
  disabled?: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as ProductCategory)}
        disabled={disabled}
        className="h-8 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-input bg-transparent py-1 pl-2.5 pr-8 text-base text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80"
      >
        {productCategoryOrder.map((category) => (
          <option
            key={category}
            value={category}
            className="bg-popover text-popover-foreground"
          >
            {t(`productCategories.${category}`)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
