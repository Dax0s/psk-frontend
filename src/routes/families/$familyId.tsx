import { useState } from 'react'
import {
  createFileRoute,
  Link,
  Navigate,
  useParams,
} from '@tanstack/react-router'
import { useAuth } from 'react-oidc-context'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftIcon,
  ClipboardCopyIcon,
  ShoppingCartIcon,
  Trash2Icon,
  UserMinusIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Route as errorRoute } from '@/routes/error'
import { Navbar } from '@/components/app/navbar'
import { Footer } from '@/components/app/footer'
import { CenteredSpinner } from '@/components/centered-spinner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  useFamilyDetail,
  useDeleteFamily,
  useLeaveFamily,
  useRemoveMember,
} from '@/hooks/use-families'
import type { Member } from '@/api/families'

export const Route = createFileRoute('/families/$familyId')({
  component: FamilyDetailPage,
})

function FamilyDetailPage() {
  const auth = useAuth()

  if (auth.isLoading) return <CenteredSpinner />
  if (auth.error) return <Navigate to={errorRoute.to} />
  if (!auth.isAuthenticated) {
    auth.signinRedirect()
    return <CenteredSpinner />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 p-4">
        <FamilyDetail />
      </main>
      <Footer />
    </div>
  )
}

function FamilyDetail() {
  const { t } = useTranslation()
  const { familyId } = useParams({ from: '/families/$familyId' })
  const auth = useAuth()
  const currentUserId = auth.user?.profile.sub ?? ''

  const { data: family, isLoading } = useFamilyDetail(familyId)
  const { mutate: deleteFamily, isPending: isDeleting } = useDeleteFamily()
  const { mutate: leaveFamily, isPending: isLeaving } = useLeaveFamily()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!family) return null

  function copyCode() {
    navigator.clipboard.writeText(family!.inviteCode)
    toast.success(t('families.codeCopied'))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back button */}
      <Link to="/families/">
        <Button variant="ghost" size="sm">
          <ArrowLeftIcon />
          {t('families.back')}
        </Button>
      </Link>

      {/* Family header card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">{family.name}</CardTitle>
              {family.isAdmin && (
                <Badge variant="secondary" className="w-fit">
                  {t('families.admin')}
                </Badge>
              )}
            </div>

            {/* Admin or leave button */}
            {family.isAdmin ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    <Trash2Icon />
                    {t('families.deleteFamily')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t('families.deleteFamily')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('families.confirmDelete')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {t('families.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                      onClick={() => deleteFamily(familyId)}
                    >
                      {t('families.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isLeaving}>
                    <UserMinusIcon />
                    {t('families.leaveFamily')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t('families.leaveFamily')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('families.confirmLeave')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {t('families.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => leaveFamily(familyId)}>
                      {t('families.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {/* Invite code */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {t('families.inviteCode')}
            </span>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-1.5 font-mono text-sm tracking-widest">
                {family.inviteCode}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyCode}
                title={t('families.copyCode')}
              >
                <ClipboardCopyIcon className="size-4" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              {t('families.shareHint')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('families.members')} ({family.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {family.members.map((member) => (
            <MemberRow
              key={member.userId}
              member={member}
              familyId={familyId}
              isCurrentUserAdmin={family.isAdmin}
              currentUserId={currentUserId}
            />
          ))}
        </CardContent>
      </Card>

      {/* Grocery lists placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>{t('families.groceryLists')}</CardTitle>
          <CardDescription>{t('families.noGroceryLists')}</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block">
                  <Button disabled>
                    <ShoppingCartIcon />
                    {t('families.createGroceryList')}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {t('families.groceryListsComingSoon')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  )
}

function compactRelativeTime(date: Date, lang: string): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (lang === 'lt') {
    if (years > 0) return `prieš ${years}m.`
    if (months > 0) return `prieš ${months}mėn.`
    if (days > 0) return `prieš ${days}d.`
    if (hours > 0) return `prieš ${hours}val.`
    if (minutes > 0) return `prieš ${minutes}min.`
    return 'ką tik'
  }
  if (years > 0) return `${years}y ago`
  if (months > 0) return `${months}mo ago`
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}min ago`
  return 'just now'
}

function MemberRow({
  member,
  familyId,
  isCurrentUserAdmin,
  currentUserId,
}: {
  member: Member
  familyId: string
  isCurrentUserAdmin: boolean
  currentUserId: string
}) {
  const { t, i18n } = useTranslation()
  const { mutate: removeMember, isPending } = useRemoveMember()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isCurrentUser = member.userId === currentUserId
  const displayName = member.email ?? member.userId

  const canRemove = isCurrentUserAdmin && !member.isAdmin
  const joinedAgo = compactRelativeTime(
    new Date(member.joinedAt),
    i18n.resolvedLanguage ?? 'en',
  )

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {displayName}
            {isCurrentUser && (
              <span className="ml-1 text-muted-foreground">
                {t('families.you')}
              </span>
            )}
          </span>
          {member.isAdmin && (
            <Badge variant="secondary" className="text-xs">
              {t('families.admin')}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {t('families.joinedAgo', { time: joinedAgo })}
        </span>
      </div>

      {canRemove && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isPending}>
              <UserMinusIcon />
              {t('families.removeMember')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('families.removeMember')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('families.confirmRemove')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('families.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  removeMember(
                    { familyId, userId: member.userId },
                    { onSuccess: () => setConfirmOpen(false) },
                  )
                }}
              >
                {t('families.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
