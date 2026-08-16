import FtTable, { FtColumn, FtRow } from '@/app/(frontend)/components/ft-table/ft-table'
import ActionModals from '@/app/(frontend)/modals/ActionModals'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { dateToReadable, formatAmount } from '@/helper/common.helper'
import { Account, Bill, Loan, Transaction } from '@/payload-types'
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

  const paginated = await myPaginatedCollection<Transaction>('transactions', page, limit)
  const { docs, ...pagination } = paginated
  const columns: FtColumn[] = [
    {
      key: 'id',
      value: 'ID',
    },
    {
      key: 'category',
      value: 'Category',
    },
    {
      key: 'amount',
      value: 'Amount',
    },
    {
      key: 'date',
      value: 'Date',
    },
  ]
  const rows: FtRow[] = docs.map((transaction) => {
    return {
      id: {
        type: 'text' as const,
        value: transaction.id,
      },

      category: {
        type: 'icon-text' as const,
        value: transaction.category ?? 'other',
        icon: transaction.type,
      },

      amount: {
        type: 'text' as const,
        value: String(formatAmount(transaction.amount)),
      },

      date: {
        type: 'text' as const,
        value: dateToReadable(transaction.date),
      },
    }
  })

  const [{ docs: accounts }, { docs: bills }, { docs: loans }] = await Promise.all([
    myPaginatedCollection<Account>('accounts', 1, 0),
    myPaginatedCollection<Bill>('bills', 1, 0),
    myPaginatedCollection<Loan>('loans', 1, 0),
  ])

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
      <ActionModals
        me={me}
        collection="transactions"
        bills={bills}
        loans={loans}
        accounts={accounts}
      ></ActionModals>
    </div>
  )
}
