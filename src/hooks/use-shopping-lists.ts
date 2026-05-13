import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/api-provider'
import { suggestionKeys } from '@/hooks/use-suggestions'
import type { ProductCategory } from '@/hooks/use-product-suggestions'

export type ShoppingListItem = {
  id: string
  name: string
  quantity: number
  checked: boolean
  category: ProductCategory
}

export type ShoppingList = {
  id: string
  name: string
  items: Array<ShoppingListItem>
  familyId?: string | null
  familyName?: string | null
}

export type ShoppingListRequest = {
  name: string
  familyId?: string
}

export type CreateShoppingListItemRequest = {
  name: string
  quantity: number
  category?: ProductCategory
}

export type UpdateShoppingListItemRequest = {
  name: string
  quantity: number
  checked: boolean
  category?: ProductCategory
}

export const shoppingListKeys = {
  all: ['shopping-lists'] as const,
  detail: (id: string) => ['shopping-lists', id] as const,
  byFamily: (familyId: string) =>
    ['shopping-lists', 'family', familyId] as const,
}

export function useShoppingLists() {
  const api = useApi()
  return useQuery({
    queryKey: shoppingListKeys.all,
    queryFn: () => api.get('shopping-list').json<Array<ShoppingList>>(),
  })
}

export function useShoppingList(id: string) {
  const api = useApi()
  return useQuery({
    queryKey: shoppingListKeys.detail(id),
    queryFn: () => api.get(`shopping-list/${id}`).json<ShoppingList>(),
    enabled: !!id,
  })
}

export function useFamilyShoppingLists(familyId: string) {
  const api = useApi()
  return useQuery({
    queryKey: shoppingListKeys.byFamily(familyId),
    queryFn: () =>
      api.get(`shopping-list/family/${familyId}`).json<Array<ShoppingList>>(),
    enabled: !!familyId,
  })
}

export function useCreateShoppingList() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ShoppingListRequest) =>
      api.post('shopping-list', { json: body }).json<ShoppingList>(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all })
      if (data.familyId) {
        queryClient.invalidateQueries({
          queryKey: shoppingListKeys.byFamily(data.familyId),
        })
      }
    },
  })
}

export function useUpdateShoppingList() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ShoppingListRequest }) =>
      api.put(`shopping-list/${id}`, { json: body }).json<ShoppingList>(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all })
      queryClient.invalidateQueries({
        queryKey: shoppingListKeys.detail(data.id),
      })
    },
  })
}

export function useDeleteShoppingList() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`shopping-list/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all })
      queryClient.removeQueries({ queryKey: shoppingListKeys.detail(id) })
    },
  })
}

export function useCreateShoppingListItem(listId: string) {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateShoppingListItemRequest) =>
      api
        .post(`shopping-list/${listId}`, { json: body })
        .json<ShoppingListItem>(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shoppingListKeys.detail(listId),
      })
      queryClient.invalidateQueries({ queryKey: suggestionKeys.all })
    },
  })
}

export function useUpdateShoppingListItem(listId: string) {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      itemId,
      body,
    }: {
      itemId: string
      body: UpdateShoppingListItemRequest
    }) =>
      api
        .put(`shopping-list/${listId}/item/${itemId}`, { json: body })
        .json<ShoppingListItem>(),
    onMutate: async ({ itemId, body }) => {
      const detailKey = shoppingListKeys.detail(listId)
      await queryClient.cancelQueries({ queryKey: detailKey })
      const previous = queryClient.getQueryData<ShoppingList>(detailKey)
      queryClient.setQueryData<ShoppingList>(detailKey, (prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                i.id === itemId
                  ? {
                      ...i,
                      name: body.name,
                      quantity: body.quantity,
                      checked: body.checked,
                      category: body.category ?? i.category,
                    }
                  : i,
              ),
            }
          : prev,
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          shoppingListKeys.detail(listId),
          context.previous,
        )
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<ShoppingList>(
        shoppingListKeys.detail(listId),
        (prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.map((i) =>
                  i.id === updated.id ? updated : i,
                ),
              }
            : prev,
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: suggestionKeys.all,
        refetchType: 'none',
      })
    },
  })
}

export function useDeleteShoppingListItem(listId: string) {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) =>
      api.delete(`shopping-list/${listId}/item/${itemId}`),
    onMutate: async (itemId) => {
      const detailKey = shoppingListKeys.detail(listId)
      await queryClient.cancelQueries({ queryKey: detailKey })
      const previous = queryClient.getQueryData<ShoppingList>(detailKey)
      queryClient.setQueryData<ShoppingList>(detailKey, (prev) =>
        prev
          ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) }
          : prev,
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          shoppingListKeys.detail(listId),
          context.previous,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: suggestionKeys.all,
        refetchType: 'none',
      })
    },
  })
}
