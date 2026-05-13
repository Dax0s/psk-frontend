import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/api-provider'

export type ProductCategory =
  | 'DAIRY_AND_EGGS'
  | 'MEAT'
  | 'FISH'
  | 'FRUITS_AND_VEGETABLES'
  | 'GROCERIES'
  | 'SWEETS'
  | 'CONFECTIONERY'
  | 'BEVERAGES'
  | 'COFFEE_TEA'
  | 'FROZEN'
  | 'CANNED'
  | 'PREPARED_FOODS'
  | 'BABY'
  | 'COSMETICS'
  | 'HOUSEHOLD_CHEMICALS'
  | 'INDUSTRIAL'
  | 'PLANTS'
  | 'OTHER'

export type SuggestedProduct = {
  name: string
  suggestedQuantity: number
  entryCount: number
  category: ProductCategory
}

export type PinnedProduct = {
  id: string
  name: string
  defaultQuantity: number | null
  sortOrder: number
  category: ProductCategory
}

export type CreatePinnedProductRequest = {
  name: string
  defaultQuantity?: number | null
  sortOrder?: number | null
  category?: ProductCategory | null
}

export type UpdatePinnedProductRequest = {
  name: string
  defaultQuantity?: number | null
  sortOrder: number
  category?: ProductCategory | null
}

export const suggestionKeys = {
  suggestions: ['suggestions'] as const,
  pinnedProducts: ['pinned-products'] as const,
}

export function useSuggestions() {
  const api = useApi()
  return useQuery({
    queryKey: suggestionKeys.suggestions,
    queryFn: () => api.get('suggestion').json<Array<SuggestedProduct>>(),
  })
}

export function usePinnedProducts() {
  const api = useApi()
  return useQuery({
    queryKey: suggestionKeys.pinnedProducts,
    queryFn: () => api.get('pinned-product').json<Array<PinnedProduct>>(),
  })
}

export function useCreatePinnedProduct() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePinnedProductRequest) =>
      api.post('pinned-product', { json: body }).json<PinnedProduct>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.pinnedProducts })
      queryClient.invalidateQueries({ queryKey: suggestionKeys.suggestions })
    },
  })
}

export function useUpdatePinnedProduct() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: UpdatePinnedProductRequest
    }) => api.put(`pinned-product/${id}`, { json: body }).json<PinnedProduct>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.pinnedProducts })
      queryClient.invalidateQueries({ queryKey: suggestionKeys.suggestions })
    },
  })
}

export function useDeletePinnedProduct() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`pinned-product/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.pinnedProducts })
      queryClient.invalidateQueries({ queryKey: suggestionKeys.suggestions })
    },
  })
}
