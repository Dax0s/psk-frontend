import { Link, useNavigate } from '@tanstack/react-router'
import { Check, Languages, Laptop, LogOut, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'react-oidc-context'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

export function Navbar() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const auth = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{t('navbar.title')}</h1>
          <nav className="flex items-center gap-1">
            <Link
              to="/shopping-lists"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{
                className:
                  'rounded-md px-3 py-1.5 text-sm font-medium bg-muted text-foreground',
              }}
            >
              {t('navbar.shoppingLists')}
            </Link>
            <Link
              to="/families"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{
                className:
                  'rounded-md px-3 py-1.5 text-sm font-medium bg-muted text-foreground',
              }}
            >
              {t('navbar.families')}
            </Link>
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback>
                  {auth.user?.profile.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {auth.user?.profile.name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {auth.user?.profile.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel>{t('navbar.user.theme')}</DropdownMenuLabel>

              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun />
                {t('navbar.user.light')}
                {theme === 'light' && <Check className="ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon />
                {t('navbar.user.dark')}
                {theme === 'dark' && <Check className="ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Laptop />
                {t('navbar.user.system')}
                {theme === 'system' && <Check className="ml-auto" />}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel>{t('navbar.user.language')}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => i18n.changeLanguage('lt')}>
                <Languages />
                {t('navbar.user.lithuanian')}
                {i18n.resolvedLanguage === 'lt' && (
                  <Check className="ml-auto" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>
                <Languages />
                {t('navbar.user.english')}
                {i18n.resolvedLanguage === 'en' && (
                  <Check className="ml-auto" />
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => navigate({ to: '/logout' })}
              >
                <LogOut />
                {t('navbar.user.logout')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
