import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'

import { Route as errorRoute } from '@/routes/error'
import { Navbar } from '@/components/app/navbar'
import { Footer } from '@/components/app/footer'
import { useAuth } from 'react-oidc-context'
import { CenteredSpinner } from '@/components/centered-spinner'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: Index })

function Index() {
  const { t } = useTranslation()
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-12 gap-6">
          <Button asChild size="lg">
            <Link to="/shopping-lists">
              <ShoppingCart />
              {t('shoppingLists.title')}
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
