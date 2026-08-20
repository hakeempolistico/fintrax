import { ArrowDownLeft, ArrowUpRight, CalendarClock, WalletCards } from 'lucide-react'

type DashboardCardProps = {
  label: string
  number: string
  tone?: 'income' | 'expense' | 'balance' | 'bills'
}

const toneStyles = {
  income: {
    icon: ArrowDownLeft,
    container: 'border-success-100/70 bg-success-50/20 dark:border-success-500/15 dark:bg-success-500/[0.04]',
    iconWrap: 'bg-success-100/70 text-success-600 dark:bg-success-500/10 dark:text-success-400',
    value: 'text-success-600 dark:text-success-400',
  },
  expense: {
    icon: ArrowUpRight,
    container: 'border-error-100/70 bg-error-50/20 dark:border-error-500/15 dark:bg-error-500/[0.04]',
    iconWrap: 'bg-error-100/70 text-error-600 dark:bg-error-500/10 dark:text-error-400',
    value: 'text-error-600 dark:text-error-400',
  },
  balance: {
    icon: WalletCards,
    container: 'border-brand-100/70 bg-brand-50/20 dark:border-brand-500/15 dark:bg-brand-500/[0.04]',
    iconWrap: 'bg-brand-100/70 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    value: 'text-brand-600 dark:text-brand-400',
  },
  bills: {
    icon: CalendarClock,
    container: 'border-warning-100/70 bg-warning-50/20 dark:border-warning-500/15 dark:bg-warning-500/[0.04]',
    iconWrap: 'bg-warning-100/70 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400',
    value: 'text-warning-600 dark:text-warning-400',
  },
} as const

export default function DashboardCard({ label, number, tone = 'balance' }: DashboardCardProps) {
  const style = toneStyles[tone]
  const Icon = style.icon

  return (
    <div className={`rounded-2xl border p-5 md:p-6 ${style.container}`}>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.iconWrap}`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="mt-4 block text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <h4 className={`mt-2 text-xl font-bold ${style.value}`}>{number}</h4>
    </div>
  )
}
