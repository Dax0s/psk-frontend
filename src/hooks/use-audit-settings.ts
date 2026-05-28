import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/api-provider'

export type AuditSettings = {
  enabled: boolean
  includeArgs: boolean
}

export type UpdateAuditSettingsRequest = Partial<AuditSettings>

export const auditSettingsKeys = {
  all: ['admin', 'audit'] as const,
}

export function useAuditSettings() {
  const api = useApi()
  return useQuery({
    queryKey: auditSettingsKeys.all,
    queryFn: () => api.get('admin/audit').json<AuditSettings>(),
  })
}

export function useUpdateAuditSettings() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateAuditSettingsRequest) => {
      const searchParams = new URLSearchParams()
      if (body.enabled !== undefined)
        searchParams.set('enabled', String(body.enabled))
      if (body.includeArgs !== undefined)
        searchParams.set('includeArgs', String(body.includeArgs))
      return api.put('admin/audit', { searchParams }).json<AuditSettings>()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(auditSettingsKeys.all, data)
    },
  })
}
