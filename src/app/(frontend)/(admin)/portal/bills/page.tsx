import FtTable from '@/app/(frontend)/components/ft-table'
import ActionModals from '@/app/(frontend)/modals/ActionModals'
import BasicTableOne from '@/app/(frontend)/tables/BasicTableOne'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Bill } from '@/payload-types'
import { getMe, myPaginatedCollection } from '@/services/app.service'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Next.js Basic Table | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template',
  // other metadata
}
export default async function AccountsPage() {
  const me = await getMe()
  const paginatedBills = await myPaginatedCollection<Bill>('bills')
  const bills = paginatedBills.docs

  // Rows
  const rows = bills.map((bill) => ({
    id: {
      type: 'id' as const,
      value: bill.id,
    },

    provider: {
      type: 'two-row' as const,
      value: bill.provider ?? '-',
      subValue: bill.type ?? '-',
    },

    customerAccountNumber: {
      type: 'text' as const,
      value: bill.customerAccountNumber ?? '-',
    },

    amount: {
      type: 'text' as const,
      value: `₱${(bill.amountDue ?? 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
      })}`,
    },
    status: {
      type: 'badge' as const,
      value: 'Unpaid',
      style: 'warning' as const,
    },
  }))

  const columns = [
    {
      key: 'provider',
      value: 'Provider',
      width: '30%',
    },
    {
      key: 'customerAccountNumber',
      value: 'CAN',
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
              <FtTable columns={columns} rows={rows}></FtTable>
            </div>
          </div>
        </ComponentCard>
      </div>
      <ActionModals me={me} collection="accounts"></ActionModals>
    </div>
  )
}
