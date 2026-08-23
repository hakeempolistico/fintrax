import Image from 'next/image'
import Link from 'next/link'
import { dateToReadable, formatAmount } from '@/helper/common.helper'
import type { Bill, Loan, Transaction } from '@/payload-types'
import {
  Banknote,
  Car,
  CircleDollarSign,
  GraduationCap,
  HandCoins,
  Home,
  Landmark,
  ReceiptText,
  ShoppingBag,
  Utensils,
  WalletCards,
  Zap,
} from 'lucide-react'

type DashboardListsProps =
  | { type: 'bills'; items: Bill[] }
  | { type: 'loans'; items: Loan[] }
  | { type: 'transactions'; items: Transaction[] }

const relationshipName = (value: unknown) => {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  return String(record.provider ?? record.name ?? '') || null
}

const billLogo = (provider?: string | null) => {
  const value = provider?.toLowerCase() ?? ''
  if (value.includes('meralco')) return '/images/logo/meralco.png'
  if (value.includes('converge')) return '/images/logo/converge.png'
  if (value.includes('spotify')) return '/images/logo/spotify.png'
  return null
}

const loanIcon = (type?: Loan['loanType']) => {
  if (type === 'home') return Home
  if (type === 'car') return Car
  if (type === 'education') return GraduationCap
  if (type === 'business') return Landmark
  if (type === 'credit-card') return WalletCards
  return HandCoins
}

const transactionIcon = (transaction: Transaction) => {
  if (transaction.category === 'food') return Utensils
  if (transaction.category === 'shopping') return ShoppingBag
  if (transaction.category === 'utilities') return Zap
  if (transaction.category === 'loan-payment') return Landmark
  if (transaction.category === 'bill-payment') return ReceiptText
  if (transaction.type === 'income') return Banknote
  return CircleDollarSign
}

export default function DashboardLists(props: DashboardListsProps) {
  if (props.type === 'bills') {
    return (
      <ListCard title="Upcoming Bills" subtitle="Next bills requiring attention" href="/portal/bills">
        {props.items.length ? props.items.map((bill) => {
          const logo = billLogo(bill.provider)
          return (
            <div key={bill.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-warning-50 text-warning-600 ring-1 ring-warning-100 dark:bg-warning-500/10 dark:text-warning-400 dark:ring-warning-500/20">
                  {logo ? <Image src={logo} alt="" width={32} height={32} className="h-8 w-8 object-contain" /> : <ReceiptText className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{bill.provider ?? 'Bill'}</p>
                  <p className="mt-1 text-xs text-warning-600 dark:text-warning-400">Due day {bill.dueDate ?? '—'}</p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-semibold text-gray-800 dark:text-white/90">{formatAmount(bill.amount ?? 0)}</p>
            </div>
          )
        }) : <Empty text="No upcoming bills." />}
      </ListCard>
    )
  }

  if (props.type === 'loans') {
    return (
      <ListCard title="Active Loans" subtitle="Current loan commitments" href="/portal/loans">
        {props.items.length ? props.items.map((loan) => {
          const Icon = loanIcon(loan.loanType)
          const overdue = loan.status === 'overdue'
          return (
            <div key={loan.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${overdue ? 'bg-error-50 text-error-600 ring-error-100 dark:bg-error-500/10 dark:text-error-400 dark:ring-error-500/20' : 'bg-brand-50 text-brand-600 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{loan.name}</p>
                  <p className="mt-1 text-xs capitalize text-gray-500 dark:text-gray-400">{loan.paymentFrequency?.replaceAll('-', ' ') ?? '—'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{formatAmount(loan.monthlyPayment ?? 0)}</p>
                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${overdue ? 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400' : 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'}`}>
                  {loan.status?.replaceAll('-', ' ') ?? 'Active'}
                </span>
              </div>
            </div>
          )
        }) : <Empty text="No active loans." />}
      </ListCard>
    )
  }

  return (
    <ListCard title="Recent Transactions" subtitle="Your latest financial activity" href="/portal/transactions">
      {props.items.length ? props.items.map((transaction) => {
        const source = relationshipName(transaction.bill) ?? relationshipName(transaction.loan) ?? relationshipName(transaction.account)
        const Icon = transactionIcon(transaction)
        const isIncome = transaction.type === 'income'
        return (
          <div key={transaction.id} className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${isIncome ? 'bg-success-50 text-success-600 ring-success-100 dark:bg-success-500/10 dark:text-success-400 dark:ring-success-500/20' : 'bg-error-50 text-error-600 ring-error-100 dark:bg-error-500/10 dark:text-error-400 dark:ring-error-500/20'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium capitalize text-gray-800 dark:text-white/90">{transaction.category?.replaceAll('-', ' ') ?? transaction.type}</p>
                <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{transaction.notes || source || 'Transaction'} · {dateToReadable(transaction.date)}</p>
              </div>
            </div>
            <p className={`text-sm font-semibold ${isIncome ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
              {isIncome ? '+' : '-'}{formatAmount(transaction.amount ?? 0)}
            </p>
          </div>
        )
      }) : <Empty text="No recent transactions." />}
    </ListCard>
  )
}

function ListCard({ title, subtitle, href, children }: { title: string; subtitle: string; href: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white/90">{title}</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <Link href={href} className="text-sm font-medium text-brand-500 hover:text-brand-600">View all</Link>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">{children}</div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400 sm:px-6">{text}</div>
}
