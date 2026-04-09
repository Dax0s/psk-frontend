import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from 'react-oidc-context'
import ky from 'ky'
import type { KyInstance } from 'ky'

const ApiContext = createContext<KyInstance>(null!)

export function ApiProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  const api = useMemo(
    () =>
      ky.create({
        prefixUrl: '/api',
        timeout: 30000,
        retry: { limit: 0 },
        hooks: {
          beforeRequest: [
            async (request) => {
              if (auth.user?.access_token) {
                request.headers.set(
                  'Authorization',
                  `Bearer ${auth.user.access_token}`,
                )
              }
            },
          ],
        },
      }),
    [auth.user?.access_token],
  )

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

export const useApi = () => useContext(ApiContext)
