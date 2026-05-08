import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from 'react-oidc-context'
import { useTranslation } from 'react-i18next'

import { Route as errorRoute } from '@/routes/error'
import { Navbar } from '@/components/app/navbar'
import { Footer } from '@/components/app/footer'
import { CenteredSpinner } from '@/components/centered-spinner'
import { Spinner } from '@/components/ui/spinner'
import { CreateShoppingListForm } from '@/components/shopping-lists/create-shopping-list-form'
import { ShoppingListsGrid } from '@/components/shopping-lists/shopping-lists-grid'
import { useShoppingLists } from '@/hooks/use-shopping-lists'

export const Route = createFileRoute('/shopping-lists/')({
  component: ShoppingListsPage,
})

function ShoppingListsPage() {
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
        <ShoppingListsContent />
      </main>
      <Footer />
    </div>
  )
}

function ShoppingListsContent() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useShoppingLists()

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{t('shoppingLists.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('shoppingLists.description')}
        </p>
      </div>

      <CreateShoppingListForm />

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner className="size-8" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {t('shoppingLists.loadError')}
        </p>
      )}

      {data && <ShoppingListsGrid lists={data} />}
    </div>
  )
}
