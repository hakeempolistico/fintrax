import config from '@/payload.config'
import { getMe } from '@/services/app.service'
import type { ClientRecord } from '@/types/client'
import { getPayload } from 'payload'

export const getMyClients = async (): Promise<ClientRecord[]> => {
  const me = await getMe()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'clients' as any,
    depth: 1,
    pagination: false,
    sort: '-createdAt',
    where: { member: { equals: me.id } },
  })

  return result.docs as unknown as ClientRecord[]
}
