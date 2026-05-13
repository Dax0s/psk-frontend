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
import { FamilyHeader } from '@/components/families/family-header'
import { InviteCode } from '@/components/families/invite-code'
import { MembersList } from '@/components/families/members-list'
import { FamilyGroceryLists } from '@/components/families/family-grocery-lists'
import { useFamily } from '@/hooks/use-families'

export const Route = createFileRoute('/families/$familyId')({
  component: FamilyDetailPage,
})

function FamilyDetailPage() {
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
        <FamilyDetailContent />
      </main>
      <Footer />
    </div>
  )
}

function FamilyDetailContent() {
  const { t } = useTranslation()
  const { familyId } = Route.useParams()
  const auth = useAuth()
  const { data, isLoading, isError } = useFamily(familyId)

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
          {t('families.detail.loadError')}
        </p>
        <Button asChild variant="outline">
          <Link to="/families">
            <ArrowLeft />
            {t('families.detail.back')}
          </Link>
        </Button>
      </div>
    )
  }

  const currentUserId = auth.user?.profile.sub ?? ''

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="self-start">
        <Link to="/families">
          <ArrowLeft />
          {t('families.detail.back')}
        </Link>
      </Button>

      <FamilyHeader family={data} />

      <InviteCode code={data.inviteCode} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          {t('families.members')} ({data.members.length})
        </h2>
        <MembersList
          members={data.members}
          familyId={data.id}
          currentUserId={currentUserId}
          viewerIsAdmin={data.isAdmin}
        />
      </section>

      <FamilyGroceryLists familyId={data.id} />
    </div>
  )
}
