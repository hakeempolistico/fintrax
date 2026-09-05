'use client'

import { useMemo, useState } from 'react'
import type { Member } from '@/payload-types'
import type { MaterialRecord } from '@/types/material'
import Button from '@/components/ui/button/Button'
import { Plus, Trash2 } from 'lucide-react'

type Line = {
  materialId: string
  purchaseQuantity: number
  unitPrice: number
}

type Props = {
  me: Member
  materials: MaterialRecord[]
  closeModal?: () => void
}

const emptyLine = (): Line => ({ materialId: '', purchaseQuantity: 1, unitPrice: 0 })

export default function StockInForm({ me, materials, closeModal }: Props) {
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [supplier, setSupplier] = useState('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<Line[]>([emptyLine()])
  const [saving, setSaving] = useState(false)

  const activeMaterials = materials.filter((material) => material.status === 'active')

  const resolvedLines = useMemo(() => lines.map((line) => {
    const material = materials.find((item) => item.id === line.materialId)
    const conversion = material?.purchaseUnit && (material.purchaseUnitSize ?? 0) > 0 ? Number(material.purchaseUnitSize) : 1
    const unitLabel = material?.purchaseUnit || material?.baseUnit || 'unit'
    const baseQuantity = Number(line.purchaseQuantity || 0) * conversion
    const totalCost = Number(line.purchaseQuantity || 0) * Number(line.unitPrice || 0)
    return { ...line, material, conversion, unitLabel, baseQuantity, totalCost }
  }), [lines, materials])

  const totalAmount = resolvedLines.reduce((sum, line) => sum + line.totalCost, 0)

  const updateLine = (index: number, patch: Partial<Line>) => {
    setLines((current) => current.map((line, i) => i === index ? { ...line, ...patch } : line))
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (resolvedLines.some((line) => !line.material || line.purchaseQuantity <= 0 || line.unitPrice < 0)) {
      return alert('Complete all stock-in items with a material, quantity, and valid price.')
    }

    setSaving(true)
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member: me.id,
          purchaseDate: new Date(`${purchaseDate}T00:00:00`).toISOString(),
          supplier: supplier.trim() || null,
          reference: reference.trim() || null,
          notes: notes.trim() || null,
          totalAmount,
          items: resolvedLines.map((line) => ({
            material: line.materialId,
            purchaseQuantity: line.purchaseQuantity,
            purchaseUnitLabel: line.unitLabel,
            baseUnitsPerPurchaseUnit: line.conversion,
            baseQuantity: line.baseQuantity,
            unitPrice: line.unitPrice,
            totalCost: line.totalCost,
          })),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.errors?.[0]?.message ?? 'Unable to record stock-in.')
      closeModal?.()
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to record stock-in.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Record Purchase / Stock-In</h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Each item creates a stock movement and updates weighted-average material cost.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="text-sm text-gray-700 dark:text-gray-300">Purchase Date<input type="date" required value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700" /></label>
        <label className="text-sm text-gray-700 dark:text-gray-300">Supplier<input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Optional" className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700" /></label>
        <label className="text-sm text-gray-700 dark:text-gray-300">Reference / Receipt<input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Optional" className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700" /></label>
      </div>

      <div className="mt-6 space-y-3">
        {resolvedLines.map((line, index) => (
          <div key={index} className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
            <label className="text-sm text-gray-700 dark:text-gray-300">Material<select required value={line.materialId} onChange={(e) => updateLine(index, { materialId: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"><option value="">Select material</option>{activeMaterials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}</select></label>
            <label className="text-sm text-gray-700 dark:text-gray-300">Qty ({line.unitLabel})<input type="number" min="0.000001" step="any" required value={line.purchaseQuantity} onChange={(e) => updateLine(index, { purchaseQuantity: Number(e.target.value) })} className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700" /></label>
            <label className="text-sm text-gray-700 dark:text-gray-300">Price / {line.unitLabel}<input type="number" min="0" step="any" required value={line.unitPrice} onChange={(e) => updateLine(index, { unitPrice: Number(e.target.value) })} className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700" /></label>
            <button type="button" onClick={() => setLines((current) => current.length === 1 ? current : current.filter((_, i) => i !== index))} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 dark:border-gray-700"><Trash2 className="h-4 w-4" /></button>
            {line.material && <p className="text-xs text-gray-500 sm:col-span-4">Adds {line.baseQuantity.toLocaleString('en-PH', { maximumFractionDigits: 3 })} {line.material.baseUnit} · Line total ₱{line.totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
          </div>
        ))}
      </div>

      <button type="button" onClick={() => setLines((current) => [...current, emptyLine()])} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand-600"><Plus className="h-4 w-4" />Add another material</button>

      <label className="mt-5 block text-sm text-gray-700 dark:text-gray-300">Notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700" /></label>

      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5 dark:border-gray-800">
        <div><p className="text-xs text-gray-500">Purchase total</p><p className="text-lg font-semibold text-gray-900 dark:text-white">₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
        <div className="flex gap-3"><Button size="sm" variant="outline" type="button" onClick={closeModal} disabled={saving}>Cancel</Button><Button size="sm" type="submit" disabled={saving}>{saving ? 'Recording...' : 'Record Stock-In'}</Button></div>
      </div>
    </form>
  )
}
