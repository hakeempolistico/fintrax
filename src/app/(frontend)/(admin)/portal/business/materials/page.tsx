import type { Metadata } from 'next'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import DashboardCard from '@/components/fintrax/dashboard/DashboardCard'
import MaterialsManager from '@/components/fintrax/materials/MaterialsManager'
import { getMe } from '@/services/app.service'
import { getMyMaterials } from '@/services/material.service'

export const metadata: Metadata = {
  title: 'Materials | Fintrax',
  description: 'Manage raw materials and opening inventory in Fintrax.',
}

export default async function MaterialsPage() {
  const [me, materials] = await Promise.all([getMe(), getMyMaterials()])
  const activeMaterials = materials.filter((material) => material.status === 'active').length
  const lowStock = materials.filter((material) => (material.reorderLevel ?? 0) > 0 && material.openingQuantity <= (material.reorderLevel ?? 0)).length
  const inventoryValue = materials.reduce((total, material) => total + material.openingQuantity * material.costPerBaseUnit, 0)
  const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(inventoryValue)

  return (
    <div>
      <PageBreadcrumb pageTitle="Materials" />
      <div className="space-y-6">
        <section>
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Raw materials, ready for production</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track units, cost, opening stock, and purchase-unit conversions now; stock-in movements can build on this foundation later.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard label="Total Materials" number={String(materials.length)} helper="All saved materials" tone="brand" />
            <DashboardCard label="Active Materials" number={String(activeMaterials)} helper="Available for use" tone="success" />
            <DashboardCard label="Low Stock" number={String(lowStock)} helper="At or below reorder level" tone="warning" />
            <DashboardCard label="Inventory Value" number={money} helper="Opening stock × unit cost" tone="violet" />
          </div>
        </section>
        <MaterialsManager me={me} materials={materials} />
      </div>
    </div>
  )
}
