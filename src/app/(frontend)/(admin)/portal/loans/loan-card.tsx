'use client'

import { formatAmount } from '@/helper/common.helper'
import { Loan } from '@/payload-types'
import { ArrowRight, CircleDollarSign, Pencil } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { useModal } from '@/hooks/useModal'
import LoanForm from './loan-form'

type LoanCardProps = {
  name: string
  loanId: string
  monthly?: string | number
  amount: string | number
  remaining?: string | number
  nextPayment?: string
  paymentFrequency?: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly' | null | undefined
  interestRate?: string
  status: string
  interestType?: 'variable' | 'fixed' | null
  loan: Loan
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  'paid-off': 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  overdue: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
  defaulted: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
}

const LoanCard = (props: LoanCardProps) => {
  const { name, loanId, monthly, amount, paymentFrequency, interestRate, status, loan } = props
  const editModal = useModal()
  let remaining = 0
  const percentPaid = loan.terms && loan.termsPaid ? `${(loan.termsPaid / loan.terms) * 100}%` : '0%'
  const totalPaid = loan.transactions?.reduce(
    (total, transaction) => typeof transaction === 'object' && transaction !== null ? total + (transaction.amount ?? 0) : total,
    0,
  ) ?? 0

  if (loan.interestType === 'fixed') remaining = loan.principalAmount - totalPaid

  const handleSave = async (data: any) => {
    const response = await fetch(`/api/loans/${loan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) {
      alert(result?.errors?.[0]?.message ?? 'Failed to update loan.')
      return false
    }
    return true
  }

  return (
    <>
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
          <div className="min-w-0 lg:col-span-3">
            <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
              {name} - <span className="text-sm text-gray-500 dark:text-gray-400">{loanId}</span>
            </h3>
            <p className={`mt-1 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400'}`}>
              {status.toUpperCase()}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CircleDollarSign className="h-4 w-4" />
              <span>{formatAmount(monthly)} {paymentFrequency}</span>
            </div>
          </div>
          <div className="lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Loan Amount</p>
            <p className="mt-1 text-lg font-semibold text-gray-600 dark:text-white">{formatAmount(amount)}</p>
          </div>
          <div className="lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Interest Rate</p>
            <p className="mt-1 text-lg font-semibold text-red-600 dark:text-white">{interestRate}{interestRate !== '-' && '%'}</p>
          </div>
          <div className="lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Remaining</p>
            <p className="mt-1 text-lg font-semibold text-orange-600 dark:text-white">{remaining ? formatAmount(remaining) : '-'}</p>
          </div>
          <div className="lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total Paid</p>
            <p className="mt-1 text-lg font-semibold text-green-500 dark:text-white">{totalPaid ? formatAmount(totalPaid) : '-'}</p>
          </div>
          <div className="flex items-start justify-start gap-2 lg:col-span-1 lg:justify-end">
            <button
              type="button"
              onClick={editModal.openModal}
              aria-label={`Edit ${name}`}
              title="Edit loan"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-brand-400"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button type="button" className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-gray-700 transition hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              View Details <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{percentPaid} paid</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-full rounded-full bg-success-500" style={{ width: percentPaid }} />
          </div>
        </div>
      </div>

      <Modal isOpen={editModal.isOpen} onClose={editModal.closeModal} className="max-w-[584px] p-5 lg:p-10">
        <LoanForm mode="edit" initialData={loan} closeModal={editModal.closeModal} handleSave={handleSave} />
      </Modal>
    </>
  )
}

export default LoanCard
