import { createFileRoute, Navigate } from '@tanstack/react-router'

import { Route as errorRoute } from '@/routes/error'
import { Navbar } from '@/components/app/navbar'
import { Footer } from '@/components/app/footer'
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

  console.log(auth.user?.access_token)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-4xl font-bold mb-4">Welcome</h1>
          <p className="text-muted-foreground">
            This is your default home page. Start building your application
            here.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
