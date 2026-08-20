import type { Metadata } from 'next'
import DashboardCard from '@/components/fintrax/dashboard/DashboardCard'
import DashboardCharts from '@/components/fintrax/dashboard/DashboardCharts'
import DashboardLists from '@/components/fintrax/dashboard/DashboardLists'
import { formatAmount } from '@/helper/common.helper'
import type { Bill, Loan, Transaction } from '@/payload-types'
import { getMe, myPaginatedCollection } from '@/services/app.service'

export const metadata: Metadata = {
  title: 'Dashboard | Fintrax',
  description: 'Your Fintrax financial overview.',
}

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const transactionMonthKey = (value: string) => monthKey(new Date(value))

export default async function Dashboard() {
  const member = await getMe()
  const [transactionsResult, billsResult, loansResult] = await Promise.all([
    myPaginatedCollection<Transaction>('transactions', 1, 0, [
      { name: 'bill', collection: 'bills', foreignKey: 'transactions' },
      { name: 'loan', collection: 'loans', foreignKey: 'transactions' },
      { name: 'account', collection: 'accounts', foreignKey: 'transactions' },
    ], '-date'),
    myPaginatedCollection<Bill>('bills', 1, 0),
    myPaginatedCollection<Loan>('loans', 1, 0),
  ])

  const transactions = transactionsResult.docs
  const bills = billsResult.docs
  const loans = loansResult.docs
  const now = new Date()
  const currentMonth = monthKey(now)
  const thisMonth = transactions.filter((transaction) => transactionMonthKey(transaction.date) === currentMonth)
  const income = thisMonth.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0)
  const expenses = thisMonth.filter((transaction) => transaction.type === 'expense' || transaction.type === 'payment').reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0)
  const balance = income - expenses

  const monthly = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const key = monthKey(date)
    const monthTransactions = transactions.filter((transaction) => transactionMonthKey(transaction.date) === key)
    return {
      label: date.toLocaleDateString('en-PH', { month: 'short' }),
      income: monthTransactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0),
      expenses: monthTransactions.filter((transaction) => transaction.type === 'expense' || transaction.type === 'payment').reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0),
    }
  })

  const categoryMap = new Map<string, number>()
  thisMonth
    .filter((transaction) => transaction.type === 'expense' || transaction.type === 'payment')
    .forEach((transaction) => {
      const category = transaction.category ?? 'other'
      categoryMap.set(category, (categoryMap.get(category) ?? 0) + (transaction.amount ?? 0))
    })
  const categories = [...categoryMap.entries()]
    .map(([label, value]) => ({
      label: label.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value,
    }))
    .sort((a, b) => b.value - a.value)

  const upcomingBills = [...bills]
    .filter((bill) => bill.dueDate != null)
    .sort((a, b) => {
      const today = now.getDate()
      const distance = (day: number) => day >= today ? day - today : 31 - today + day
      return distance(a.dueDate ?? 31) - distance(b.dueDate ?? 31)
    })
    .slice(0, 5)

  const activeLoans = loans.filter((loan) => loan.status === 'active' || loan.status === 'overdue').slice(0, 5)
  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Good {now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'}, {member.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s your financial overview for {now.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <DashboardCard label="Total Income" number={formatAmount(income)} className="text-success-500" />
        <DashboardCard label="Total Expenses" number={formatAmount(expenses)} className="text-error-500" />
        <DashboardCard label="Monthly Balance" number={formatAmount(balance)} className={balance >= 0 ? 'text-brand-500' : 'text-error-500'} />
        <DashboardCard label="Upcoming Bills" number={`${upcomingBills.length} ${upcomingBills.length === 1 ? 'Bill' : 'Bills'}`} className="text-warning-500" />
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <DashboardCharts monthly={monthly} categories={[]} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <DashboardCharts monthly={[]} categories={categories} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 md:gap-6">
        <DashboardLists bills={upcomingBills} loans={[]} transactions={[]} />
        <DashboardLists bills={[]} loans={activeLoans} transactions={[]} />
      </div>

      <DashboardLists bills={[]} loans={[]} transactions={recentTransactions} />
    </div>
  )
}
