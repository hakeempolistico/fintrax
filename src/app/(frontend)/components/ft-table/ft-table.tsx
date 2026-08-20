'use client'
import { PaginatedDocs } from 'payload'
import FtPagination from './ft-pagination'
import { useRouter } from 'next/navigation'
import FtHeader from './ft-header'
import FtBody from './ft-body'
import { Modal } from '@/components/ui/modal'
import { Table } from '@/components/ui/table'
import { useState, type ReactNode } from 'react'

export type FtColumn = { key: string; value: string; width?: string }
export type FtRow = {
  [key: string]: {
    type: 'text' | 'two-row' | 'badge' | 'id' | 'icon-text'
    value: string
    subValue?: string
    style?: 'success' | 'warning' | 'error'
    icon?:
      | 'electricity'
      | 'water'
      | 'internet'
      | 'mobile'
      | 'telephone'
      | 'insurance'
      | 'credit-card'
      | 'loan'
      | 'government'
      | 'other'
      | 'personal'
      | 'home'
      | 'car'
      | 'education'
      | 'business'
      | 'income'
      | 'expense'
      | 'transfer'
      | 'payment'
      | 'rent'
  }
}

export type FtEditConfig<T> = {
  records: T[]
  getRecordId: (record: T) => string
  renderForm: (record: T, closeModal: () => void) => ReactNode
}

export type FtTableProps<T = unknown> = {
  columns: FtColumn[]
  rows: FtRow[]
  pagination?: Omit<PaginatedDocs<unknown>, 'docs'>
  edit?: FtEditConfig<T>
}

export default function FtTable<T>({ columns, rows, pagination, edit }: FtTableProps<T>) {
  const router = useRouter()
  const [editingRecord, setEditingRecord] = useState<T | null>(null)

  const handleEdit = (row: FtRow) => {
    if (!edit || !row.id?.value) return
    const record = edit.records.find((item) => edit.getRecordId(item) === row.id.value)
    if (record) setEditingRecord(record)
  }

  const closeEditModal = () => setEditingRecord(null)

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table className="table-auto">
            <FtHeader columns={columns} hasActions={Boolean(edit)} />
            <FtBody columns={columns} rows={rows} onEdit={edit ? handleEdit : undefined} />
          </Table>
        </div>
        {pagination && (
          <div className="flex justify-end p-3">
            <FtPagination
              currentPage={pagination?.page ?? 1}
              totalPages={pagination?.totalPages}
              onPageChange={(page) => router.push(`?page=${page}&limit=10`)}
            />
          </div>
        )}
      </div>

      {edit && editingRecord && (
        <Modal isOpen={true} onClose={closeEditModal} className="max-w-[584px] p-5 lg:p-10">
          {edit.renderForm(editingRecord, closeEditModal)}
        </Modal>
      )}
    </>
  )
}
