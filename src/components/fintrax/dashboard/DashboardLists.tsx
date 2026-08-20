import Link from 'next/link'
import { dateToReadable, formatAmount } from '@/helper/common.helper'
import type { Bill, Loan, Transaction } from '@/payload-types'

type DashboardListsProps = {
  bills: Bill[]
  loans: Loan[]
  transactions: Transaction[]
}

const relationshipName = (value: unknown) => {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  return String(record.provider ?? record.name ?? '') || null
}

export default function DashboardLists({ bills, loans, transactions }: DashboardListsProps) {
  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">Upcoming Bills</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Next bills requiring attention</p>
          </div>
          <Link href="/portal/bills" className="text-sm font-medium text-brand-500 hover:text-brand-600">View all</Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {bills.length ? bills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{bill.provider ?? 'Bill'}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Due day {bill.dueDate ?? '—'}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-gray-800 dark:text-white/90">{formatAmount(bill.amount ?? 0)}</p>
            </div>
          )) : <Empty text="No upcoming bills." />}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">Active Loans</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Current loan commitments</p>
          </div>
          <Link href="/portal/loans" className="text-sm font-medium text-brand-500 hover:text-brand-600">View all</Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {loans.length ? loans.map((loan) => (
            <div key={loan.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{loan.name}</p>
                <p className="mt-1 text-xs capitalize text-gray-500 dark:text-gray-400">{loan.paymentFrequency?.replaceAll('-', ' ') ?? '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{formatAmount(loan.monthlyPayment ?? 0)}</p>
                <span className={`mt-1 inline-block text-xs font-medium capitalize ${loan.status === 'overdue' ? 'text-error-500' : 'text-success-500'}`}>{loan.status?.replaceAll('-', ' ') ?? 'Active'}</span>
              </div>
            </div>
          )) : <Empty text="No active loans." />}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">Recent Transactions</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Your latest financial activity</p>
          </div>
          <Link href="/portal/transactions" className="text-sm font-medium text-brand-500 hover:text-brand-600">View all</Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {transactions.length ? transactions.map((transaction) => {
            const source = relationshipName(transaction.bill) ?? relationshipName(transaction.loan) ?? relationshipName(transaction.account)
            return (
              <div key={transaction.id} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium capitalize text-gray-800 dark:text-white/90">{transaction.category?.replaceAll('-', ' ') ?? transaction.type}</p>
                  <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{transaction.notes || source || 'Transaction'} · {dateToReadable(transaction.date)}</p>
                </div>
                <p className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-success-500' : 'text-gray-800 dark:text-white/90'}`}>{transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount ?? 0)}</p>
              </div>
            )
          }) : <Empty text="No recent transactions." />}
        </div>
      </div>
    </>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400 sm:px-6">{text}</div>
}
