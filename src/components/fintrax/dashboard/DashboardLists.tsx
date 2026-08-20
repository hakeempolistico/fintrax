import Link from 'next/link'
import { dateToReadable, formatAmount } from '@/helper/common.helper'
import type { Bill, Loan, Transaction } from '@/payload-types'

type DashboardListsProps =
  | { type: 'bills'; items: Bill[] }
  | { type: 'loans'; items: Loan[] }
  | { type: 'transactions'; items: Transaction[] }

const relationshipName = (value: unknown) => {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  return String(record.provider ?? record.name ?? '') || null
}

export default function DashboardLists(props: DashboardListsProps) {
  if (props.type === 'bills') {
    return (
      <ListCard title="Upcoming Bills" subtitle="Next bills requiring attention" href="/portal/bills">
        {props.items.length ? props.items.map((bill) => (
          <div key={bill.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{bill.provider ?? 'Bill'}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Due day {bill.dueDate ?? '—'}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-gray-800 dark:text-white/90">{formatAmount(bill.amount ?? 0)}</p>
          </div>
        )) : <Empty text="No upcoming bills." />}
      </ListCard>
    )
  }

  if (props.type === 'loans') {
    return (
      <ListCard title="Active Loans" subtitle="Current loan commitments" href="/portal/loans">
        {props.items.length ? props.items.map((loan) => (
          <div key={loan.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{loan.name}</p>
              <p className="mt-1 text-xs capitalize text-gray-500 dark:text-gray-400">{loan.paymentFrequency?.replaceAll('-', ' ') ?? '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{formatAmount(loan.monthlyPayment ?? 0)}</p>
              <span className={`mt-1 inline-block text-xs font-medium capitalize ${loan.status === 'overdue' ? 'text-error-500' : 'text-success-500'}`}>
                {loan.status?.replaceAll('-', ' ') ?? 'Active'}
              </span>
            </div>
          </div>
        )) : <Empty text="No active loans." />}
      </ListCard>
    )
  }

  return (
    <ListCard title="Recent Transactions" subtitle="Your latest financial activity" href="/portal/transactions">
      {props.items.length ? props.items.map((transaction) => {
        const source = relationshipName(transaction.bill) ?? relationshipName(transaction.loan) ?? relationshipName(transaction.account)
        return (
          <div key={transaction.id} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium capitalize text-gray-800 dark:text-white/90">
                {transaction.category?.replaceAll('-', ' ') ?? transaction.type}
              </p>
              <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                {transaction.notes || source || 'Transaction'} · {dateToReadable(transaction.date)}
              </p>
            </div>
            <p className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-success-500' : 'text-gray-800 dark:text-white/90'}`}>
              {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount ?? 0)}
            </p>
          </div>
        )
      }) : <Empty text="No recent transactions." />}
    </ListCard>
  )
}

function ListCard({ title, subtitle, href, children }: { title: string; subtitle: string; href: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
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
