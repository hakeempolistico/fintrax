import DashboardCard from '@/components/fintrax/dashboard/DashboardCard'
import ActionModals from '@/app/(frontend)/modals/ActionModals'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { formatAmount, generateKey } from '@/helper/common.helper'
import { Loan } from '@/payload-types'
import { getMe, myPaginatedCollection } from '@/services/app.service'
import { Metadata } from 'next'
import { CalendarClock, HandCoins, Landmark } from 'lucide-react'
import LoanCard from './loan-card'

export const metadata: Metadata = {
  title: 'Loans | Fintrax',
  description: 'Manage and review your Fintrax loans.',
}
type Props = {
  searchParams: Promise<{
    page?: string
    limit?: string
  }>
}
export default async function LoansPage({ searchParams }: Props) {
  const me = await getMe()
  const paginated = await myPaginatedCollection<Loan>('loans', 1, 0, [
    {
      name: 'transactions',
      collection: 'transactions',
      foreignKey: 'loan',
    },
  ])
  const { docs } = paginated
  const rows = getRows(docs)
  const totalMonthlyPayment = docs.reduce((total, loan) => total + (loan.monthlyPayment ?? 0), 0)
  const activeLoans = docs.filter((loan) => loan.status === 'active')
  const activeLoansCount = activeLoans.length
  const overdueLoansCount = docs.filter((loan) => loan.status === 'overdue').length
  const totalPrincipalAmount = activeLoans.reduce(
    (total, loan) => total + (loan.principalAmount ?? 0),
    0,
  )

  return (
    <div>
      <PageBreadcrumb pageTitle="Loans" />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <DashboardCard label="Total Monthly" number={formatAmount(totalMonthlyPayment)} helper="Combined scheduled payments" tone="brand" icon={CalendarClock} />
        <DashboardCard label="Total Principal" number={formatAmount(totalPrincipalAmount)} helper="Across active loans" tone="success" icon={Landmark} />
        <DashboardCard label="Active Loans" number={activeLoansCount.toString()} helper="Currently being repaid" tone="neutral" icon={HandCoins} />
        <DashboardCard label="Overdue Loans" number={overdueLoansCount.toString()} helper="Loans needing attention" tone="warning" icon={CalendarClock} />
      </div>
      <div className="space-y-6">
        {rows.map((row) => <LoanCard key={row.id} {...row} />)}
      </div>
      <ActionModals me={me} collection="loans" />
    </div>
  )
}

const getRows = (loans: Loan[]) => loans.map((loan) => ({
  id: generateKey(),
  name: loan.name,
  loanId: loan.accountNumber ?? loan.id,
  monthly: loan.monthlyPayment ?? '-',
  amount: loan.principalAmount,
  paymentFrequency: loan.paymentFrequency,
  interestRate: loan.interestRate ? loan.interestRate.toString() : '-',
  status: loan.status,
  interestType: loan.interestType,
  loan,
}))
