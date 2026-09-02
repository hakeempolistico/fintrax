'use client'

import { CalendarDays } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

type PeriodOption = {
  value: string
  label: string
}

type DashboardPeriodFilterProps = {
  value: string
  options: PeriodOption[]
}

export default function DashboardPeriodFilter({ value, options }: DashboardPeriodFilterProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleChange = (nextPeriod: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', nextPeriod)

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      router.refresh()
    })
  }

  return (
    <label className="flex w-full items-center gap-2 sm:w-auto">
      <span className="sr-only">Dashboard month and year</span>
      <CalendarDays className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
      <select
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        disabled={isPending || options.length === 0}
        className="h-10 min-w-44 rounded-lg border border-gray-300 bg-white px-3 pr-9 text-sm font-medium text-gray-700 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 disabled:cursor-wait disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-brand-800"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
