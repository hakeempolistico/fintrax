import type { MaterialRecord } from '@/types/material'

export type PurchaseItemRecord = {
  id?: string
  material: string | MaterialRecord
  purchaseQuantity: number
  purchaseUnitLabel: string
  baseUnitsPerPurchaseUnit: number
  baseQuantity: number
  unitPrice: number
  totalCost: number
}

export type PurchaseRecord = {
  id: string
  member: string | { id: string }
  purchaseDate: string
  supplier?: string | null
  reference?: string | null
  items: PurchaseItemRecord[]
  totalAmount: number
  notes?: string | null
  createdAt: string
  updatedAt: string
}
