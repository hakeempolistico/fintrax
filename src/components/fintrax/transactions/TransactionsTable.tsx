'use client'

import FtTable, { FtColumn, FtRow } from '@/components/fintrax/table/FtTable'
import TransactionForm from '@/components/fintrax/transactions/TransactionForm'
import { Account, Bill, Loan, Transaction } from '@/payload-types'
import { PaginatedDocs } from 'payload'

type TransactionsTableProps = {
  columns: FtColumn[]
  rows: FtRow[]
  transactions: Transaction[]
  accounts: Account[]
  bills: Bill[]
  loans: Loan[]
  pagination?: Omit<PaginatedDocs<unknown>, 'docs'>
}

export default function TransactionsTable({
  columns,
  rows,
  transactions,
  accounts,
  bills,
  loans,
  pagination,
}: TransactionsTableProps) {
  const saveTransaction = async (transaction: Transaction, data: Partial<Transaction>) => {
    const response = await fetch(`/api/transactions/${transaction.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    if (!response.ok) {
      alert(result?.errors?.[0]?.message ?? 'Unable to update transaction.')
      return false
    }

    return true
  }

  return (
    <FtTable<Transaction>
      columns={columns}
      rows={rows}
      pagination={pagination}
      edit={{
        records: transactions,
        getRecordId: (transaction) => transaction.id,
        renderForm: (transaction, closeModal) => (
          <TransactionForm
            mode="edit"
            initialData={transaction}
            closeModal={closeModal}
            accounts={accounts}
            bills={bills}
            loans={loans}
            handleSave={(data) => saveTransaction(transaction, data)}
          />
        ),
      }}
    />
  )
}
