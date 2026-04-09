import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from 'react-oidc-context'
import { useEffect } from 'react'
import { CenteredSpinner } from '@/components/centered-spinner'

export const Route = createFileRoute('/logout')({ component: Logout })

function Logout() {
  const auth = useAuth()

  useEffect(() => {
    const logout = async () => {
      try {
        await auth.removeUser()
        const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID
        const logoutUri = import.meta.env.VITE_COGNITO_LOGOUT_REDIRECT_URI
        const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
      } catch (error) {
        console.error('Logout failed: ', error)
      }
    }

    void logout()
  }, [])

  return <CenteredSpinner />
}
