import DashboardCard from '@/components/fintrax/dashboard/DashboardCard'
import { FtColumn, FtRow } from '@/components/fintrax/tables/FtTable'
import TransactionsTable from '@/components/fintrax/transactions/TransactionsTable'
import ActionModals from '@/components/fintrax/modals/ActionModals'
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
  title: 'Transactions | Fintrax',
  description: 'Manage and review your Fintrax transactions.',
}

type Props = {
  searchParams: Promise<{ page?: string; limit?: string }>
}

export default async function TransactionsPage({ searchParams }: Props) {
  const me = await getMe()
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const limit = Number(params.limit ?? 10)

  const [paginated, accountsResult, billsResult, loansResult, allTransactionsResult] =
    await Promise.all([
      myPaginatedCollection<Transaction>('transactions', page, limit, [], '-date'),
      myPaginatedCollection<Account>('accounts', 1, 0),
      myPaginatedCollection<Bill>('bills', 1, 0),
      myPaginatedCollection<Loan>('loans', 1, 0),
      myPaginatedCollection<Transaction>('transactions', 1, 0),
    ])

  const { docs, ...pagination } = paginated
  const accounts = accountsResult.docs
  const bills = billsResult.docs
  const loans = loansResult.docs
  const allTransactions = allTransactionsResult.docs

  const columns: FtColumn[] = [
    { key: 'category', value: 'Category' },
    { key: 'description', value: 'Description' },
    { key: 'amount', value: 'Amount' },
    { key: 'date', value: 'Date' },
  ]

  const rows: FtRow[] = docs.map((transaction) => ({
    id: { type: 'id', value: transaction.id },
    category: {
      type: 'icon-text',
      value:
        transaction.category
          ?.split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ') ?? 'Other',
      icon: transaction.type,
    },
    description: { type: 'text', value: transaction.notes ?? '—' },
    amount: { type: 'text', value: String(formatAmount(transaction.amount)) },
    date: { type: 'text', value: dateToReadable(transaction.date) },
  }))

  const averageExpensesPerMonth = getAverageMonthlyExpenses(allTransactions)
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
        <DashboardCard label="Expense" number={formatAmount(expenses)} className="!text-brand-500" />
        <DashboardCard label="Income" number={formatAmount(income)} className="text-success-500" />
        <DashboardCard label="Balance" number={formatAmount(balance)} className="!text-gray-500" />
        <DashboardCard label="Average Expenses Per Month" number={formatAmount(averageExpensesPerMonth)} className="!text-warning-500" />
      </div>

      <div className="space-y-6">
        <TransactionsTable
          columns={columns}
          rows={rows}
          transactions={docs}
          pagination={pagination}
          accounts={accounts}
          bills={bills}
          loans={loans}
        />
      </div>

      <ActionModals
        me={me}
        collection="transactions"
        bills={bills}
        loans={loans}
        accounts={accounts}
      />
    </div>
  )
}
