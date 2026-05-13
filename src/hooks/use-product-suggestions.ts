import { useQuery } from '@tanstack/react-query'
import { useApi } from '@/api/api-provider'

export const productCategoryOrder = [
  'DAIRY_AND_EGGS',
  'MEAT',
  'FISH',
  'FRUITS_AND_VEGETABLES',
  'GROCERIES',
  'SWEETS',
  'CONFECTIONERY',
  'BEVERAGES',
  'COFFEE_TEA',
  'FROZEN',
  'CANNED',
  'PREPARED_FOODS',
  'BABY',
  'COSMETICS',
  'HOUSEHOLD_CHEMICALS',
  'INDUSTRIAL',
  'PLANTS',
  'OTHER',
] as const

export type ProductCategory = (typeof productCategoryOrder)[number]

export type ProductSuggestion = {
  id: string
  name: string
  category: ProductCategory
  price: number | null
  oldPrice: string | null
  discountPct: number | null
  unitPrice: string | null
  validTo: string | null
  promo: string | null
  imageUrl: string | null
}

export const productSuggestionKeys = {
  all: ['products', 'suggestions'] as const,
  search: (q: string, limit: number) =>
    [...productSuggestionKeys.all, q, limit] as const,
}

export const MIN_PRODUCT_QUERY_LENGTH = 3

export function useProductSuggestions(q: string, limit = 10) {
  const api = useApi()
  const trimmed = q.trim()
  return useQuery({
    queryKey: productSuggestionKeys.search(trimmed, limit),
    queryFn: () =>
      api
        .get('products/suggestions', {
          searchParams: { q: trimmed, limit },
        })
        .json<Array<ProductSuggestion>>(),
    enabled: trimmed.length >= MIN_PRODUCT_QUERY_LENGTH,
    staleTime: 60_000,
  })
}
