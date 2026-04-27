import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { HTTPError } from 'ky'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { useApi } from '@/api/api-provider'
import type { FamilyDetail, FamilySummary } from '@/api/families'

const FAMILIES_KEY = ['families'] as const

// ---- Queries ----

export function useMyFamilies() {
  const api = useApi()
  return useQuery({
    queryKey: FAMILIES_KEY,
    queryFn: () => api.get('families').json<FamilySummary[]>(),
  })
}

export function useFamilyDetail(familyId: string) {
  const api = useApi()
  return useQuery({
    queryKey: [...FAMILIES_KEY, familyId],
    queryFn: () => api.get(`families/${familyId}`).json<FamilyDetail>(),
  })
}

// ---- Error helper ----

async function extractErrorCode(error: unknown): Promise<string | null> {
  if (error instanceof HTTPError) {
    try {
      const body = await error.response.json<{ error: string }>()
      return body.error ?? null
    } catch {
      return null
    }
  }
  return null
}

// ---- Mutations ----

export function useCreateFamily() {
  const api = useApi()
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ name, email }: { name: string; email?: string }) =>
      api.post('families', { json: { name, email } }).json<FamilySummary>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAMILIES_KEY })
      toast.success(t('families.success.created'))
    },
    onError: async (error) => {
      const code = await extractErrorCode(error)
      const message =
        code === 'INVALID_NAME'
          ? t('families.errors.generic')
          : t('families.errors.generic')
      toast.error(message)
    },
  })
}

export function useJoinFamily() {
  const api = useApi()
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      inviteCode,
      email,
    }: {
      inviteCode: string
      email?: string
    }) =>
      api
        .post('families/join', { json: { inviteCode, email } })
        .json<FamilySummary>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAMILIES_KEY })
      toast.success(t('families.success.joined'))
    },
    onError: async (error) => {
      const code = await extractErrorCode(error)
      const message =
        code === 'ALREADY_MEMBER'
          ? t('families.errors.alreadyMember')
          : code === 'FAMILY_NOT_FOUND'
            ? t('families.errors.familyNotFound')
            : t('families.errors.generic')
      toast.error(message)
    },
  })
}

export function useDeleteFamily() {
  const api = useApi()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (familyId: string) =>
      api.delete(`families/${familyId}`).then(() => undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAMILIES_KEY })
      toast.success(t('families.success.deleted'))
      navigate({ to: '/families/' })
    },
    onError: async () => {
      toast.error(t('families.errors.generic'))
    },
  })
}

export function useRemoveMember() {
  const api = useApi()
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ familyId, userId }: { familyId: string; userId: string }) =>
      api
        .delete(`families/${familyId}/members/${userId}`)
        .then(() => undefined),
    onSuccess: (_, { familyId }) => {
      qc.invalidateQueries({ queryKey: [...FAMILIES_KEY, familyId] })
      toast.success(t('families.success.memberRemoved'))
    },
    onError: async () => {
      toast.error(t('families.errors.generic'))
    },
  })
}

export function useLeaveFamily() {
  const api = useApi()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (familyId: string) =>
      api.post(`families/${familyId}/leave`).then(() => undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAMILIES_KEY })
      toast.success(t('families.success.left'))
      navigate({ to: '/families/' })
    },
    onError: async () => {
      toast.error(t('families.errors.generic'))
    },
  })
}
