import { authenticatedMemberOrAdmin, forceMemberOwnership, memberOwnedAccess } from '@/access/memberOwnership'
import type { CollectionBeforeDeleteHook, CollectionConfig } from 'payload'

const preventDeleteWithStockHistory: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const movements = await req.payload.find({
    collection: 'stock-movements' as any,
    limit: 1,
    overrideAccess: true,
    where: { material: { equals: id } },
  })
  if (movements.totalDocs > 0) {
    throw new Error('This material has stock history and cannot be deleted. Mark it inactive instead.')
  }
}

export const Materials: CollectionConfig = {
  slug: 'materials',
  admin: {
    useAsTitle: 'name',
    group: 'Business Finance',
  },
  access: {
    create: authenticatedMemberOrAdmin,
    read: memberOwnedAccess,
    update: memberOwnedAccess,
    delete: memberOwnedAccess,
  },
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      index: true,
    },
    { name: 'name', type: 'text', required: true },
    { name: 'code', label: 'Material Code / SKU', type: 'text' },
    { name: 'category', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media', required: false },
    { name: 'description', type: 'textarea' },
    {
      name: 'baseUnit',
      label: 'Base Unit',
      type: 'select',
      required: true,
      options: [
        { label: 'Piece (pc)', value: 'pc' },
        { label: 'Milligram (mg)', value: 'mg' },
        { label: 'Gram (g)', value: 'g' },
        { label: 'Kilogram (kg)', value: 'kg' },
        { label: 'Milliliter (ml)', value: 'ml' },
        { label: 'Liter (L)', value: 'l' },
        { label: 'Millimeter (mm)', value: 'mm' },
        { label: 'Centimeter (cm)', value: 'cm' },
        { label: 'Meter (m)', value: 'm' },
      ],
    },
    {
      name: 'costPerBaseUnit',
      label: 'Cost per Base Unit',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Current weighted-average unit cost. Stock-In purchases update this automatically.',
      },
    },
    {
      name: 'openingQuantity',
      label: 'Opening Quantity',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Starting stock balance. Current stock is calculated from this plus stock movements.',
      },
    },
    {
      name: 'reorderLevel',
      label: 'Reorder Level',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'purchaseUnit',
      label: 'Default Purchase Unit',
      type: 'select',
      options: [
        { label: 'Piece', value: 'piece' },
        { label: 'Dozen', value: 'dozen' },
        { label: 'Pack', value: 'pack' },
        { label: 'Box', value: 'box' },
        { label: 'Bag', value: 'bag' },
        { label: 'Sack', value: 'sack' },
        { label: 'Roll', value: 'roll' },
        { label: 'Bottle', value: 'bottle' },
        { label: 'Can', value: 'can' },
        { label: 'Kilogram', value: 'kg' },
        { label: 'Liter', value: 'l' },
        { label: 'Meter', value: 'm' },
      ],
      admin: {
        description: 'Used as the default unit when recording Purchases / Stock-In.',
      },
    },
    {
      name: 'purchaseUnitSize',
      label: 'Base Units per Purchase Unit',
      type: 'number',
      min: 0,
      admin: {
        description: 'Example: 1 sack = 25 kg, so enter 25 when the base unit is kg.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
  ],
  hooks: {
    beforeChange: [forceMemberOwnership],
    beforeDelete: [preventDeleteWithStockHistory],
  },
}
