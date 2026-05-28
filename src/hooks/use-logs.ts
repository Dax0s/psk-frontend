import { useQuery } from '@tanstack/react-query'
import { useApi } from '@/api/api-provider'

export type LogEntry = {
  timestamp: string
  level: string
  logger: string
  thread: string
  message: string
}

export const logKeys = {
  all: ['admin', 'logs'] as const,
}

export function useLogs(options?: { refetchInterval?: number | false }) {
  const api = useApi()
  return useQuery({
    queryKey: logKeys.all,
    queryFn: () => api.get('admin/logs').json<Array<LogEntry>>(),
    refetchInterval: options?.refetchInterval ?? false,
  })
}
