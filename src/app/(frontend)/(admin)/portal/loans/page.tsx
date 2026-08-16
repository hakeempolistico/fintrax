import FtTable from '@/app/(frontend)/components/ft-table/ft-table'
import ActionModals from '@/app/(frontend)/modals/ActionModals'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { dateToReadable, formatAmount } from '@/helper/common.helper'
import { Bill, Loan } from '@/payload-types'
import { getMe, myPaginatedCollection } from '@/services/app.service'
import { Metadata } from 'next'

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
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const limit = Number(params.limit ?? 10)
  const paginated = await myPaginatedCollection<Loan>('loans', page, limit, [
    {
      name: 'transactions',
      collection: 'transactions',
      foreignKey: 'loan',
    },
  ])
  const { docs, ...pagination } = paginated
  const columns = [
    {
      key: 'name',
      value: 'Name',
    },
    {
      key: 'lender',
      value: 'Lender',
    },
    {
      key: 'principalAmount',
      value: 'Principal Amount',
    },
    {
      key: 'totalPaid',
      value: 'Total Paid',
    },
    {
      key: 'status',
      value: 'Status',
    },
  ]
  const rows = docs.map((loan) => {
    let statusStyle: 'success' | 'error' = 'success'
    switch (loan.status) {
      case 'overdue':
        statusStyle = 'error'
        break
      case 'defaulted':
        statusStyle = 'error'
        break

      default:
        break
    }
    return {
      id: {
        type: 'id' as const,
        value: loan.id,
      },
      name: {
        type: 'icon-text' as const,
        value: loan.name,
        icon: loan.loanType,
      },
      lender: {
        type: 'text' as const,
        value: loan.lender,
      },
      principalAmount: {
        type: 'text' as const,
        value: formatAmount(loan.principalAmount).toString(),
      },
      totalPaid: {
        type: 'text' as const,
        value: formatAmount(
          loan.transactions?.reduce(
            (total, transaction) =>
              total + (typeof transaction === 'string' ? 0 : Number(transaction.amount || 0)),
            0,
          ) ?? 0,
        ).toString(),
      },
      status: {
        type: 'badge' as const,
        value: loan.status,
        style: statusStyle,
      },
    }
  })

  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <FtTable columns={columns} rows={rows} pagination={pagination}></FtTable>
            </div>
          </div>
        </ComponentCard>
      </div>
      <ActionModals me={me} collection="loans"></ActionModals>
    </div>
  )
}
