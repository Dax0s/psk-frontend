import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function PinnedProductsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const { t } = useTranslation()

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        aria-label={t('shoppingLists.pins.previous')}
      >
        <ChevronLeft />
      </Button>
      {Array.from({ length: totalPages }, (_, index) => (
        <Button
          key={index}
          variant={index === currentPage ? 'secondary' : 'ghost'}
          size="icon-xs"
          onClick={() => onPageChange(index)}
          aria-label={t('shoppingLists.pins.pageLabel', { page: index + 1 })}
        >
          {index + 1}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage >= totalPages - 1}
        aria-label={t('shoppingLists.pins.next')}
      >
        <ChevronRight />
      </Button>
    </div>
  )
}
