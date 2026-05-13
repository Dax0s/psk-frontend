import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'react-oidc-context'
import { Plus } from 'lucide-react'

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
import { useCreateFamily } from '@/hooks/use-families'

export function CreateFamilyDialog() {
  const { t } = useTranslation()
  const auth = useAuth()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const createMutation = useCreateFamily()

  function handleOpenChange(next: boolean) {
    if (next) {
      setName('')
      setError(null)
    }
    setOpen(next)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('families.form.nameRequired'))
      return
    }
    setError(null)
    createMutation.mutate(
      { name: name.trim(), email: auth.user?.profile.email ?? undefined },
      {
        onSuccess: () => setOpen(false),
        onError: () => setError(t('families.form.createError')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t('families.actions.create')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('families.create.title')}</DialogTitle>
          <DialogDescription>
            {t('families.create.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="new-family-name">
              {t('families.form.name')}
            </FieldLabel>
            <Input
              id="new-family-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('families.form.namePlaceholder')}
              disabled={createMutation.isPending}
              maxLength={100}
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              {t('families.actions.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
            >
              {createMutation.isPending && <Spinner />}
              {t('families.actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
