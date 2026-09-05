import type { Metadata } from 'next'
import DashboardCard from '@/components/fintrax/dashboard/DashboardCard'
import DashboardCharts from '@/components/fintrax/dashboard/DashboardCharts'
import DashboardExpenseCard from '@/components/fintrax/dashboard/DashboardExpenseCard'
import DashboardIncomeCard from '@/components/fintrax/dashboard/DashboardIncomeCard'
import DashboardLists from '@/components/fintrax/dashboard/DashboardLists'
import DashboardPeriodFilter from '@/components/fintrax/dashboard/DashboardPeriodFilter'
import { formatAmount } from '@/helper/common.helper'
import type { Bill, Loan, Transaction } from '@/payload-types'
import { getMe, myPaginatedCollection } from '@/services/app.service'

export const metadata: Metadata = {
  title: 'Personal Finance Overview | Fintrax',
  description: 'Your personal finance overview in Fintrax.',
}

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const transactionMonthKey = (value: string) => monthKey(new Date(value))
const monthDate = (key: string) => {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1)
}
const monthLabel = (key: string) => monthDate(key).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

type OverviewProps = {
  searchParams: Promise<{ period?: string | string[] }>
}

export default async function PersonalFinanceOverview({ searchParams }: OverviewProps) {
  const member = await getMe()
  const [transactionsResult, billsResult, loansResult] = await Promise.all([
    myPaginatedCollection<Transaction>('transactions', 1, 0, [], '-date'),
    myPaginatedCollection<Bill>('bills', 1, 0),
    myPaginatedCollection<Loan>('loans', 1, 0),
  ])

  const transactions = transactionsResult.docs
  const bills = billsResult.docs
  const loans = loansResult.docs
  const now = new Date()
  const currentMonth = monthKey(now)
  const availablePeriods = [...new Set(transactions.map((transaction) => transactionMonthKey(transaction.date)))].sort((a, b) => b.localeCompare(a))
  const requestedPeriod = (await searchParams).period
  const requestedPeriodValue = Array.isArray(requestedPeriod) ? requestedPeriod[0] : requestedPeriod
  const selectedPeriod = requestedPeriodValue && availablePeriods.includes(requestedPeriodValue)
    ? requestedPeriodValue
    : availablePeriods.includes(currentMonth)
      ? currentMonth
      : availablePeriods[0] ?? currentMonth
  const selectedDate = monthDate(selectedPeriod)
  const selectedLabel = monthLabel(selectedPeriod)
  const selectedTransactions = transactions.filter((transaction) => transactionMonthKey(transaction.date) === selectedPeriod)
  const incomeTransactions = selectedTransactions.filter((transaction) => transaction.type === 'income')
  const expenseTransactions = selectedTransactions.filter((transaction) => transaction.type === 'expense' || transaction.type === 'payment')

  const income = incomeTransactions.reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0)
  const expenses = expenseTransactions.reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0)
  const balance = income - expenses

  const monthly = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - (5 - index), 1)
    const key = monthKey(date)
    const monthTransactions = transactions.filter((transaction) => transactionMonthKey(transaction.date) === key)
    return {
      label: date.toLocaleDateString('en-PH', { month: 'short', year: '2-digit' }),
      income: monthTransactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0),
      expenses: monthTransactions
        .filter((transaction) => transaction.type === 'expense' || transaction.type === 'payment')
        .reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0),
    }
  })

  const categoryMap = new Map<string, number>()
  expenseTransactions.forEach((transaction) => {
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
      const referenceDay = selectedPeriod === currentMonth ? now.getDate() : 1
      const distance = (day: number) => day >= referenceDay ? day - referenceDay : 31 - referenceDay + day
      return distance(a.dueDate ?? 31) - distance(b.dueDate ?? 31)
    })
    .slice(0, 5)

  const activeLoans = loans
    .filter((loan) => loan.status === 'active' || loan.status === 'overdue')
    .slice(0, 5)
  const recentTransactions = selectedTransactions.slice(0, 5)
  const periodOptions = availablePeriods.length
    ? availablePeriods.map((value) => ({ value, label: monthLabel(value) }))
    : [{ value: currentMonth, label: monthLabel(currentMonth) }]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Good {now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'}, {member.firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here&apos;s your personal finance overview for {selectedLabel}.
          </p>
        </div>
        <DashboardPeriodFilter value={selectedPeriod} options={periodOptions} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <DashboardIncomeCard total={income} periodLabel={selectedLabel} transactions={incomeTransactions} />
        <DashboardExpenseCard total={expenses} periodLabel={selectedLabel} transactions={expenseTransactions} />
        <DashboardCard label="Monthly Balance" number={formatAmount(balance)} helper="Income less expenses" tone="balance" />
        <DashboardCard label="Upcoming Bills" number={`${upcomingBills.length} ${upcomingBills.length === 1 ? 'Bill' : 'Bills'}`} helper="Next bills requiring attention" tone="bills" />
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <DashboardCharts type="monthly" monthly={monthly} periodLabel={selectedLabel} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <DashboardCharts type="categories" categories={categories} periodLabel={selectedLabel} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 md:gap-6">
        <DashboardLists type="bills" items={upcomingBills} />
        <DashboardLists type="loans" items={activeLoans} />
      </div>

      <DashboardLists type="transactions" items={recentTransactions} />
    </div>
  )
}
