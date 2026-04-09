import { Spinner } from '@/components/ui/spinner'

export function CenteredSpinner() {
  return (
    <div className="flex min-h-screen justify-center items-center">
      <Spinner className="size-16" />
    </div>
  )
}
