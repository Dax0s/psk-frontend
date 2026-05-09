import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/api-provider'
import { suggestionKeys } from '@/hooks/use-suggestions'

export type ShoppingListItem = {
  id: string
  name: string
  quantity: number
  checked: boolean
}

export type ShoppingList = {
  id: string
  name: string
  items: Array<ShoppingListItem>
}

export type ShoppingListRequest = {
  name: string
}

export type CreateShoppingListItemRequest = {
  name: string
  quantity: number
}

export type UpdateShoppingListItemRequest = {
  name: string
  quantity: number
  checked: boolean
}

export const shoppingListKeys = {
  all: ['shopping-lists'] as const,
  detail: (id: string) => ['shopping-lists', id] as const,
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

export function useCreateShoppingList() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ShoppingListRequest) =>
      api.post('shopping-list', { json: body }).json<ShoppingList>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all })
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
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all })
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shoppingListKeys.detail(listId),
      })
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all })
      queryClient.invalidateQueries({ queryKey: suggestionKeys.all })
    },
  })
}

export function useDeleteShoppingListItem(listId: string) {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) =>
      api.delete(`shopping-list/${listId}/item/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shoppingListKeys.detail(listId),
      })
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all })
      queryClient.invalidateQueries({ queryKey: suggestionKeys.all })
    },
  })
}
