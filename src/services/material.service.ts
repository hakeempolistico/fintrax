import config from '@/payload.config'
import { getMe } from '@/services/app.service'
import type { MaterialRecord } from '@/types/material'
import { getPayload } from 'payload'

export const getMyMaterials = async (): Promise<MaterialRecord[]> => {
  const me = await getMe()
  const payload = await getPayload({ config })
  const [materialsResult, movementsResult] = await Promise.all([
    payload.find({
      collection: 'materials' as any,
      depth: 1,
      pagination: false,
      sort: '-createdAt',
      where: { member: { equals: me.id } },
    }),
    payload.find({
      collection: 'stock-movements' as any,
      depth: 0,
      pagination: false,
      where: { member: { equals: me.id } },
    }),
  ])

  const movements = movementsResult.docs as any[]
  return (materialsResult.docs as unknown as MaterialRecord[]).map((material) => {
    const movementQty = movements.reduce((sum, movement) => {
      const materialId = typeof movement.material === 'string' ? movement.material : movement.material?.id
      return materialId === material.id ? sum + Number(movement.quantityBase ?? 0) : sum
    }, 0)
    return { ...material, currentQuantity: Number(material.openingQuantity ?? 0) + movementQty }
  })
}
