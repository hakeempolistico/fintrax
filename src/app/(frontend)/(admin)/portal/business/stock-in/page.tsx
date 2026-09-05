import type { Metadata } from 'next'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import DashboardCard from '@/components/fintrax/dashboard/DashboardCard'
import PurchasesManager from '@/components/fintrax/stock-in/PurchasesManager'
import { getMe } from '@/services/app.service'
import { getMyMaterials } from '@/services/material.service'
import { getMyPurchases } from '@/services/purchase.service'

export const metadata: Metadata = {
  title: 'Purchases / Stock-In | Fintrax',
  description: 'Record material purchases and stock-in movements in Fintrax.',
}

export default async function StockInPage() {
  const [me, materials, purchases] = await Promise.all([getMe(), getMyMaterials(), getMyPurchases()])
  const totalSpend = purchases.reduce((sum, purchase) => sum + Number(purchase.totalAmount || 0), 0)
  const thisMonth = new Date()
  const monthPurchases = purchases.filter((purchase) => {
    const value = new Date(purchase.purchaseDate)
    return value.getMonth() === thisMonth.getMonth() && value.getFullYear() === thisMonth.getFullYear()
  })
  const monthSpend = monthPurchases.reduce((sum, purchase) => sum + Number(purchase.totalAmount || 0), 0)
  const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)

  return (
    <div>
      <PageBreadcrumb pageTitle="Purchases / Stock-In" />
      <div className="space-y-6">
        <section>
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Bring purchased materials into inventory</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Every stock-in creates a permanent stock movement and updates weighted-average material cost.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard label="Stock-In Records" number={String(purchases.length)} helper="All recorded purchases" tone="brand" />
            <DashboardCard label="This Month" number={String(monthPurchases.length)} helper="Purchases recorded this month" tone="success" />
            <DashboardCard label="Month Spend" number={money(monthSpend)} helper="Material purchases this month" tone="warning" />
            <DashboardCard label="Total Spend" number={money(totalSpend)} helper="All recorded material purchases" tone="violet" />
          </div>
        </section>
        <PurchasesManager me={me} materials={materials} purchases={purchases} />
      </div>
    </div>
  )
}
