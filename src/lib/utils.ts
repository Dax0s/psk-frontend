import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function parseQuantity(value: string) {
  const quantity = Number(value)
  return Number.isFinite(quantity) && quantity >= 0 ? quantity : null
}
