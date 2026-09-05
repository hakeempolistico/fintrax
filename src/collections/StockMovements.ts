import { memberOwnedAccess } from '@/access/memberOwnership'
import type { CollectionConfig } from 'payload'

export const StockMovements: CollectionConfig = {
  slug: 'stock-movements',
  admin: { useAsTitle: 'reference', group: 'Business Finance' },
  access: {
    create: () => false,
    read: memberOwnedAccess,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'member', type: 'relationship', relationTo: 'members', required: true, index: true },
    { name: 'material', type: 'relationship', relationTo: 'materials', required: true, index: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Purchase', value: 'purchase' },
        { label: 'Production Usage', value: 'production' },
        { label: 'Adjustment', value: 'adjustment' },
        { label: 'Waste', value: 'waste' },
        { label: 'Return', value: 'return' },
      ],
    },
    { name: 'quantityBase', label: 'Quantity (Base Unit)', type: 'number', required: true },
    { name: 'unitCostBase', label: 'Unit Cost (Base Unit)', type: 'number', required: true, min: 0 },
    { name: 'totalCost', type: 'number', required: true, min: 0 },
    { name: 'purchase', type: 'relationship', relationTo: 'purchases' },
    { name: 'occurredAt', type: 'date', required: true },
    { name: 'reference', type: 'text' },
  ],
}
