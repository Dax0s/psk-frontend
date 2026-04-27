import { useTheme } from '@/components/theme-provider'
import { Toaster as SonnerToaster } from 'sonner'

function Toaster() {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      theme={theme === 'system' ? undefined : (theme as 'light' | 'dark')}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:ring-1 group-[.toaster]:ring-foreground/10',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
    />
  )
}

export { Toaster }
