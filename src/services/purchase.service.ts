import config from '@/payload.config'
import { getMe } from '@/services/app.service'
import type { PurchaseRecord } from '@/types/purchase'
import { getPayload } from 'payload'

export const getMyPurchases = async (): Promise<PurchaseRecord[]> => {
  const me = await getMe()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'purchases' as any,
    depth: 1,
    pagination: false,
    sort: '-purchaseDate',
    where: { member: { equals: me.id } },
  })

  return result.docs as unknown as PurchaseRecord[]
}
