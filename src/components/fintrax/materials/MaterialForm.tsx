'use client'

import { useEffect, useState } from 'react'
import type { Member } from '@/payload-types'
import type { MaterialBaseUnit, MaterialPurchaseUnit, MaterialRecord, MaterialStatus } from '@/types/material'
import Label from '@/components/form/Label'
import Input from '@/components/form/input/InputField'
import Select from '@/components/form/Select'
import Button from '@/components/ui/button/Button'

const baseUnitOptions = [
  { value: 'pc', label: 'Piece (pc)' },
  { value: 'mg', label: 'Milligram (mg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'l', label: 'Liter (L)' },
  { value: 'mm', label: 'Millimeter (mm)' },
  { value: 'cm', label: 'Centimeter (cm)' },
  { value: 'm', label: 'Meter (m)' },
]

const purchaseUnitOptions = [
  { value: 'piece', label: 'Piece' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'pack', label: 'Pack' },
  { value: 'box', label: 'Box' },
  { value: 'bag', label: 'Bag' },
  { value: 'sack', label: 'Sack' },
  { value: 'roll', label: 'Roll' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'can', label: 'Can' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'l', label: 'Liter' },
  { value: 'm', label: 'Meter' },
]

const getInitialData = (material?: MaterialRecord) => ({
  name: material?.name ?? '',
  code: material?.code ?? '',
  category: material?.category ?? '',
  description: material?.description ?? '',
  baseUnit: material?.baseUnit ?? ('pc' as MaterialBaseUnit),
  costPerBaseUnit: material?.costPerBaseUnit ?? 0,
  openingQuantity: material?.openingQuantity ?? 0,
  reorderLevel: material?.reorderLevel ?? 0,
  purchaseUnit: material?.purchaseUnit ?? ('' as MaterialPurchaseUnit | ''),
  purchaseUnitSize: material?.purchaseUnitSize ?? 0,
  status: material?.status ?? ('active' as MaterialStatus),
})

type Props = {
  me: Member
  material?: MaterialRecord
  closeModal?: () => void
}

export default function MaterialForm({ me, material, closeModal }: Props) {
  const [data, setData] = useState(() => getInitialData(material))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setData(getInitialData(material))
    setImageFile(null)
  }, [material])

  const uploadImage = async () => {
    if (!imageFile) return undefined
    const formData = new FormData()
    formData.append('file', imageFile)
    formData.append('_payload', JSON.stringify({ alt: `${data.name || 'Material'} image` }))
    const response = await fetch('/api/media', { method: 'POST', body: formData })
    const result = await response.json()
    if (!response.ok) throw new Error(result?.errors?.[0]?.message ?? 'Unable to upload material image.')
    return result?.doc?.id ?? result?.id
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!data.name.trim()) return alert('Material name is required.')
    if (!data.baseUnit) return alert('Base unit is required.')

    setSaving(true)
    try {
      const image = await uploadImage()
      const endpoint = material ? `/api/materials/${material.id}` : '/api/materials'
      const payload = {
        ...data,
        name: data.name.trim(),
        member: me.id,
        purchaseUnit: data.purchaseUnit || null,
        purchaseUnitSize: data.purchaseUnit ? Number(data.purchaseUnitSize || 0) : null,
        ...(image ? { image } : {}),
      }
      const response = await fetch(endpoint, {
        method: material ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.errors?.[0]?.message ?? 'Unable to save material.')
      closeModal?.()
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save material.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">{material ? 'Edit Material' : 'Add Material'}</h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Set the base unit and opening stock now; Purchases / Stock-In will build on these later.</p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><Label>Material Name</Label><Input defaultValue={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} type="text" placeholder="Flour" name="name" /></div>
        <div><Label>Material Code / SKU</Label><Input defaultValue={data.code} onChange={(e) => setData({ ...data, code: e.target.value })} type="text" placeholder="MAT-001" name="code" /></div>
        <div><Label>Category</Label><Input defaultValue={data.category} onChange={(e) => setData({ ...data, category: e.target.value })} type="text" placeholder="Ingredients" name="category" /></div>
        <div><Label>Base Unit</Label><Select options={baseUnitOptions} defaultValue={data.baseUnit} onChange={(value) => setData({ ...data, baseUnit: value as MaterialBaseUnit })} /></div>
        <div><Label>Cost per Base Unit</Label><Input defaultValue={data.costPerBaseUnit} onChange={(e) => setData({ ...data, costPerBaseUnit: Number(e.target.value) })} type="number" placeholder="0.00" name="costPerBaseUnit" /></div>
        <div><Label>Opening Quantity</Label><Input defaultValue={data.openingQuantity} onChange={(e) => setData({ ...data, openingQuantity: Number(e.target.value) })} type="number" placeholder="0" name="openingQuantity" /></div>
        <div><Label>Reorder Level</Label><Input defaultValue={data.reorderLevel ?? 0} onChange={(e) => setData({ ...data, reorderLevel: Number(e.target.value) })} type="number" placeholder="0" name="reorderLevel" /></div>
        <div><Label>Default Purchase Unit</Label><Select options={purchaseUnitOptions} defaultValue={data.purchaseUnit} allowEmpty emptyLabel="None" onChange={(value) => setData({ ...data, purchaseUnit: value as MaterialPurchaseUnit | '' })} /></div>
        <div><Label>Base Units per Purchase Unit</Label><Input defaultValue={data.purchaseUnitSize ?? 0} onChange={(e) => setData({ ...data, purchaseUnitSize: Number(e.target.value) })} type="number" placeholder="25" name="purchaseUnitSize" /></div>
        <div><Label>Status</Label><Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} defaultValue={data.status} onChange={(value) => setData({ ...data, status: value as MaterialStatus })} /></div>
        <div className="sm:col-span-2"><Label>Material Image <span className="font-normal text-gray-400">(optional)</span></Label><input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className="block w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:border-gray-700 dark:text-gray-300 dark:file:bg-white/[0.06] dark:file:text-gray-200" /></div>
        <div className="sm:col-span-2"><Label>Description</Label><textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={3} placeholder="Optional material description" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90" /></div>
      </div>

      {data.purchaseUnit && <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/[0.06] dark:text-blue-300">Future Stock-In conversion: 1 {data.purchaseUnit} = {data.purchaseUnitSize || 0} {data.baseUnit}.</div>}

      <div className="mt-6 flex justify-end gap-3">
        <Button size="sm" variant="outline" type="button" onClick={closeModal} disabled={saving}>Cancel</Button>
        <Button size="sm" type="submit" disabled={saving}>{saving ? 'Saving...' : material ? 'Save Changes' : 'Add Material'}</Button>
      </div>
    </form>
  )
}
