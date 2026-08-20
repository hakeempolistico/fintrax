'use client'

import { useState } from 'react'
import Label from '@/components/form/Label'
import Input from '@/components/form/input/InputField'
import Button from '@/components/ui/button/Button'
import Select from '@/components/form/Select'
import { Account, Bill, Loan, Transaction } from '@/payload-types'

type TransactionFormProps = {
  closeModal?: () => void
  handleSave?: (data: Partial<Transaction>) => Promise<boolean | void> | boolean | void
  bills?: Bill[]
  accounts?: Account[]
  loans?: Loan[]
  mode?: 'create' | 'edit'
  initialData?: Partial<Transaction>
}

const relationshipId = (value: string | { id: string } | null | undefined) =>
  typeof value === 'object' && value !== null ? value.id : value ?? undefined

const toDateInputValue = (value?: string | null) => (value ? value.slice(0, 10) : '')
const toMonthInputValue = (value?: string | null) => (value ? value.slice(0, 7) : '')

export default function TransactionForm({
  closeModal,
  handleSave,
  bills = [],
  accounts = [],
  loans = [],
  mode = 'create',
  initialData,
}: TransactionFormProps) {
  const [data, setData] = useState<Partial<Transaction>>(() => ({
    amount: initialData?.amount,
    date: toDateInputValue(initialData?.date),
    type: initialData?.type,
    source: initialData?.source,
    account: relationshipId(initialData?.account as any),
    bill: relationshipId(initialData?.bill as any),
    billPaymentFor: toMonthInputValue(initialData?.billPaymentFor),
    loan: relationshipId(initialData?.loan as any),
    category: initialData?.category,
    paymentMethod: initialData?.paymentMethod,
    reference: initialData?.reference ?? '',
    notes: initialData?.notes ?? '',
  }))
  const [isSaving, setIsSaving] = useState(false)

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const payload = {
        ...data,
        billPaymentFor:
          data.source === 'bill' && data.billPaymentFor
            ? `${String(data.billPaymentFor).slice(0, 7)}-01`
            : undefined,
      }
      const success = await handleSave?.(payload)
      if (success) window.location.reload()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmitHandler}>
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
        {mode === 'edit' ? 'Edit Transaction' : 'Create Transaction'}
      </h4>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div>
          <Label>Amount</Label>
          <Input
            defaultValue={data.amount ?? ''}
            onChange={(e) => setData({ ...data, amount: Number(e.target.value) })}
            type="number"
            placeholder="0.00"
            name="amount"
            min="0"
            step={0.01}
          />
        </div>

        <div>
          <Label>Transaction Date</Label>
          <Input
            defaultValue={String(data.date ?? '')}
            type="date"
            name="date"
            onChange={(e) => setData({ ...data, date: e.target.value })}
          />
        </div>

        <div>
          <Label>Type</Label>
          <Select
            key={`transaction-type-${initialData?.id ?? 'new'}`}
            defaultValue={data.type ?? ''}
            options={[
              { value: 'income', label: 'Income' },
              { value: 'payment', label: 'Payment' },
              { value: 'expense', label: 'Expense' },
              { value: 'transfer', label: 'Transfer' },
            ]}
            placeholder="Select transaction type"
            onChange={(value) => setData({ ...data, type: value as Transaction['type'] })}
          />
        </div>

        <div>
          <Label>Source</Label>
          <Select
            key={`transaction-source-${initialData?.id ?? 'new'}`}
            defaultValue={data.source ?? ''}
            options={[
              { value: 'account', label: 'Account' },
              { value: 'bill', label: 'Bill' },
              { value: 'loan', label: 'Loan' },
              { value: 'other', label: 'Other' },
            ]}
            placeholder="Select source"
            onChange={(value) =>
              setData({
                ...data,
                source: value as Transaction['source'],
                account: undefined,
                bill: undefined,
                billPaymentFor: undefined,
                loan: undefined,
              })
            }
          />
        </div>

        {data.source === 'account' && (
          <div>
            <Label>Account</Label>
            <Select
              key={`transaction-account-${initialData?.id ?? 'new'}`}
              defaultValue={relationshipId(data.account as any) ?? ''}
              options={accounts.map((account) => ({
                value: account.id,
                label: `${account.name} • ${account.accountNumber ?? 'No account number'}`,
              }))}
              placeholder="Select account"
              onChange={(value) => setData({ ...data, account: value })}
            />
          </div>
        )}

        {data.source === 'bill' && (
          <>
            <div>
              <Label>Bill</Label>
              <Select
                key={`transaction-bill-${initialData?.id ?? 'new'}`}
                defaultValue={relationshipId(data.bill as any) ?? ''}
                options={bills.map((bill) => ({ value: bill.id, label: bill.provider ?? 'Bill' }))}
                placeholder="Select bill"
                onChange={(value) => setData({ ...data, bill: value })}
              />
            </div>
            <div>
              <Label>Payment For</Label>
              <Input
                defaultValue={String(data.billPaymentFor ?? '')}
                type="month"
                name="billPaymentFor"
                onChange={(e) => setData({ ...data, billPaymentFor: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">Select the month this payment is for.</p>
            </div>
          </>
        )}

        {data.source === 'loan' && (
          <div>
            <Label>Loan</Label>
            <Select
              key={`transaction-loan-${initialData?.id ?? 'new'}`}
              defaultValue={relationshipId(data.loan as any) ?? ''}
              options={loans.map((loan) => ({ value: loan.id, label: loan.name }))}
              placeholder="Select loan"
              onChange={(value) => setData({ ...data, loan: value })}
            />
          </div>
        )}

        <div>
          <Label>Category</Label>
          <Select
            key={`transaction-category-${initialData?.id ?? 'new'}`}
            defaultValue={data.category ?? ''}
            options={[
              { value: 'salary', label: 'Salary' },
              { value: 'food', label: 'Food' },
              { value: 'transportation', label: 'Transportation' },
              { value: 'shopping', label: 'Shopping' },
              { value: 'utilities', label: 'Utilities' },
              { value: 'rent', label: 'Rent' },
              { value: 'insurance', label: 'Insurance' },
              { value: 'loan-payment', label: 'Loan Payment' },
              { value: 'bill-payment', label: 'Bill Payment' },
              { value: 'entertainment', label: 'Entertainment' },
              { value: 'healthcare', label: 'Healthcare' },
              { value: 'education', label: 'Education' },
              { value: 'travel', label: 'Travel' },
              { value: 'other', label: 'Other' },
            ]}
            placeholder="Select category"
            onChange={(value) => setData({ ...data, category: value as Transaction['category'] })}
          />
        </div>

        <div>
          <Label>Payment Method</Label>
          <Select
            key={`payment-method-${initialData?.id ?? 'new'}`}
            defaultValue={data.paymentMethod ?? ''}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'bank-transfer', label: 'Bank Transfer' },
              { value: 'credit-card', label: 'Credit Card' },
              { value: 'debit-card', label: 'Debit Card' },
              { value: 'direct-debit', label: 'Direct Debit' },
              { value: 'other', label: 'Other' },
            ]}
            placeholder="Select payment method"
            onChange={(value) =>
              setData({ ...data, paymentMethod: value as Transaction['paymentMethod'] })
            }
          />
        </div>

        <div>
          <Label>Reference</Label>
          <Input
            defaultValue={data.reference ?? ''}
            onChange={(e) => setData({ ...data, reference: e.target.value })}
            type="text"
            placeholder="Receipt or confirmation number"
            name="reference"
          />
        </div>

        <div className="sm:col-span-2">
          <Label>Notes</Label>
          <Input
            defaultValue={data.notes ?? ''}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            type="text"
            placeholder="Additional notes"
            name="notes"
          />
        </div>
      </div>

      <div className="mt-6 flex w-full items-center justify-end gap-3">
        <Button size="sm" variant="outline" type="button" onClick={closeModal}>Close</Button>
        <Button size="sm" disabled={isSaving}>
          {isSaving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
