import * as React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type NumberInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange' | 'type'
> & {
  value: string
  onChange: (next: string) => void
  step?: number
  min?: number
}

export function NumberInput({
  value,
  onChange,
  step = 1,
  min,
  className,
  disabled,
  ...props
}: NumberInputProps) {
  function clamp(next: string) {
    if (min === undefined || next === '' || next === '-') return next
    const n = Number(next)
    if (Number.isFinite(n) && n < min) return String(min)
    return next
  }

  function bump(delta: number) {
    const current = Number(value)
    const base = Number.isFinite(current) ? current : 0
    onChange(clamp(String(base + delta)))
  }

  return (
    <div className="relative">
      <Input
        type="number"
        inputMode="decimal"
        step="any"
        value={value}
        onChange={(e) => onChange(clamp(e.target.value))}
        disabled={disabled}
        className={cn('pr-6', className)}
        {...props}
      />
      <div className="absolute inset-y-0 right-1 flex flex-col items-center justify-center">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => bump(step)}
          disabled={disabled}
          className="rounded text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label="Increase"
        >
          <ChevronUp className="size-3" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => bump(-step)}
          disabled={disabled}
          className="rounded text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label="Decrease"
        >
          <ChevronDown className="size-3" />
        </button>
      </div>
    </div>
  )
}
