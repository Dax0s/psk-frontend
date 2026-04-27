import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useAuth } from 'react-oidc-context'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

import { Route as errorRoute } from '@/routes/error'
import { Navbar } from '@/components/app/navbar'
import { Footer } from '@/components/app/footer'
import { CenteredSpinner } from '@/components/centered-spinner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ShoppingListHeader } from '@/components/shopping-lists/shopping-list-header'
import { AddItemForm } from '@/components/shopping-lists/add-item-form'
import { ItemsList } from '@/components/shopping-lists/items-list'
import { useShoppingList } from '@/hooks/use-shopping-lists'

export const Route = createFileRoute('/shopping-lists/$id')({
  component: ShoppingListDetailPage,
})

function ShoppingListDetailPage() {
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
        <ShoppingListDetailContent />
      </main>
      <Footer />
    </div>
  )
}

function ShoppingListDetailContent() {
  const { t } = useTranslation()
  const { id } = Route.useParams()
  const { data, isLoading, isError } = useShoppingList(id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 max-w-3xl mx-auto">
        <p className="text-sm text-destructive">
          {t('shoppingLists.detail.loadError')}
        </p>
        <Button asChild variant="outline">
          <Link to="/shopping-lists">
            <ArrowLeft />
            {t('shoppingLists.detail.back')}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="self-start">
        <Link to="/shopping-lists">
          <ArrowLeft />
          {t('shoppingLists.detail.back')}
        </Link>
      </Button>

      <ShoppingListHeader list={data} />

      <AddItemForm listId={data.id} />

      <ItemsList list={data} />
    </div>
  )
}
