import type { Media } from '@/payload-types'

export type MaterialStatus = 'active' | 'inactive'
export type MaterialBaseUnit = 'pc' | 'mg' | 'g' | 'kg' | 'ml' | 'l' | 'mm' | 'cm' | 'm'
export type MaterialPurchaseUnit = 'piece' | 'dozen' | 'pack' | 'box' | 'bag' | 'sack' | 'roll' | 'bottle' | 'can' | 'kg' | 'l' | 'm'

export type MaterialRecord = {
  id: string
  member: string | { id: string }
  name: string
  code?: string | null
  category?: string | null
  image?: string | Media | null
  description?: string | null
  baseUnit: MaterialBaseUnit
  costPerBaseUnit: number
  openingQuantity: number
  reorderLevel?: number | null
  purchaseUnit?: MaterialPurchaseUnit | null
  purchaseUnitSize?: number | null
  status: MaterialStatus
  createdAt: string
  updatedAt: string
}
