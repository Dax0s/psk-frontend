import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'react-oidc-context'
import { HTTPError } from 'ky'
import { UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useJoinFamily } from '@/hooks/use-families'

const inviteCodeLength = 6

export function JoinFamilyDialog() {
  const { t } = useTranslation()
  const auth = useAuth()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const joinMutation = useJoinFamily()

  function handleOpenChange(next: boolean) {
    if (next) {
      setCode('')
      setError(null)
    }
    setOpen(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== inviteCodeLength) {
      setError(t('families.form.codeInvalid'))
      return
    }
    setError(null)
    joinMutation.mutate(
      { inviteCode: code, email: auth.user?.profile.email ?? undefined },
      {
        onSuccess: () => setOpen(false),
        onError: async (joinError) => {
          setError(await joinErrorMessage(joinError, t))
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus />
          {t('families.actions.join')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('families.join.title')}</DialogTitle>
          <DialogDescription>
            {t('families.join.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="join-family-code">
              {t('families.form.inviteCode')}
            </FieldLabel>
            <Input
              id="join-family-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t('families.form.inviteCodePlaceholder')}
              maxLength={inviteCodeLength}
              className="font-mono tracking-widest"
              disabled={joinMutation.isPending}
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={joinMutation.isPending}
            >
              {t('families.actions.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={
                joinMutation.isPending || code.length !== inviteCodeLength
              }
            >
              {joinMutation.isPending && <Spinner />}
              {t('families.actions.join')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

async function joinErrorMessage(
  error: unknown,
  t: (key: string) => string,
): Promise<string> {
  if (!(error instanceof HTTPError)) {
    return t('families.form.joinError')
  }
  try {
    const body = await error.response.json<{ error?: string }>()
    if (body.error === 'ALREADY_MEMBER') {
      return t('families.form.alreadyMember')
    }
    if (body.error === 'FAMILY_NOT_FOUND') {
      return t('families.form.familyNotFound')
    }
  } catch {
    // fall through
  }
  return t('families.form.joinError')
}
