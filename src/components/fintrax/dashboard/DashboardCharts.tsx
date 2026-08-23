'use client'

import type { ApexOptions } from 'apexcharts'
import dynamic from 'next/dynamic'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

type MonthlyPoint = {
  label: string
  income: number
  expenses: number
}

type CategoryPoint = {
  label: string
  value: number
}

type DashboardChartsProps =
  | { type: 'monthly'; monthly: MonthlyPoint[] }
  | { type: 'categories'; categories: CategoryPoint[] }

const peso = (value: number) => `₱${value.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`

export default function DashboardCharts(props: DashboardChartsProps) {
  if (props.type === 'monthly') {
    const options: ApexOptions = {
      chart: { fontFamily: 'Outfit, sans-serif', toolbar: { show: false } },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      xaxis: {
        categories: props.monthly.map((item) => item.label),
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { formatter: (value) => peso(value) } },
      grid: { borderColor: '#E4E7EC', strokeDashArray: 4 },
      legend: { position: 'top', horizontalAlign: 'left' },
      tooltip: { y: { formatter: (value) => peso(value) } },
    }

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Income vs Expenses</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Last 6 months</p>
        </div>
        <ReactApexChart
          type="area"
          height={280}
          options={options}
          series={[
            { name: 'Income', data: props.monthly.map((item) => item.income) },
            { name: 'Expenses', data: props.monthly.map((item) => item.expenses) },
          ]}
        />
      </div>
    )
  }

  const options: ApexOptions = {
    chart: { fontFamily: 'Outfit, sans-serif' },
    labels: props.categories.map((item) => item.label),
    legend: { position: 'bottom' },
    dataLabels: { enabled: false },
    stroke: { width: 2 },
    tooltip: { y: { formatter: (value) => peso(value) } },
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Expenses by Category</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This month</p>
      </div>
      {props.categories.length ? (
        <ReactApexChart
          type="donut"
          height={280}
          options={options}
          series={props.categories.map((item) => item.value)}
        />
      ) : (
        <div className="flex h-[280px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          No expense transactions this month.
        </div>
      )}
    </div>
  )
}
