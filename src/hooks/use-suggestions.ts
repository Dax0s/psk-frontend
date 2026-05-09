import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/api-provider'
import type { ProductCategory } from '@/hooks/use-product-suggestions'

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
  category?: ProductCategory
}

export type UpdatePinnedProductRequest = {
  name: string
  defaultQuantity?: number | null
  sortOrder: number
  category?: ProductCategory
}

export const suggestionKeys = {
  all: ['suggestion'] as const,
  suggestions: () => [...suggestionKeys.all, 'suggestions'] as const,
  pinnedProducts: () => [...suggestionKeys.all, 'pinned-products'] as const,
}

export function useSuggestions() {
  const api = useApi()
  return useQuery({
    queryKey: suggestionKeys.suggestions(),
    queryFn: () => api.get('suggestion').json<Array<SuggestedProduct>>(),
  })
}

export function usePinnedProducts() {
  const api = useApi()
  return useQuery({
    queryKey: suggestionKeys.pinnedProducts(),
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
      queryClient.invalidateQueries({ queryKey: suggestionKeys.all })
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
      queryClient.invalidateQueries({
        queryKey: suggestionKeys.pinnedProducts(),
      })
    },
  })
}

export function useDeletePinnedProduct() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`pinned-product/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.all })
    },
  })
}
