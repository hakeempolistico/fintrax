import type { Metadata } from 'next'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import DashboardCard from '@/components/fintrax/dashboard/DashboardCard'
import ClientsManager from '@/components/fintrax/clients/ClientsManager'
import { getMe } from '@/services/app.service'
import { getMyClients } from '@/services/client.service'

export const metadata: Metadata = {
  title: 'Clients | Fintrax',
  description: 'Manage your business clients in Fintrax.',
}

export default async function ClientsPage() {
  const [me, clients] = await Promise.all([getMe(), getMyClients()])
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
  const activeClients = clients.filter((client) => client.status === 'active').length
  const prospects = clients.filter((client) => client.status === 'prospect').length
  const recentlyAdded = clients.filter((client) => new Date(client.createdAt).getTime() >= thirtyDaysAgo).length

  return (
    <div>
      <PageBreadcrumb pageTitle="Clients" />

      <div className="space-y-6">
        <section>
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Your business relationships, organized</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Keep client details, contact information, and status in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard label="Total Clients" number={String(clients.length)} helper="All saved clients" tone="brand" />
            <DashboardCard label="Active Clients" number={String(activeClients)} helper="Currently active" tone="success" />
            <DashboardCard label="Prospects" number={String(prospects)} helper="Potential clients" tone="violet" />
            <DashboardCard label="Added Recently" number={String(recentlyAdded)} helper="Last 30 days" tone="bills" />
          </div>
        </section>

        <ClientsManager me={me} clients={clients} />
      </div>
    </div>
  )
}
