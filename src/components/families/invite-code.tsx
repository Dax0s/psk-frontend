import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'

const copiedFeedbackMs = 2000

export function InviteCode({ code }: { code: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), copiedFeedbackMs)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">
        {t('families.inviteCode')}
      </span>
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded-md bg-muted px-3 py-1.5 font-mono text-sm tracking-widest">
          {code}
        </code>
        <Button
          variant="outline"
          size="icon"
          onClick={copy}
          aria-label={t('families.actions.copyCode')}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
      <span className="text-xs text-muted-foreground">
        {t('families.shareHint')}
      </span>
    </div>
  )
}
