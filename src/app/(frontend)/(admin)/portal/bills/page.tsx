import DashboardCard from '@/components/fintrax/dashboard/DashboardCard'
import ActionModals from '@/app/(frontend)/modals/ActionModals'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { formatAmount, getDateByDate } from '@/helper/common.helper'
import { Bill } from '@/payload-types'
import { getMe, myPaginatedCollection } from '@/services/app.service'
import { Metadata } from 'next'
import { CalendarClock, ReceiptText, WalletCards } from 'lucide-react'
import BillsTable from './bills-table'

export const metadata: Metadata = {
  title: 'Bills | Fintrax',
  description: 'Manage your bills in Fintrax',
}

type Props = { searchParams: Promise<{ page?: string; limit?: string }> }

export default async function BillsPage({ searchParams }: Props) {
  const me = await getMe()
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const limit = Number(params.limit ?? 10)
  const paginatedBills = await myPaginatedCollection<Bill>('bills', page, limit, [
    { name: 'transactions', collection: 'transactions', foreignKey: 'bill' },
  ])
  const { docs, ...pagination } = paginatedBills
  const rows = getRows(docs)
  const paidCount = rows.filter((row) => row.status.value === 'PAID').length
  const overdueCount = rows.filter((row) => row.status.value === 'OVERDUE').length
  const totalAmount = docs.reduce((total, doc) => total + (doc.amount ?? 0), 0)

  return (
    <div>
      <PageBreadcrumb pageTitle="Bills" />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <DashboardCard label="Total Monthly" number={formatAmount(totalAmount)} helper="Combined bill amount" tone="neutral" icon={CalendarClock} />
        <DashboardCard label="Total Bills" number={pagination.totalDocs.toString()} helper="Bills being tracked" tone="brand" icon={ReceiptText} />
        <DashboardCard label="Paid" number={paidCount.toString()} helper="Paid in the current cycle" tone="success" icon={WalletCards} />
        <DashboardCard label="Overdue" number={overdueCount.toString()} helper="Bills needing attention" tone="warning" icon={CalendarClock} />
      </div>
      <div className="space-y-6">
        <BillsTable columns={getColumns} rows={rows} bills={docs} pagination={pagination} />
      </div>
      <ActionModals me={me} collection="bills" />
    </div>
  )
}

const getBillingMonth = () => {
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  return lastMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const getBillStatus = (bill: Bill) => {
  const now = new Date()
  const billingStart = bill.billingPeriodStart ?? 1
  const billingEnd = bill.billingPeriodEnd ?? 31
  const currentDay = now.getDate()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  let currentPeriodStart: Date
  let currentPeriodEnd: Date

  if (billingStart < billingEnd) {
    if (currentDay >= billingStart) {
      currentPeriodStart = new Date(currentYear, currentMonth, billingStart)
      currentPeriodEnd = new Date(currentYear, currentMonth, billingEnd)
    } else {
      currentPeriodStart = new Date(currentYear, currentMonth - 1, billingStart)
      currentPeriodEnd = new Date(currentYear, currentMonth - 1, billingEnd)
    }
  } else if (currentDay >= billingStart) {
    currentPeriodStart = new Date(currentYear, currentMonth, billingStart)
    currentPeriodEnd = new Date(currentYear, currentMonth + 1, billingEnd)
  } else {
    currentPeriodStart = new Date(currentYear, currentMonth - 1, billingStart)
    currentPeriodEnd = new Date(currentYear, currentMonth, billingEnd)
  }

  currentPeriodEnd.setHours(23, 59, 59, 999)
  const currentCycleYear = currentPeriodStart.getFullYear()
  const currentCycleMonth = currentPeriodStart.getMonth()
  const isCurrentCyclePaid = (bill.transactions ?? []).some((transaction) => {
    if (typeof transaction !== 'object' || !transaction.billPaymentFor) return false
    const paymentFor = new Date(transaction.billPaymentFor)
    return paymentFor.getFullYear() === currentCycleYear && paymentFor.getMonth() === currentCycleMonth
  })

  if (isCurrentCyclePaid) return { value: 'PAID', style: 'success' as const }

  if (now <= currentPeriodEnd) {
    const previousPeriodStart = new Date(currentPeriodStart)
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
    const previousCycleYear = previousPeriodStart.getFullYear()
    const previousCycleMonth = previousPeriodStart.getMonth()
    const wasPreviousCyclePaid = (bill.transactions ?? []).some((transaction) => {
      if (typeof transaction !== 'object' || !transaction.billPaymentFor) return false
      const paymentFor = new Date(transaction.billPaymentFor)
      return paymentFor.getFullYear() === previousCycleYear && paymentFor.getMonth() === previousCycleMonth
    })
    return wasPreviousCyclePaid
      ? { value: 'PAID', style: 'success' as const }
      : { value: 'UNPAID', style: 'warning' as const }
  }

  return { value: 'OVERDUE', style: 'error' as const }
}

const getColumns = [
  { key: 'provider', value: 'Provider', width: '30%' },
  { key: 'amount', value: 'Amount' },
  { key: 'dueDate', value: 'Due Date' },
  { key: 'billingMonth', value: 'Billing Month' },
  { key: 'status', value: 'Status' },
]

const getRows = (bills: Bill[]) => bills.map((bill) => {
  const status = getBillStatus(bill)
  return {
    id: { type: 'id' as const, value: bill.id },
    provider: { type: 'icon-text' as const, value: bill.provider ?? '-', icon: bill.category },
    amount: {
      type: 'text' as const,
      value: bill.amount !== undefined && bill.amount !== null
        ? `₱${bill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '-',
    },
    dueDate: {
      type: 'text' as const,
      value: bill.dueDate
        ? getDateByDate(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
    },
    billingMonth: { type: 'text' as const, value: getBillingMonth() },
    status: { type: 'badge' as const, value: status.value, style: status.style },
  }
})
