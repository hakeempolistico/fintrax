'use client'

import { useMemo, useState } from 'react'
import type { Member } from '@/payload-types'
import type { MaterialRecord } from '@/types/material'
import type { PurchaseRecord } from '@/types/purchase'
import { Modal } from '@/components/ui/modal'
import Button from '@/components/ui/button/Button'
import StockInForm from './StockInForm'
import { PackagePlus, Plus, Search } from 'lucide-react'

type Props = { me: Member; materials: MaterialRecord[]; purchases: PurchaseRecord[] }

const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
const date = (value: string) => new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))

export default function PurchasesManager({ me, materials, purchases }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return purchases.filter((purchase) => [purchase.supplier, purchase.reference].filter(Boolean).join(' ').toLowerCase().includes(normalized))
  }, [purchases, query])

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Purchase / Stock-In History</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Recorded purchases automatically add material stock.</p></div>
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Record Stock-In</Button>
        </div>
        <div className="border-b border-gray-100 p-4 dark:border-gray-800"><div className="relative max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search supplier or reference..." className="h-10 w-full rounded-lg border border-gray-300 bg-transparent pl-9 pr-3 text-sm dark:border-gray-700" /></div></div>
        {filtered.length ? (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500 dark:bg-white/[0.02]"><tr><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium">Supplier</th><th className="px-5 py-3 font-medium">Reference</th><th className="px-5 py-3 font-medium">Items</th><th className="px-5 py-3 text-right font-medium">Total</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{filtered.map((purchase) => <tr key={purchase.id} className="text-sm text-gray-700 dark:text-gray-300"><td className="px-5 py-4">{date(purchase.purchaseDate)}</td><td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{purchase.supplier || '—'}</td><td className="px-5 py-4">{purchase.reference || '—'}</td><td className="px-5 py-4">{purchase.items.length} material{purchase.items.length === 1 ? '' : 's'}</td><td className="px-5 py-4 text-right font-semibold text-gray-900 dark:text-white">{money(purchase.totalAmount)}</td></tr>)}</tbody></table></div>
        ) : <div className="px-5 py-14 text-center"><PackagePlus className="mx-auto h-9 w-9 text-gray-300" /><p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">No stock-in records found</p><p className="mt-1 text-sm text-gray-500">Record a material purchase to increase inventory.</p></div>}
      </div>
      <Modal isOpen={open} onClose={() => setOpen(false)} className="max-h-[calc(100vh-2rem)] max-w-[860px] overflow-y-auto p-5 lg:p-8"><StockInForm me={me} materials={materials} closeModal={() => setOpen(false)} /></Modal>
    </>
  )
}
