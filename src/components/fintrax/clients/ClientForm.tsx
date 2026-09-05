'use client'

import { useEffect, useState } from 'react'
import type { Member } from '@/payload-types'
import type { ClientRecord, ClientStatus } from '@/types/client'
import Label from '@/components/form/Label'
import Input from '@/components/form/input/InputField'
import Select from '@/components/form/Select'
import Button from '@/components/ui/button/Button'

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'inactive', label: 'Inactive' },
]

type ClientFormProps = {
  me: Member
  client?: ClientRecord
  closeModal?: () => void
}

const getInitialData = (client?: ClientRecord) => ({
  name: client?.name ?? '',
  contactName: client?.contactName ?? '',
  email: client?.email ?? '',
  phone: client?.phone ?? '',
  address: client?.address ?? '',
  status: client?.status ?? ('active' as ClientStatus),
  notes: client?.notes ?? '',
})

export default function ClientForm({ me, client, closeModal }: ClientFormProps) {
  const [data, setData] = useState(() => getInitialData(client))
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setData(getInitialData(client))
    setLogoFile(null)
  }, [client])

  const uploadLogo = async () => {
    if (!logoFile) return undefined

    const formData = new FormData()
    formData.append('file', logoFile)
    formData.append('_payload', JSON.stringify({ alt: `${data.name || 'Client'} logo` }))

    const response = await fetch('/api/media', {
      method: 'POST',
      body: formData,
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result?.errors?.[0]?.message ?? 'Unable to upload client logo.')
    }

    return result?.doc?.id ?? result?.id
  }

  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!data.name.trim()) {
      alert('Client name is required.')
      return
    }

    setSaving(true)
    try {
      const logo = await uploadLogo()
      const endpoint = client ? `/api/clients/${client.id}` : '/api/clients'
      const payload = {
        ...data,
        name: data.name.trim(),
        member: me.id,
        ...(logo ? { logo } : {}),
      }

      const response = await fetch(endpoint, {
        method: client ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.errors?.[0]?.message ?? `Unable to ${client ? 'update' : 'add'} client.`)
      }

      closeModal?.()
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save client.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmitHandler}>
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {client ? 'Edit Client' : 'Add Client'}
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {client ? 'Update the client details below.' : 'Add a client to your Business Finance workspace.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Client / Business Name</Label>
          <Input
            defaultValue={data.name}
            onChange={(event) => setData({ ...data, name: event.target.value })}
            type="text"
            placeholder="Acme Corporation"
            name="name"
          />
        </div>

        <div>
          <Label>Contact Person</Label>
          <Input
            defaultValue={data.contactName}
            onChange={(event) => setData({ ...data, contactName: event.target.value })}
            type="text"
            placeholder="Juan Dela Cruz"
            name="contactName"
          />
        </div>

        <div>
          <Label>Status</Label>
          <Select
            options={statusOptions}
            defaultValue={data.status}
            onChange={(value) => setData({ ...data, status: value as ClientStatus })}
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            defaultValue={data.email}
            onChange={(event) => setData({ ...data, email: event.target.value })}
            type="email"
            placeholder="client@example.com"
            name="email"
          />
        </div>

        <div>
          <Label>Phone</Label>
          <Input
            defaultValue={data.phone}
            onChange={(event) => setData({ ...data, phone: event.target.value })}
            type="text"
            placeholder="+63 917 123 4567"
            name="phone"
          />
        </div>

        <div className="sm:col-span-2">
          <Label>Address</Label>
          <textarea
            value={data.address}
            onChange={(event) => setData({ ...data, address: event.target.value })}
            rows={3}
            placeholder="Business address"
            name="address"
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
          />
        </div>

        <div className="sm:col-span-2">
          <Label>Client Logo <span className="font-normal text-gray-400">(optional)</span></Label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
            className="block w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:border-gray-700 dark:text-gray-300 dark:file:bg-white/[0.06] dark:file:text-gray-200"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Leave this empty to use the client initials as the placeholder.
          </p>
        </div>

        <div className="sm:col-span-2">
          <Label>Notes</Label>
          <textarea
            value={data.notes}
            onChange={(event) => setData({ ...data, notes: event.target.value })}
            rows={3}
            placeholder="Optional notes about this client"
            name="notes"
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
          />
        </div>
      </div>

      <div className="mt-6 flex w-full items-center justify-end gap-3">
        <Button size="sm" variant="outline" type="button" onClick={closeModal} disabled={saving}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? 'Saving...' : client ? 'Save Changes' : 'Add Client'}
        </Button>
      </div>
    </form>
  )
}
