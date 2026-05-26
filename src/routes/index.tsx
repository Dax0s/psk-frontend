import { createFileRoute, Navigate } from '@tanstack/react-router'

import { Route as errorRoute } from '@/routes/error'
import { useAuth } from 'react-oidc-context'
import { CenteredSpinner } from '@/components/centered-spinner'

export const Route = createFileRoute('/')({ component: Index })

function Index() {
  const auth = useAuth()
  if (auth.isLoading) {
    return <CenteredSpinner />
  }

  if (auth.error) {
    return <Navigate to={errorRoute.to} />
  }

  if (!auth.isAuthenticated) {
    auth.signinRedirect()
    return <CenteredSpinner />
  }

  return <Navigate to="/shopping-lists" />
}
