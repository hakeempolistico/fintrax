'use client'

import { useMemo, useState } from 'react'
import type { Member, Media } from '@/payload-types'
import type { ClientRecord, ClientStatus } from '@/types/client'
import { Modal } from '@/components/ui/modal'
import Button from '@/components/ui/button/Button'
import ClientForm from './ClientForm'
import { Pencil, Plus, Search, Trash2, UserRound } from 'lucide-react'

const statusClasses: Record<ClientStatus, string> = {
  active: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  prospect: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300',
}

const statusLabels: Record<ClientStatus, string> = {
  active: 'Active',
  prospect: 'Prospect',
  inactive: 'Inactive',
}

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('') || 'CL'

const getLogoUrl = (logo?: string | Media | null) => {
  if (!logo || typeof logo === 'string') return null
  return logo.url ?? null
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))

type ClientsManagerProps = {
  me: Member
  clients: ClientRecord[]
}

export default function ClientsManager({ me, clients }: ClientsManagerProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | ClientStatus>('all')

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return clients.filter((client) => {
      const matchesStatus = status === 'all' || client.status === status
      const haystack = [client.name, client.contactName, client.email, client.phone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return matchesStatus && (!normalizedQuery || haystack.includes(normalizedQuery))
    })
  }, [clients, query, status])

  const deleteClient = async (client: ClientRecord) => {
    if (!window.confirm(`Delete ${client.name}? This cannot be undone.`)) return

    const response = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) {
      alert(result?.errors?.[0]?.message ?? 'Unable to delete client.')
      return
    }
    window.location.reload()
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Clients</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage the people and businesses you work with.</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-gray-800 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search clients..."
              className="h-10 w-full rounded-lg border border-gray-300 bg-transparent pl-9 pr-3 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as 'all' | ClientStatus)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="prospect">Prospect</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {filteredClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Added</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredClients.map((client) => {
                  const logoUrl = getLogoUrl(client.logo)
                  return (
                    <tr key={client.id} className="transition hover:bg-gray-50/60 dark:hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-600 dark:border-gray-700 dark:bg-white/[0.04] dark:text-gray-300">
                            {logoUrl ? (
                              <img src={logoUrl} alt={`${client.name} logo`} className="h-full w-full object-contain p-1.5" />
                            ) : (
                              getInitials(client.name)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900 dark:text-white">{client.name}</p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{client.address || 'No address added'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-800 dark:text-gray-200">{client.contactName || '—'}</p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{client.email || client.phone || 'No contact details'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[client.status]}`}>
                          {statusLabels[client.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(client.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingClient(client)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-brand-500 dark:border-gray-700 dark:hover:bg-white/[0.04]"
                            aria-label={`Edit ${client.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteClient(client)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:hover:bg-red-500/10"
                            aria-label={`Delete ${client.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-white/[0.05]">
              <UserRound className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-medium text-gray-900 dark:text-white">No clients found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {clients.length === 0 ? 'Add your first client to get started.' : 'Try changing your search or status filter.'}
            </p>
          </div>
        )}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} className="max-h-[calc(100vh-2rem)] max-w-[640px] overflow-y-auto p-5 lg:p-8">
        <ClientForm me={me} closeModal={() => setCreateOpen(false)} />
      </Modal>

      <Modal isOpen={Boolean(editingClient)} onClose={() => setEditingClient(null)} className="max-h-[calc(100vh-2rem)] max-w-[640px] overflow-y-auto p-5 lg:p-8">
        {editingClient && <ClientForm me={me} client={editingClient} closeModal={() => setEditingClient(null)} />}
      </Modal>
    </>
  )
}
