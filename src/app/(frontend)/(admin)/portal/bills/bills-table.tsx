'use client'

import { useState } from 'react'
import FtTable, { FtColumn, FtRow } from '@/app/(frontend)/components/ft-table/ft-table'
import { Bill } from '@/payload-types'
import { PaginatedDocs } from 'payload'
import BillForm from './bill-form'
import { Modal } from '@/components/ui/modal'
import { Pencil } from 'lucide-react'

type BillsTableProps = {
  columns: FtColumn[]
  rows: FtRow[]
  bills: Bill[]
  pagination?: Omit<PaginatedDocs<unknown>, 'docs'>
}

const formatAmount = (value?: number | null) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value ?? 0)

const titleCase = (value?: string | null) =>
  value ? value.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '—'

export default function BillsTable({ columns, rows, bills, pagination }: BillsTableProps) {
  const [viewingBill, setViewingBill] = useState<Bill | null>(null)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)

  const saveBill = async (bill: Bill, data: Partial<Bill>) => {
    const editableData = {
      provider: data.provider,
      customerAccountNumber: data.customerAccountNumber,
      category: data.category,
      type: data.type,
      amount: data.amount,
      billingPeriodStart: data.billingPeriodStart,
      billingPeriodEnd: data.billingPeriodEnd,
      dueDate: data.dueDate,
    }

    const response = await fetch(`/api/bills/${bill.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editableData),
    })

    const result = await response.json()
    if (!response.ok) {
      alert(result?.errors?.[0]?.message ?? 'Failed to update bill.')
      return false
    }

    return true
  }

  const handleRowClick = (row: FtRow) => {
    const id = row.id?.value
    if (!id) return
    const bill = bills.find((item) => item.id === id)
    if (bill) setViewingBill(bill)
  }

  const openEditFromView = () => {
    if (!viewingBill) return
    setEditingBill(viewingBill)
    setViewingBill(null)
  }

  return (
    <>
      <FtTable<Bill>
        columns={columns}
        rows={rows}
        pagination={pagination}
        onRowClick={handleRowClick}
      />

      {viewingBill && (
        <Modal isOpen={true} onClose={() => setViewingBill(null)} className="max-h-[calc(100vh-2rem)] max-w-[680px] overflow-y-auto p-5 lg:p-8">
          <div className="space-y-6">
            <div className="pr-12">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Bill Details</p>
              <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{viewingBill.provider ?? 'Bill'}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{titleCase(viewingBill.category)} · {titleCase(viewingBill.type)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-400">Amount</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{viewingBill.type === 'variable' ? 'Variable' : formatAmount(viewingBill.amount)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-400">Due Day</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">Day {viewingBill.dueDate ?? '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-400">Customer Account Number</p>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{viewingBill.customerAccountNumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Billing Period</p>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">Day {viewingBill.billingPeriodStart ?? '—'} to Day {viewingBill.billingPeriodEnd ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Category</p>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{titleCase(viewingBill.category)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Bill Type</p>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{titleCase(viewingBill.type)}</p>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-5 dark:border-gray-800">
              <button
                type="button"
                onClick={openEditFromView}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
              >
                <Pencil className="h-4 w-4" />
                Edit Bill
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editingBill && (
        <Modal isOpen={true} onClose={() => setEditingBill(null)} className="max-w-[584px] p-5 lg:p-10">
          <BillForm
            mode="edit"
            initialData={editingBill}
            closeModal={() => setEditingBill(null)}
            handleSave={(data) => saveBill(editingBill, data)}
          />
        </Modal>
      )}
    </>
  )
}
