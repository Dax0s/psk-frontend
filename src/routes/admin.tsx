import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useAuth } from 'react-oidc-context'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Pause,
  Play,
  RefreshCw,
  ScrollText,
  ShieldCheck,
} from 'lucide-react'

import { Route as errorRoute } from '@/routes/error'
import { Navbar } from '@/components/app/navbar'
import { Footer } from '@/components/app/footer'
import { CenteredSpinner } from '@/components/centered-spinner'
import { Spinner } from '@/components/ui/spinner'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  useAuditSettings,
  useUpdateAuditSettings,
} from '@/hooks/use-audit-settings'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useLogs } from '@/hooks/use-logs'
import type { LogEntry } from '@/hooks/use-logs'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin')({ component: AdminPage })

function AdminPage() {
  const { t } = useTranslation()
  const auth = useAuth()
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser()

  if (auth.isLoading) return <CenteredSpinner />
  if (auth.error) return <Navigate to={errorRoute.to} />
  if (!auth.isAuthenticated) {
    auth.signinRedirect()
    return <CenteredSpinner />
  }
  if (isUserLoading) return <CenteredSpinner />
  if (currentUser?.role !== 'ADMIN') return <Navigate to="/" />

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-4">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/">
            <ArrowLeft />
            {t('admin.back')}
          </Link>
        </Button>
        <AdminContent />
      </main>
      <Footer />
    </div>
  )
}

function AdminContent() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useAuditSettings()
  const updateMutation = useUpdateAuditSettings()

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="size-6" />
          {t('admin.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('admin.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.audit.title')}</CardTitle>
          <CardDescription>{t('admin.audit.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-4">
              <Spinner className="size-6" />
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive">
              {t('admin.audit.loadError')}
            </p>
          )}

          {data && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="audit-enabled"
                  checked={data.enabled}
                  disabled={updateMutation.isPending}
                  onCheckedChange={(checked) =>
                    updateMutation.mutate({ enabled: checked === true })
                  }
                />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="audit-enabled">
                    {t('admin.audit.enabled')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t('admin.audit.enabledHelp')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="audit-include-args"
                  checked={data.includeArgs}
                  disabled={updateMutation.isPending || !data.enabled}
                  onCheckedChange={(checked) =>
                    updateMutation.mutate({ includeArgs: checked === true })
                  }
                />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="audit-include-args">
                    {t('admin.audit.includeArgs')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t('admin.audit.includeArgsHelp')}
                  </p>
                </div>
              </div>

              {updateMutation.isError && (
                <p className="text-sm text-destructive">
                  {t('admin.audit.updateError')}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <LogsCard />
    </div>
  )
}

function levelClassName(level: string) {
  switch (level.toUpperCase()) {
    case 'ERROR':
      return 'text-destructive'
    case 'WARN':
      return 'text-yellow-600 dark:text-yellow-500'
    case 'INFO':
      return 'text-blue-600 dark:text-blue-400'
    default:
      return 'text-muted-foreground'
  }
}

function shortLogger(logger: string) {
  const parts = logger.split('.')
  return parts[parts.length - 1] || logger
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleTimeString()
}

function LogsCard() {
  const { t } = useTranslation()
  const [live, setLive] = useState(true)
  const [filter, setFilter] = useState('')
  const { data, isLoading, isError, isFetching, refetch } = useLogs({
    refetchInterval: live ? 3000 : false,
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo<LogEntry[]>(() => {
    if (!data) return []
    const query = filter.trim().toLowerCase()
    if (!query) return data
    return data.filter(
      (entry) =>
        entry.message.toLowerCase().includes(query) ||
        entry.level.toLowerCase().includes(query) ||
        entry.logger.toLowerCase().includes(query),
    )
  }, [data, filter])

  useEffect(() => {
    if (live && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filtered, live])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="size-5" />
          {t('admin.logs.title')}
        </CardTitle>
        <CardDescription>{t('admin.logs.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t('admin.logs.filterPlaceholder')}
            className="h-7 max-w-xs"
          />
          <Button
            variant={live ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setLive((value) => !value)}
          >
            {live ? <Pause /> : <Play />}
            {live ? t('admin.logs.pause') : t('admin.logs.resume')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={isFetching ? 'animate-spin' : undefined} />
            {t('admin.logs.refresh')}
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-4">
            <Spinner className="size-6" />
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            {t('admin.logs.loadError')}
          </p>
        )}

        {data && (
          <div
            ref={scrollRef}
            className="h-80 overflow-auto rounded-md border bg-muted/30 p-2 font-mono text-xs"
          >
            {filtered.length === 0 ? (
              <p className="text-muted-foreground">{t('admin.logs.empty')}</p>
            ) : (
              filtered.map((entry, index) => (
                <div
                  key={`${entry.timestamp}-${index}`}
                  className="flex gap-2 py-0.5 break-all whitespace-pre-wrap"
                >
                  <span className="shrink-0 text-muted-foreground">
                    {formatTime(entry.timestamp)}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 font-semibold',
                      levelClassName(entry.level),
                    )}
                  >
                    {entry.level}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {shortLogger(entry.logger)}
                  </span>
                  <span>{entry.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
