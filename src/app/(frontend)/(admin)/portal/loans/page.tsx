import FtDashboardCard from '@/app/(frontend)/components/dasboard-card'
import ActionModals from '@/app/(frontend)/modals/ActionModals'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { formatAmount, generateKey } from '@/helper/common.helper'
import { Loan } from '@/payload-types'
import { getMe, myPaginatedCollection } from '@/services/app.service'
import { Metadata } from 'next'
import LoanCard from './loan-card'

export const metadata: Metadata = {
  title: 'Next.js Basic Table | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template',
  // other metadata
}
type Props = {
  searchParams: Promise<{
    page?: string
    limit?: string
  }>
}
export default async function AccountsPage({ searchParams }: Props) {
  const me = await getMe()
  const paginated = await myPaginatedCollection<Loan>('loans', 1, 0, [
    {
      name: 'transactions',
      collection: 'transactions',
      foreignKey: 'loan',
    },
  ])
  const { docs, ...pagination } = paginated
  const rows = getRows(docs)
  const totalMonthlyPayment = docs.reduce((total, loan) => total + (loan.monthlyPayment ?? 0), 0)

  return (
    <div>
      <PageBreadcrumb pageTitle="Loans" />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
        <FtDashboardCard
          label="Total Montly"
          number={formatAmount(totalMonthlyPayment)}
          className="!text-brand-500"
        />
        <FtDashboardCard label="Total Paid" number={'10'} className="text-success-500" />
        <FtDashboardCard label="Total Balance" number={'10'} className="!text-gray-500" />
        <FtDashboardCard label="Next Payment Due" number={'10'} className="!text-warning-500" />
      </div>
      <div className="space-y-6">
        {/* <FtTable columns={columns} rows={rows} pagination={pagination}></FtTable> */}
        {rows.map((row) => (
          <LoanCard key={row.id} {...row}></LoanCard>
        ))}
      </div>
      <ActionModals me={me} collection="bills"></ActionModals>
    </div>
  )
}

const getRows = (loans: Loan[]) => {
  return loans.map((loan) => {
    return {
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
    }
  })
}
