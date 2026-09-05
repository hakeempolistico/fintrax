'use client'

import { useMemo, useState } from 'react'
import type { Media, Member } from '@/payload-types'
import type { MaterialRecord, MaterialStatus } from '@/types/material'
import { Modal } from '@/components/ui/modal'
import Button from '@/components/ui/button/Button'
import MaterialForm from './MaterialForm'
import { PackageIcon, Pencil, Plus, Search, Trash2 } from 'lucide-react'

const unitLabels: Record<MaterialRecord['baseUnit'], string> = {
  pc: 'pc', mg: 'mg', g: 'g', kg: 'kg', ml: 'ml', l: 'L', mm: 'mm', cm: 'cm', m: 'm',
}

const getImageUrl = (image?: string | Media | null) => {
  if (!image || typeof image === 'string') return null
  return image.url ?? null
}

const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
const quantity = (value: number) => new Intl.NumberFormat('en-PH', { maximumFractionDigits: 3 }).format(value)

type Props = { me: Member; materials: MaterialRecord[] }

export default function MaterialsManager({ me, materials }: Props) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<MaterialRecord | null>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | MaterialStatus>('all')

  const filteredMaterials = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return materials.filter((material) => {
      const matchesStatus = status === 'all' || material.status === status
      const haystack = [material.name, material.code, material.category].filter(Boolean).join(' ').toLowerCase()
      return matchesStatus && (!normalized || haystack.includes(normalized))
    })
  }, [materials, query, status])

  const deleteMaterial = async (material: MaterialRecord) => {
    if (!window.confirm(`Delete ${material.name}? This cannot be undone.`)) return
    const response = await fetch(`/api/materials/${material.id}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) return alert(result?.errors?.[0]?.message ?? 'Unable to delete material.')
    window.location.reload()
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Materials</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Raw materials used to create your products.</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Add Material</Button>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-gray-800 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search materials..." className="h-10 w-full rounded-lg border border-gray-300 bg-transparent pl-9 pr-3 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'all' | MaterialStatus)} className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
          </select>
        </div>

        {filteredMaterials.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
                <tr><th className="px-5 py-3 font-medium">Material</th><th className="px-5 py-3 font-medium">Stock</th><th className="px-5 py-3 font-medium">Cost / Unit</th><th className="px-5 py-3 font-medium">Inventory Value</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredMaterials.map((material) => {
                  const imageUrl = getImageUrl(material.image)
                  const lowStock = (material.reorderLevel ?? 0) > 0 && material.openingQuantity <= (material.reorderLevel ?? 0)
                  return (
                    <tr key={material.id} className="text-sm text-gray-700 dark:text-gray-300">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-white/[0.04]">
                            {imageUrl ? <img src={imageUrl} alt={`${material.name} image`} className="h-full w-full object-cover" /> : <PackageIcon className="h-5 w-5 text-gray-400" />}
                          </div>
                          <div className="min-w-0"><p className="truncate font-medium text-gray-900 dark:text-white">{material.name}</p><p className="mt-0.5 truncate text-xs text-gray-500">{material.code || material.category || 'No code'}</p></div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><div className={lowStock ? 'font-semibold text-amber-600 dark:text-amber-400' : ''}>{quantity(material.openingQuantity)} {unitLabels[material.baseUnit]}</div>{lowStock && <div className="mt-0.5 text-xs">Low stock</div>}</td>
                      <td className="px-5 py-4">{money(material.costPerBaseUnit)} / {unitLabels[material.baseUnit]}</td>
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{money(material.openingQuantity * material.costPerBaseUnit)}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${material.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300'}`}>{material.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => setEditingMaterial(material)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-white/[0.05]" aria-label={`Edit ${material.name}`}><Pencil className="h-4 w-4" /></button><button onClick={() => deleteMaterial(material)} className="rounded-lg p-2 text-gray-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" aria-label={`Delete ${material.name}`}><Trash2 className="h-4 w-4" /></button></div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <div className="px-5 py-14 text-center"><PackageIcon className="mx-auto h-9 w-9 text-gray-300" /><p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">No materials found</p><p className="mt-1 text-sm text-gray-500">Add your first raw material to start building inventory.</p></div>}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} className="max-h-[calc(100vh-2rem)] max-w-[680px] overflow-y-auto p-5 lg:p-8"><MaterialForm me={me} closeModal={() => setCreateOpen(false)} /></Modal>
      <Modal isOpen={!!editingMaterial} onClose={() => setEditingMaterial(null)} className="max-h-[calc(100vh-2rem)] max-w-[680px] overflow-y-auto p-5 lg:p-8">{editingMaterial && <MaterialForm me={me} material={editingMaterial} closeModal={() => setEditingMaterial(null)} />}</Modal>
    </>
  )
}
