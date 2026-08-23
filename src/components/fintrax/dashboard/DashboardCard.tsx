import type { LucideIcon } from 'lucide-react'
import { ArrowDownLeft, ArrowUpRight, CalendarClock, WalletCards } from 'lucide-react'

type DashboardCardTone =
  | 'income'
  | 'expense'
  | 'balance'
  | 'bills'
  | 'success'
  | 'danger'
  | 'brand'
  | 'warning'
  | 'violet'
  | 'neutral'

type DashboardCardProps = {
  label: string
  number: string
  helper?: string
  tone?: DashboardCardTone
  icon?: LucideIcon
}

const toneStyles: Record<DashboardCardTone, { icon: LucideIcon; iconWrap: string; value: string }> = {
  income: {
    icon: ArrowDownLeft,
    iconWrap: 'bg-success-100 text-success-600 dark:bg-success-500/15 dark:text-success-400',
    value: 'text-success-600 dark:text-success-400',
  },
  expense: {
    icon: ArrowUpRight,
    iconWrap: 'bg-error-100 text-error-600 dark:bg-error-500/15 dark:text-error-400',
    value: 'text-error-600 dark:text-error-400',
  },
  balance: {
    icon: WalletCards,
    iconWrap: 'bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
    value: 'text-brand-600 dark:text-brand-400',
  },
  bills: {
    icon: CalendarClock,
    iconWrap: 'bg-warning-100 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400',
    value: 'text-warning-600 dark:text-warning-400',
  },
  success: {
    icon: ArrowDownLeft,
    iconWrap: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    value: 'text-emerald-700 dark:text-emerald-400',
  },
  danger: {
    icon: ArrowUpRight,
    iconWrap: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    value: 'text-rose-700 dark:text-rose-400',
  },
  brand: {
    icon: WalletCards,
    iconWrap: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    value: 'text-blue-700 dark:text-blue-400',
  },
  warning: {
    icon: CalendarClock,
    iconWrap: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    value: 'text-amber-700 dark:text-amber-400',
  },
  violet: {
    icon: WalletCards,
    iconWrap: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    value: 'text-violet-700 dark:text-violet-400',
  },
  neutral: {
    icon: WalletCards,
    iconWrap: 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300',
    value: 'text-gray-800 dark:text-white/90',
  },
}

export default function DashboardCard({
  label,
  number,
  helper,
  tone = 'brand',
  icon,
}: DashboardCardProps) {
  const style = toneStyles[tone]
  const Icon = icon ?? style.icon

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className={`mt-4 truncate text-xl font-bold ${style.value}`}>{number}</p>
      {helper && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helper}</p>}
    </div>
  )
}
