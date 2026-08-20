'use client'

import { formatAmount } from '@/helper/common.helper'
import { Loan } from '@/payload-types'
import { CircleDollarSign, Eye, Pencil } from 'lucide-react'
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

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const titleCase = (value?: string | null) => {
  if (!value) return '-'
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const LoanCard = (props: LoanCardProps) => {
  const { name, loanId, monthly, amount, paymentFrequency, interestRate, status, loan } = props
  const editModal = useModal()
  const viewModal = useModal()

  const transactions = (loan.transactions ?? []).filter(
    (transaction): transaction is Exclude<typeof transaction, string> =>
      typeof transaction === 'object' && transaction !== null,
  )

  const totalPaid = transactions.reduce((total, transaction) => total + (transaction.amount ?? 0), 0)
  const remaining = loan.interestType === 'fixed' ? Math.max(loan.principalAmount - totalPaid, 0) : 0
  const percentPaidNumber =
    loan.terms && loan.termsPaid ? Math.min((loan.termsPaid / loan.terms) * 100, 100) : 0
  const percentPaid = `${percentPaidNumber}%`

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

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
            <p
              className={`mt-1 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400'}`}
            >
              {status.toUpperCase()}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CircleDollarSign className="h-4 w-4" />
              <span>
                {formatAmount(monthly)} {paymentFrequency}
              </span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Loan Amount</p>
            <p className="mt-1 text-lg font-semibold text-gray-600 dark:text-white">{formatAmount(amount)}</p>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Interest Rate</p>
            <p className="mt-1 text-lg font-semibold text-red-600 dark:text-white">
              {interestRate}
              {interestRate !== '-' && '%'}
            </p>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Remaining</p>
            <p className="mt-1 text-lg font-semibold text-orange-600 dark:text-white">
              {remaining ? formatAmount(remaining) : '-'}
            </p>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total Paid</p>
            <p className="mt-1 text-lg font-semibold text-green-500 dark:text-white">
              {totalPaid ? formatAmount(totalPaid) : '-'}
            </p>
          </div>

          <div className="flex items-start justify-start gap-2 lg:col-span-1 lg:justify-end">
            <button
              type="button"
              onClick={editModal.openModal}
              aria-label={`Edit ${name}`}
              title="Edit loan"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={viewModal.openModal}
              aria-label={`View ${name}`}
              title="View loan details"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 transition hover:bg-purple-100 hover:text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20"
            >
              <Eye className="h-4 w-4" />
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

      <Modal isOpen={viewModal.isOpen} onClose={viewModal.closeModal} className="max-w-[760px] p-5 lg:p-8">
        <div className="max-h-[80vh] overflow-y-auto pr-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Loan Details</p>
              <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{loan.name}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {loan.lender} {loan.accountNumber ? `• ${loan.accountNumber}` : ''}
              </p>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400'}`}>
              {titleCase(status)}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DetailCard label="Principal" value={formatAmount(loan.principalAmount)} />
            <DetailCard label="Total Paid" value={formatAmount(totalPaid)} />
            <DetailCard label="Remaining" value={loan.interestType === 'fixed' ? formatAmount(remaining) : '-'} />
            <DetailCard label="Progress" value={`${percentPaidNumber.toFixed(0)}%`} />
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Repayment Progress</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {loan.termsPaid ?? 0} / {loan.terms ?? '-'} terms
              </p>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div className="h-full rounded-full bg-success-500" style={{ width: percentPaid }} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <DetailRow label="Loan Type" value={titleCase(loan.loanType)} />
            <DetailRow label="Interest Type" value={titleCase(loan.interestType)} />
            <DetailRow label="Interest Rate" value={loan.interestRate != null ? `${loan.interestRate}%` : '-'} />
            <DetailRow label="Payment Frequency" value={titleCase(loan.paymentFrequency)} />
            <DetailRow label="Payment Amount" value={loan.monthlyPayment != null ? formatAmount(loan.monthlyPayment) : '-'} />
            <DetailRow label="Outstanding Balance" value={loan.outstandingBalance != null ? formatAmount(loan.outstandingBalance) : '-'} />
            <DetailRow label="Start Date" value={formatDate(loan.startDate)} />
            <DetailRow label="End Date" value={formatDate(loan.endDate)} />
          </div>

          {loan.notes && (
            <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Notes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{loan.notes}</p>
            </div>
          )}

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Payments</h4>
              <span className="text-xs text-gray-400">Latest {Math.min(recentTransactions.length, 5)}</span>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                {recentTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between gap-4 px-4 py-3 ${index !== recentTransactions.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{formatDate(transaction.date)}</p>
                      <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                        {titleCase(transaction.paymentMethod)}
                        {transaction.reference ? ` • ${transaction.reference}` : ''}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-success-600 dark:text-success-400">
                      {formatAmount(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                No loan payments recorded yet.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}

const DetailCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/[0.03]">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
  </div>
)

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p>
  </div>
)

export default LoanCard
