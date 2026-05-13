import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from 'react-oidc-context'
import { useTranslation } from 'react-i18next'

import { Route as errorRoute } from '@/routes/error'
import { Navbar } from '@/components/app/navbar'
import { Footer } from '@/components/app/footer'
import { CenteredSpinner } from '@/components/centered-spinner'
import { Spinner } from '@/components/ui/spinner'
import { CreateFamilyDialog } from '@/components/families/create-family-dialog'
import { JoinFamilyDialog } from '@/components/families/join-family-dialog'
import { FamiliesGrid } from '@/components/families/families-grid'
import { useFamilies } from '@/hooks/use-families'

export const Route = createFileRoute('/families/')({
  component: FamiliesPage,
})

function FamiliesPage() {
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
        <FamiliesContent />
      </main>
      <Footer />
    </div>
  )
}

function FamiliesContent() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useFamilies()

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{t('families.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('families.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <CreateFamilyDialog />
          <JoinFamilyDialog />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner className="size-8" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">{t('families.loadError')}</p>
      )}

      {data && <FamiliesGrid families={data} />}
    </div>
  )
}
