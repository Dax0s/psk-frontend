import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AlertCircle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/error')({
  component: ErrorPage,
})

function ErrorPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>{t('error.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('error.defaultMessage')}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate({ to: '/' })}>
            <Home className="h-4 w-4" />
            {t('error.goHome')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
