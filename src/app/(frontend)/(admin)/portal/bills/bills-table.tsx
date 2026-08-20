'use client'

import FtTable, { FtColumn, FtRow } from '@/app/(frontend)/components/ft-table/ft-table'
import { Bill } from '@/payload-types'
import { PaginatedDocs } from 'payload'
import BillForm from './bill-form'

type BillsTableProps = {
  columns: FtColumn[]
  rows: FtRow[]
  bills: Bill[]
  pagination?: Omit<PaginatedDocs<unknown>, 'docs'>
}

export default function BillsTable({ columns, rows, bills, pagination }: BillsTableProps) {
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

  return (
    <FtTable<Bill>
      columns={columns}
      rows={rows}
      pagination={pagination}
      edit={{
        records: bills,
        getRecordId: (bill) => bill.id,
        renderForm: (bill, closeModal) => (
          <BillForm
            mode="edit"
            initialData={bill}
            closeModal={closeModal}
            handleSave={(data) => saveBill(bill, data)}
          />
        ),
      }}
    />
  )
}
