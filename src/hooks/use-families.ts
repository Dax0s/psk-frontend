import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/api-provider'
import { shoppingListKeys } from '@/hooks/use-shopping-lists'

export type FamilySummary = {
  id: string
  name: string
  inviteCode: string
  isAdmin: boolean
  memberCount: number
}

export type FamilyMember = {
  userId: string
  email: string | null
  joinedAt: string
  isAdmin: boolean
}

export type Family = FamilySummary & {
  createdAt: string
  members: Array<FamilyMember>
}

export type CreateFamilyRequest = {
  name: string
  email?: string
}

export type JoinFamilyRequest = {
  inviteCode: string
  email?: string
}

export const familyKeys = {
  all: ['families'] as const,
  detail: (id: string) => ['families', id] as const,
}

export function useFamilies() {
  const api = useApi()
  return useQuery({
    queryKey: familyKeys.all,
    queryFn: () => api.get('family').json<Array<FamilySummary>>(),
  })
}

export function useFamily(id: string) {
  const api = useApi()
  return useQuery({
    queryKey: familyKeys.detail(id),
    queryFn: () => api.get(`family/${id}`).json<Family>(),
    enabled: !!id,
  })
}

export function useCreateFamily() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateFamilyRequest) =>
      api.post('family', { json: body }).json<FamilySummary>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.all })
    },
  })
}

export function useJoinFamily() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: JoinFamilyRequest) =>
      api.post('family/join', { json: body }).json<FamilySummary>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.all })
    },
  })
}

export function useDeleteFamily() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`family/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: familyKeys.all })
      queryClient.removeQueries({ queryKey: familyKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all })
    },
  })
}

export function useLeaveFamily() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`family/${id}/leave`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: familyKeys.all })
      queryClient.removeQueries({ queryKey: familyKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all })
    },
  })
}

export function useRemoveFamilyMember(familyId: string) {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      api.delete(`family/${familyId}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: familyKeys.detail(familyId),
      })
    },
  })
}
