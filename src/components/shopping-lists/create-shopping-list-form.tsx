import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useCreateShoppingList } from '@/hooks/use-shopping-lists'

export function CreateShoppingListForm() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const createMutation = useCreateShoppingList()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('shoppingLists.form.nameRequired'))
      return
    }
    setError(null)
    createMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => setName(''),
        onError: () => setError(t('shoppingLists.form.createError')),
      },
    )
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="new-list-name">
              {t('shoppingLists.form.name')}
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                id="new-list-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('shoppingLists.form.namePlaceholder')}
                disabled={createMutation.isPending}
                aria-invalid={!!error}
              />
              <Button
                type="submit"
                disabled={createMutation.isPending || !name.trim()}
              >
                {createMutation.isPending ? <Spinner /> : <Plus />}
                {t('shoppingLists.form.create')}
              </Button>
            </div>
            {error && <FieldError>{error}</FieldError>}
          </Field>
        </form>
      </CardContent>
    </Card>
  )
}
