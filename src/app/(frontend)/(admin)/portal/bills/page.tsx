import FtDashboardCard from '@/app/(frontend)/components/dasboard-card'
import FtTable from '@/app/(frontend)/components/ft-table/ft-table'
import ActionModals from '@/app/(frontend)/modals/ActionModals'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { dateToReadable, getDateByDate } from '@/helper/common.helper'
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
  const { docs, ...pagination } = paginatedBills
  const columns = getColumns
  const rows = getRows(docs)
  const unpaidCount = rows.filter((row) => row.status.value === 'UNPAID').length
  const paidCount = rows.filter((row) => row.status.value === 'PAID').length
  const overdueCount = rows.filter((row) => row.status.value === 'OVERDUE').length

  return (
    <div>
      <PageBreadcrumb pageTitle="Bills" />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
        <FtDashboardCard
          label="Total Bills"
          number={pagination.totalDocs.toString()}
          className="!text-brand-500"
        />
        <FtDashboardCard label="Paid" number={paidCount.toString()} className="text-success-500" />
        <FtDashboardCard
          label="Unpaid"
          number={unpaidCount.toString()}
          className="!text-gray-500"
        />
        <FtDashboardCard
          label="Overdue"
          number={overdueCount.toString()}
          className="!text-warning-500"
        />
      </div>
      <div className="space-y-6">
        <FtTable columns={columns} rows={rows} pagination={pagination}></FtTable>
      </div>
      <ActionModals me={me} collection="bills"></ActionModals>
    </div>
  )
}

const getBillingMonth = () => {
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  return lastMonth.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
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

  // Same-month period: 1-31, 1-30, 5-25, etc.
  if (billingStart <= billingEnd) {
    if (currentDay >= billingStart) {
      currentPeriodStart = new Date(currentYear, currentMonth, billingStart)

      currentPeriodEnd = new Date(currentYear, currentMonth, billingEnd)
    } else {
      currentPeriodStart = new Date(currentYear, currentMonth - 1, billingStart)

      currentPeriodEnd = new Date(currentYear, currentMonth - 1, billingEnd)
    }
  } else {
    // Cross-month period: 25-24
    if (currentDay >= billingStart) {
      currentPeriodStart = new Date(currentYear, currentMonth, billingStart)

      currentPeriodEnd = new Date(currentYear, currentMonth + 1, billingEnd)
    } else {
      currentPeriodStart = new Date(currentYear, currentMonth - 1, billingStart)

      currentPeriodEnd = new Date(currentYear, currentMonth, billingEnd)
    }
  }

  currentPeriodEnd.setHours(23, 59, 59, 999)

  /*
   * The payment for the current cycle is based on
   * the month in which the billing period STARTS.
   *
   * 1-31:
   *   Aug 1 - Aug 31 → August 2026
   *
   * 25-24:
   *   Jul 25 - Aug 24 → July 2026
   */
  const currentCycleYear = currentPeriodStart.getFullYear()
  const currentCycleMonth = currentPeriodStart.getMonth()

  const isCurrentCyclePaid = (bill.transactions ?? []).some((transaction) => {
    if (typeof transaction !== 'object') {
      return false
    }
    if (!transaction.billPaymentFor) {
      return false
    }

    const paymentFor = new Date(transaction.billPaymentFor)

    return (
      paymentFor.getFullYear() === currentCycleYear && paymentFor.getMonth() === currentCycleMonth
    )
  })

  if (isCurrentCyclePaid) {
    return {
      value: 'PAID',
      style: 'success' as const,
    }
  }

  /*
   * The current billing period is still ongoing.
   *
   * Therefore, don't mark it unpaid/overdue yet.
   *
   * Example:
   * Aug 1-31
   * Today: Aug 17
   *
   * July was paid.
   * August isn't finished yet.
   * → Still PAID.
   */

  if (now <= currentPeriodEnd) {
    // Check whether the PREVIOUS cycle was paid.
    const previousPeriodStart = new Date(currentPeriodStart)

    if (billingStart <= billingEnd) {
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
    } else {
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
    }

    const previousCycleYear = previousPeriodStart.getFullYear()
    const previousCycleMonth = previousPeriodStart.getMonth()

    const wasPreviousCyclePaid = (bill.transactions ?? []).some((transaction) => {
      if (typeof transaction !== 'object') {
        return false
      }
      if (!transaction.billPaymentFor) {
        return false
      }

      const paymentFor = new Date(transaction.billPaymentFor)

      return (
        paymentFor.getFullYear() === previousCycleYear &&
        paymentFor.getMonth() === previousCycleMonth
      )
    })

    if (wasPreviousCyclePaid) {
      return {
        value: 'PAID',
        style: 'success' as const,
      }
    }

    return {
      value: 'UNPAID',
      style: 'warning' as const,
    }
  }

  /*
   * Billing period has finished and the current cycle
   * hasn't been paid.
   */
  return {
    value: 'OVERDUE',
    style: 'error' as const,
  }
}

const getColumns = [
  {
    key: 'provider',
    value: 'Provider',
    width: '30%',
  },
  {
    key: 'amount',
    value: 'Amount',
  },
  {
    key: 'dueDate',
    value: 'Due Date',
  },
  {
    key: 'billingMonth',
    value: 'Billing Month',
  },
  {
    key: 'status',
    value: 'Status',
  },
]

const getRows = (bills: Bill[]) => {
  return bills.map((bill) => {
    const status = getBillStatus(bill)

    return {
      id: {
        type: 'id' as const,
        value: bill.id,
      },
      provider: {
        type: 'icon-text' as const,
        value: bill.provider ?? '-',
      },
      amount: {
        type: 'text' as const,
        value:
          bill.amount !== undefined && bill.amount !== null
            ? `₱${bill.amount.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
              })}`
            : '-',
      },
      dueDate: {
        type: 'text' as const,
        value: bill.dueDate
          ? getDateByDate(bill.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '-',
      },
      billingMonth: {
        type: 'text' as const,
        value: getBillingMonth(),
      },
      status: {
        type: 'badge' as const,
        value: status.value,
        style: status.style,
      },
    }
  })
}
