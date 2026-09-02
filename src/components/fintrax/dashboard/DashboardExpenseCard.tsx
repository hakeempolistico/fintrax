'use client'

import { ArrowUpRight, CircleDollarSign, ReceiptText, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { dateToReadable, formatAmount } from '@/helper/common.helper'
import type { Transaction } from '@/payload-types'

type DashboardExpenseCardProps = {
  total: number
  periodLabel: string
  transactions: Transaction[]
}

const relationshipName = (value: unknown) => {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  return String(record.provider ?? record.name ?? '') || null
}

export default function DashboardExpenseCard({ total, periodLabel, transactions }: DashboardExpenseCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-error-200 hover:shadow-sm focus:outline-none focus:ring-3 focus:ring-error-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-error-500/30"
        aria-haspopup="dialog"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Expenses</p>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-100 text-error-600 dark:bg-error-500/15 dark:text-error-400">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-4 truncate text-xl font-bold text-error-600 dark:text-error-400">{formatAmount(total)}</p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Expenses and payments in {periodLabel} · Click to view</p>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="expense-transactions-title"
            className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
              <div>
                <h2 id="expense-transactions-title" className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Expense Transactions
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {periodLabel} · {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-gray-200"
                aria-label="Close expense transactions"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 dark:border-gray-800 dark:bg-white/[0.02] sm:px-6">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total expenses</span>
              <span className="text-base font-semibold text-error-600 dark:text-error-400">{formatAmount(total)}</span>
            </div>

            <div className="min-h-0 overflow-y-auto">
              {transactions.length ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {transactions.map((transaction) => {
                    const source = relationshipName(transaction.bill) ?? relationshipName(transaction.loan) ?? relationshipName(transaction.account)
                    const isPayment = transaction.type === 'payment'
                    const Icon = isPayment ? ReceiptText : CircleDollarSign

                    return (
                      <div key={transaction.id} className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error-50 text-error-600 ring-1 ring-error-100 dark:bg-error-500/10 dark:text-error-400 dark:ring-error-500/20">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium capitalize text-gray-800 dark:text-white/90">
                              {transaction.category?.replaceAll('-', ' ') ?? transaction.type}
                            </p>
                            <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                              {transaction.notes || source || (isPayment ? 'Payment' : 'Expense')} · {dateToReadable(transaction.date)}
                            </p>
                            <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium capitalize text-gray-600 dark:bg-white/[0.06] dark:text-gray-300">
                              {transaction.type}
                            </span>
                          </div>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-error-600 dark:text-error-400">
                          -{formatAmount(transaction.amount ?? 0)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400 sm:px-6">
                  No expense transactions for {periodLabel}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
