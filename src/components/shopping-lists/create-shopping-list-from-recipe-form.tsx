import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useCreateShoppingListFromRecipe } from '@/hooks/use-shopping-lists'

type ErrorField = 'name' | 'url' | null

export function CreateShoppingListFromRecipeForm() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [errorField, setErrorField] = useState<ErrorField>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const createMutation = useCreateShoppingListFromRecipe()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setErrorField('name')
      setErrorMessage(t('shoppingLists.form.nameRequired'))
      return
    }
    if (!url.trim()) {
      setErrorField('url')
      setErrorMessage(t('shoppingLists.fromRecipe.urlRequired'))
      return
    }
    if (!isValidUrl(url.trim())) {
      setErrorField('url')
      setErrorMessage(t('shoppingLists.fromRecipe.urlInvalid'))
      return
    }
    setErrorField(null)
    setErrorMessage(null)
    createMutation.mutate(
      { name: name.trim(), link: url.trim() },
      {
        onSuccess: () => {
          setName('')
          setUrl('')
        },
        onError: () => {
          setErrorField(null)
          setErrorMessage(t('shoppingLists.fromRecipe.createError'))
        },
      },
    )
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field data-invalid={errorField === 'name'}>
            <FieldLabel htmlFor="new-recipe-list-name">
              {t('shoppingLists.fromRecipe.name')}
            </FieldLabel>
            <Input
              id="new-recipe-list-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('shoppingLists.fromRecipe.namePlaceholder')}
              disabled={createMutation.isPending}
              aria-invalid={errorField === 'name'}
            />
          </Field>
          <Field data-invalid={errorField === 'url'}>
            <FieldLabel htmlFor="new-recipe-list-url">
              {t('shoppingLists.fromRecipe.url')}
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                id="new-recipe-list-url"
                type="url"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('shoppingLists.fromRecipe.urlPlaceholder')}
                disabled={createMutation.isPending}
                aria-invalid={errorField === 'url'}
              />
              <Button
                type="submit"
                disabled={
                  createMutation.isPending || !name.trim() || !url.trim()
                }
              >
                {createMutation.isPending ? <Spinner /> : <Sparkles />}
                {t('shoppingLists.fromRecipe.generate')}
              </Button>
            </div>
          </Field>
          {errorMessage && <FieldError>{errorMessage}</FieldError>}
        </form>
      </CardContent>
    </Card>
  )
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
