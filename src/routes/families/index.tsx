import { useState } from 'react'
import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useAuth } from 'react-oidc-context'
import { useTranslation } from 'react-i18next'
import { ClipboardCopyIcon, PlusIcon, UsersIcon } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useMyFamilies,
  useCreateFamily,
  useJoinFamily,
} from '@/hooks/use-families'

export const Route = createFileRoute('/families/')({ component: FamiliesPage })

function FamiliesPage() {
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
        <FamiliesList />
      </main>
      <Footer />
    </div>
  )
}

function FamiliesList() {
  const { t } = useTranslation()
  const { data: families, isLoading } = useMyFamilies()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('families.title')}</h1>
        <div className="flex gap-2">
          <CreateFamilyDialog />
          <JoinFamilyDialog />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : families && families.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {families.map((family) => (
            <FamilyCard key={family.id} family={family} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UsersIcon className="mb-4 size-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t('families.emptyState')}</p>
        </div>
      )}
    </div>
  )
}

function FamilyCard({
  family,
}: {
  family: {
    id: string
    name: string
    inviteCode: string
    isAdmin: boolean
    memberCount: number
  }
}) {
  const { t } = useTranslation()

  function copyCode() {
    navigator.clipboard.writeText(family.inviteCode)
    toast.success(t('families.codeCopied'))
  }

  return (
    <Link to="/families/$familyId" params={{ familyId: family.id }}>
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{family.name}</CardTitle>
            {family.isAdmin && (
              <Badge variant="secondary">{t('families.admin')}</Badge>
            )}
          </div>
          <CardDescription>
            {t('families.memberCount', { count: family.memberCount })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md bg-muted px-2 py-1 font-mono text-sm tracking-widest">
              {family.inviteCode}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                copyCode()
              }}
              title={t('families.copyCode')}
            >
              <ClipboardCopyIcon className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function CreateFamilyDialog() {
  const { t } = useTranslation()
  const auth = useAuth()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const { mutate, isPending } = useCreateFamily()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    mutate(
      { name, email: auth.user?.profile.email ?? undefined },
      {
        onSuccess: () => {
          setOpen(false)
          setName('')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          {t('families.createFamily')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('families.createFamily')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="family-name">{t('families.familyName')}</Label>
            <Input
              id="family-name"
              placeholder={t('families.familyNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t('families.cancel')}
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? t('families.create') + '…' : t('families.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function JoinFamilyDialog() {
  const { t } = useTranslation()
  const auth = useAuth()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const { mutate, isPending } = useJoinFamily()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    mutate(
      { inviteCode: code, email: auth.user?.profile.email ?? undefined },
      {
        onSuccess: () => {
          setOpen(false)
          setCode('')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UsersIcon />
          {t('families.joinFamily')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('families.joinFamily')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-code">{t('families.inviteCode')}</Label>
            <Input
              id="invite-code"
              placeholder={t('families.enterInviteCode')}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="font-mono tracking-widest"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t('families.cancel')}
            </Button>
            <Button type="submit" disabled={isPending || code.length !== 6}>
              {isPending ? t('families.join') + '…' : t('families.join')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
