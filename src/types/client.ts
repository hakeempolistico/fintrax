import type { Media } from '@/payload-types'

export type ClientStatus = 'active' | 'prospect' | 'inactive'

export type ClientRecord = {
  id: string
  member: string | { id: string }
  name: string
  logo?: string | Media | null
  contactName?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  status: ClientStatus
  notes?: string | null
  createdAt: string
  updatedAt: string
}
