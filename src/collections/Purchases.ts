import { authenticatedMemberOrAdmin, forceMemberOwnership, memberOwnedAccess } from '@/access/memberOwnership'
import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

const applyStockIn: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const memberId = typeof doc.member === 'string' ? doc.member : doc.member?.id
  for (const item of doc.items ?? []) {
    const materialId = typeof item.material === 'string' ? item.material : item.material?.id
    if (!materialId) continue

    const material = await req.payload.findByID({ collection: 'materials' as any, id: materialId, overrideAccess: true }) as any
    const movementResult = await req.payload.find({
      collection: 'stock-movements' as any,
      pagination: false,
      overrideAccess: true,
      where: { material: { equals: materialId } },
    })
    const movementQty = (movementResult.docs as any[]).reduce((sum, movement) => sum + Number(movement.quantityBase ?? 0), 0)
    const currentQty = Number(material.openingQuantity ?? 0) + movementQty
    const incomingQty = Number(item.baseQuantity ?? 0)
    const incomingCost = incomingQty > 0 ? Number(item.totalCost ?? 0) / incomingQty : 0
    const currentCost = Number(material.costPerBaseUnit ?? 0)
    const newQty = currentQty + incomingQty
    const weightedCost = newQty > 0 ? ((currentQty * currentCost) + (incomingQty * incomingCost)) / newQty : currentCost

    await req.payload.create({
      collection: 'stock-movements' as any,
      overrideAccess: true,
      data: {
        member: memberId,
        material: materialId,
        type: 'purchase',
        quantityBase: incomingQty,
        unitCostBase: incomingCost,
        totalCost: Number(item.totalCost ?? 0),
        purchase: doc.id,
        occurredAt: doc.purchaseDate,
        reference: doc.reference || null,
      },
    })

    await req.payload.update({
      collection: 'materials' as any,
      id: materialId,
      overrideAccess: true,
      data: { costPerBaseUnit: weightedCost },
    })
  }

  return doc
}

export const Purchases: CollectionConfig = {
  slug: 'purchases',
  admin: { useAsTitle: 'reference', group: 'Business Finance' },
  access: {
    create: authenticatedMemberOrAdmin,
    read: memberOwnedAccess,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'member', type: 'relationship', relationTo: 'members', required: true, index: true },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date', required: true },
    { name: 'supplier', type: 'text' },
    { name: 'reference', label: 'Reference / Receipt No.', type: 'text' },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'material', type: 'relationship', relationTo: 'materials', required: true },
        { name: 'purchaseQuantity', label: 'Purchase Quantity', type: 'number', required: true, min: 0.000001 },
        { name: 'purchaseUnitLabel', label: 'Purchase Unit', type: 'text', required: true },
        { name: 'baseUnitsPerPurchaseUnit', label: 'Base Units per Purchase Unit', type: 'number', required: true, min: 0.000001 },
        { name: 'baseQuantity', label: 'Base Quantity Added', type: 'number', required: true, min: 0.000001 },
        { name: 'unitPrice', label: 'Price per Purchase Unit', type: 'number', required: true, min: 0 },
        { name: 'totalCost', type: 'number', required: true, min: 0 },
      ],
    },
    { name: 'totalAmount', type: 'number', required: true, min: 0 },
    { name: 'notes', type: 'textarea' },
  ],
  hooks: {
    beforeChange: [forceMemberOwnership],
    afterChange: [applyStockIn],
  },
}
