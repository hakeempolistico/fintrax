import FtTable from '@/app/(frontend)/components/ft-table/ft-table'
import ActionModals from '@/app/(frontend)/modals/ActionModals'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { dateToReadable } from '@/helper/common.helper'
import { Bill } from '@/payload-types'
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
  const paginatedBills = await myPaginatedCollection<Bill>('bills', page, limit, [
    {
      name: 'transactions',
      collection: 'transactions',
      foreignKey: 'bill',
    },
  ])
  const bills = paginatedBills.docs
  const { docs, ...pagination } = paginatedBills

  // Rows
  const rows = bills.map((bill) => ({
    id: {
      type: 'id' as const,
      value: bill.id,
    },
    provider: {
      type: 'icon-text' as const,
      value: bill.provider ?? '-',
      icon: bill.type ?? '-',
    },
    billingPeriod: {
      type: 'text' as const,
      value:
        bill?.billingPeriodStart && bill?.billingPeriodEnd
          ? dateToReadable(bill?.billingPeriodStart) +
            ' - ' +
            dateToReadable(bill?.billingPeriodEnd)
          : '',
    },
    amount: {
      type: 'text' as const,
      value: `₱${(bill.amountDue ?? 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
      })}`,
    },
    status: {
      type: 'badge' as const,
      value: (bill.transactions?.length ?? 0) > 0 ? 'PAID' : 'UNPAID',
      style: (bill.transactions?.length ?? 0) > 0 ? ('success' as const) : ('warning' as const),
    },
  }))

  // Columns
  const columns = [
    {
      key: 'provider',
      value: 'Provider',
      width: '30%',
    },
    {
      key: 'billingPeriod',
      value: 'Billing Period',
    },
    {
      key: 'amount',
      value: 'Amount',
    },
    {
      key: 'status',
      value: 'Status',
    },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          {/* <BasicTableOne /> */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <FtTable columns={columns} rows={rows} pagination={pagination}></FtTable>
            </div>
          </div>
        </ComponentCard>
      </div>
      <ActionModals me={me} collection="bills"></ActionModals>
    </div>
  )
}
