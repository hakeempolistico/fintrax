import config from '@/payload.config'
import { getMe } from '@/services/app.service'
import type { MaterialRecord } from '@/types/material'
import { getPayload } from 'payload'

export const getMyMaterials = async (): Promise<MaterialRecord[]> => {
  const me = await getMe()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'materials' as any,
    depth: 1,
    pagination: false,
    sort: '-createdAt',
    where: { member: { equals: me.id } },
  })

  return result.docs as unknown as MaterialRecord[]
}
