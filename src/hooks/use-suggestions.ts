import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/api-provider'

export type SuggestionScopeType = 'PERSONAL' | 'FAMILY'

export type SuggestedProduct = {
  productKey: string
  displayName: string
  suggestedQuantity: number | null
  unit: string | null
  purchaseCount: number
  lastCompletedAt: string
}

export type PinnedProduct = {
  id: number
  scopeType: SuggestionScopeType
  scopeReferenceId: string
  productKey: string
  displayName: string
  defaultQuantity: number | null
  unit: string | null
  createdAt: string
  updatedAt: string
}

export type UpsertPinnedProductRequest = {
  displayName: string
  productKey?: string
  defaultQuantity?: number | null
  unit?: string | null
}

const scopePath = (scopeType: SuggestionScopeType, scopeReferenceId: string) =>
  `v1/suggestion-scopes/${scopeType}/${scopeReferenceId}`

export const suggestionKeys = {
  all: ['suggestion-scope'] as const,
  scope: (scopeType: SuggestionScopeType, scopeReferenceId: string) =>
    [...suggestionKeys.all, scopeType, scopeReferenceId] as const,
  suggestions: (scopeType: SuggestionScopeType, scopeReferenceId: string) =>
    [
      ...suggestionKeys.scope(scopeType, scopeReferenceId),
      'suggestions',
    ] as const,
  pinnedProducts: (scopeType: SuggestionScopeType, scopeReferenceId: string) =>
    [
      ...suggestionKeys.scope(scopeType, scopeReferenceId),
      'pinned-products',
    ] as const,
}

export function useSuggestions(
  scopeType: SuggestionScopeType,
  scopeReferenceId: string,
) {
  const api = useApi()
  return useQuery({
    queryKey: suggestionKeys.suggestions(scopeType, scopeReferenceId),
    queryFn: () =>
      api
        .get(`${scopePath(scopeType, scopeReferenceId)}/suggestions`)
        .json<Array<SuggestedProduct>>(),
    enabled: !!scopeReferenceId,
  })
}

export function usePinnedProducts(
  scopeType: SuggestionScopeType,
  scopeReferenceId: string,
) {
  const api = useApi()
  return useQuery({
    queryKey: suggestionKeys.pinnedProducts(scopeType, scopeReferenceId),
    queryFn: () =>
      api
        .get(`${scopePath(scopeType, scopeReferenceId)}/pinned-products`)
        .json<Array<PinnedProduct>>(),
    enabled: !!scopeReferenceId,
  })
}

export function useCreatePinnedProduct(
  scopeType: SuggestionScopeType,
  scopeReferenceId: string,
) {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpsertPinnedProductRequest) =>
      api
        .post(`${scopePath(scopeType, scopeReferenceId)}/pinned-products`, {
          json: body,
        })
        .json<PinnedProduct>(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suggestionKeys.pinnedProducts(scopeType, scopeReferenceId),
      })
      queryClient.invalidateQueries({
        queryKey: suggestionKeys.suggestions(scopeType, scopeReferenceId),
      })
    },
  })
}

export function useUpdatePinnedProduct(
  scopeType: SuggestionScopeType,
  scopeReferenceId: string,
) {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number
      body: UpsertPinnedProductRequest
    }) =>
      api
        .put(
          `${scopePath(scopeType, scopeReferenceId)}/pinned-products/${id}`,
          {
            json: body,
          },
        )
        .json<PinnedProduct>(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suggestionKeys.pinnedProducts(scopeType, scopeReferenceId),
      })
      queryClient.invalidateQueries({
        queryKey: suggestionKeys.suggestions(scopeType, scopeReferenceId),
      })
    },
  })
}

export function useDeletePinnedProduct(
  scopeType: SuggestionScopeType,
  scopeReferenceId: string,
) {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(
        `${scopePath(scopeType, scopeReferenceId)}/pinned-products/${id}`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suggestionKeys.pinnedProducts(scopeType, scopeReferenceId),
      })
      queryClient.invalidateQueries({
        queryKey: suggestionKeys.suggestions(scopeType, scopeReferenceId),
      })
    },
  })
}
