import FtDashboardCard from '@/app/(frontend)/components/dasboard-card'
import FtTable, { FtColumn, FtRow } from '@/app/(frontend)/components/ft-table/ft-table'
import ActionModals from '@/app/(frontend)/modals/ActionModals'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { dateToReadable, formatAmount } from '@/helper/common.helper'
import { Account, Bill, Loan, Transaction } from '@/payload-types'
import {
  getAverageMonthlyExpenses,
  getMe,
  getTotalExpensesAndPayments,
  getTransactionsThisMonth,
  myPaginatedCollection,
} from '@/services/app.service'
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

  const paginated = await myPaginatedCollection<Transaction>(
    'transactions',
    page,
    limit,
    [],
    '-date',
  )
  const { docs, ...pagination } = paginated
  const columns: FtColumn[] = [
    {
      key: 'category',
      value: 'Category',
    },
    {
      key: 'description',
      value: 'Description',
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
      category: {
        type: 'icon-text' as const,
        value:
          transaction.category
            ?.split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') ?? 'other',
        icon: transaction.type,
      },
      description: {
        type: 'text' as const,
        value: transaction.notes ?? 'other',
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

  const [{ docs: accounts }, { docs: bills }, { docs: loans }, { docs: AllTransactions }] =
    await Promise.all([
      myPaginatedCollection<Account>('accounts', 1, 0),
      myPaginatedCollection<Bill>('bills', 1, 0),
      myPaginatedCollection<Loan>('loans', 1, 0),
      myPaginatedCollection<Transaction>('transactions', 1, 0),
    ])

  const averageExpensesPerMonth = getAverageMonthlyExpenses(AllTransactions)
  const transactionsThisMonth = await getTransactionsThisMonth(me.id)
  const expenses = getTotalExpensesAndPayments(transactionsThisMonth)
  const income = transactionsThisMonth
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + (transaction.amount ?? 0), 0)
  const balance = income - expenses

  return (
    <div>
      <PageBreadcrumb pageTitle="Transactions" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
        <FtDashboardCard
          label="Expense"
          number={formatAmount(expenses)}
          className="!text-brand-500"
        />
        <FtDashboardCard
          label="Income"
          number={formatAmount(income)}
          className="text-success-500"
        />
        <FtDashboardCard
          label="Balance"
          number={formatAmount(balance)}
          className="!text-gray-500"
        />
        <FtDashboardCard
          label="Average Expenses Per Month"
          number={formatAmount(averageExpensesPerMonth)}
          className="!text-warning-500"
        />
      </div>
      <div className="space-y-6">
        <FtTable columns={columns} rows={rows} pagination={pagination}></FtTable>
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
