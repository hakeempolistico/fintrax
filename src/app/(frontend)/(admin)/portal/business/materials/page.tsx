import type { Metadata } from 'next'
import Link from 'next/link'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import DashboardCard from '@/components/fintrax/dashboard/DashboardCard'
import MaterialsManager from '@/components/fintrax/materials/MaterialsManager'
import { getMe } from '@/services/app.service'
import { getMyMaterials } from '@/services/material.service'
import { PackagePlus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Materials | Fintrax',
  description: 'Manage raw materials and inventory in Fintrax.',
}

export default async function MaterialsPage() {
  const [me, materials] = await Promise.all([getMe(), getMyMaterials()])
  const activeMaterials = materials.filter((material) => material.status === 'active').length
  const lowStock = materials.filter((material) => {
    const stock = material.currentQuantity ?? material.openingQuantity
    return (material.reorderLevel ?? 0) > 0 && stock <= (material.reorderLevel ?? 0)
  }).length
  const inventoryValue = materials.reduce((total, material) => {
    const stock = material.currentQuantity ?? material.openingQuantity
    return total + stock * material.costPerBaseUnit
  }, 0)
  const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(inventoryValue)

  return (
    <div>
      <PageBreadcrumb pageTitle="Materials" />
      <div className="space-y-6">
        <section>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Raw materials, ready for production</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track live stock, weighted-average cost, reorder levels, and purchase-unit conversions.</p>
            </div>
            <Link href="/portal/business/stock-in" className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"><PackagePlus className="h-4 w-4" />Purchases / Stock-In</Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard label="Total Materials" number={String(materials.length)} helper="All saved materials" tone="brand" />
            <DashboardCard label="Active Materials" number={String(activeMaterials)} helper="Available for use" tone="success" />
            <DashboardCard label="Low Stock" number={String(lowStock)} helper="At or below reorder level" tone="warning" />
            <DashboardCard label="Inventory Value" number={money} helper="Current stock × average cost" tone="violet" />
          </div>
        </section>
        <MaterialsManager me={me} materials={materials} />
      </div>
    </div>
  )
}
