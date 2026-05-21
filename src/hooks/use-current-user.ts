import { useQuery } from '@tanstack/react-query'
import { useAuth } from 'react-oidc-context'
import { useApi } from '@/api/api-provider'

export type UserRole = 'REGULAR' | 'ADMIN'

export type CurrentUser = {
  id: string
  email: string | null
  role: UserRole
}

export const currentUserKeys = {
  me: ['users', 'me'] as const,
}

export function useCurrentUser() {
  const api = useApi()
  const auth = useAuth()
  return useQuery({
    queryKey: currentUserKeys.me,
    queryFn: () => api.get('users/me').json<CurrentUser>(),
    enabled: auth.isAuthenticated,
  })
}
