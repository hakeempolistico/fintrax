'use client'

import { useState } from 'react'
import Label from '@/components/form/Label'
import Input from '@/components/form/input/InputField'
import Button from '@/components/ui/button/Button'
import Select from '@/components/form/Select'
import { Account, Bill, Loan, Transaction } from '@/payload-types'

type TransactionWithDestination = Partial<Transaction> & {
  destinationAccount?: string | Account | null
}

type TransactionFormProps = {
  closeModal?: () => void
  handleSave?: (data: TransactionWithDestination) => Promise<boolean | void> | boolean | void
  bills?: Bill[]
  accounts?: Account[]
  loans?: Loan[]
  mode?: 'create' | 'edit'
  initialData?: TransactionWithDestination
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
  const defaultAccount = accounts.find((account) => (account as Account & { isDefault?: boolean }).isDefault)

  const [data, setData] = useState<TransactionWithDestination>(() => ({
    amount: initialData?.amount,
    date: toDateInputValue(initialData?.date),
    type: initialData?.type,
    source: initialData?.source,
    account: relationshipId(initialData?.account as any),
    destinationAccount: relationshipId(initialData?.destinationAccount as any),
    bill: relationshipId(initialData?.bill as any),
    billPaymentFor: toMonthInputValue(initialData?.billPaymentFor),
    loan: relationshipId(initialData?.loan as any),
    category: initialData?.category,
    paymentMethod: initialData?.paymentMethod,
    reference: initialData?.reference ?? '',
    notes: initialData?.notes ?? '',
  }))
  const [isSaving, setIsSaving] = useState(false)

  const requiresFundingAccount = data.type === 'expense' || data.type === 'payment'

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (requiresFundingAccount && !relationshipId(data.account as any)) {
      alert('Please select the account used for this transaction.')
      return
    }

    if (data.type === 'transfer') {
      const fromAccount = relationshipId(data.account as any)
      const toAccount = relationshipId(data.destinationAccount as any)

      if (!fromAccount || !toAccount) {
        alert('Please select both the source and destination accounts.')
        return
      }

      if (fromAccount === toAccount) {
        alert('Source and destination accounts must be different.')
        return
      }
    }

    setIsSaving(true)
    try {
      const payload: TransactionWithDestination = {
        ...data,
        source: data.type === 'transfer' ? 'account' : data.source,
        category: data.type === 'transfer' ? undefined : data.category,
        paymentMethod: data.type === 'transfer' ? 'bank-transfer' : data.paymentMethod,
        bill: data.type === 'transfer' ? undefined : data.bill,
        loan: data.type === 'transfer' ? undefined : data.loan,
        billPaymentFor:
          data.type !== 'transfer' && data.source === 'bill' && data.billPaymentFor
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
            onChange={(value) => {
              const nextType = value as Transaction['type']
              const nextAccount =
                nextType === 'expense' || nextType === 'payment' || nextType === 'transfer'
                  ? relationshipId(data.account as any) ?? defaultAccount?.id
                  : data.account

              if (nextType === 'transfer') {
                setData({
                  ...data,
                  type: nextType,
                  source: 'account',
                  account: nextAccount,
                  destinationAccount: undefined,
                  bill: undefined,
                  billPaymentFor: undefined,
                  loan: undefined,
                  category: undefined,
                  paymentMethod: 'bank-transfer',
                })
                return
              }

              setData({ ...data, type: nextType, account: nextAccount, destinationAccount: undefined })
            }}
          />
        </div>

        {data.type !== 'transfer' && (
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
                  account:
                    requiresFundingAccount || value === 'account'
                      ? relationshipId(data.account as any) ?? defaultAccount?.id
                      : undefined,
                  bill: undefined,
                  billPaymentFor: undefined,
                  loan: undefined,
                })
              }
            />
          </div>
        )}

        {data.type === 'transfer' ? (
          <>
            <div>
              <Label>From Account</Label>
              <Select
                key={`transaction-from-account-${initialData?.id ?? 'new'}`}
                defaultValue={relationshipId(data.account as any) ?? defaultAccount?.id ?? ''}
                options={accounts.map((account) => ({
                  value: account.id,
                  label: `${account.name} • ${account.accountNumber ?? 'No account number'}`,
                }))}
                placeholder="Select source account"
                onChange={(value) => setData({ ...data, account: value })}
              />
            </div>
            <div>
              <Label>To Account</Label>
              <Select
                key={`transaction-destination-account-${initialData?.id ?? 'new'}`}
                defaultValue={relationshipId(data.destinationAccount as any) ?? ''}
                options={accounts
                  .filter((account) => account.id !== relationshipId(data.account as any))
                  .map((account) => ({
                    value: account.id,
                    label: `${account.name} • ${account.accountNumber ?? 'No account number'}`,
                  }))}
                placeholder="Select destination account"
                onChange={(value) => setData({ ...data, destinationAccount: value })}
              />
            </div>
            <div className="sm:col-span-2 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/[0.08] dark:text-blue-300">
              Transfers move money between your own accounts only. They change account balances but are excluded from income, expenses, spending categories, and monthly expense analytics.
            </div>
          </>
        ) : (
          <>
            {(requiresFundingAccount || data.source === 'account') && (
              <div>
                <Label>{requiresFundingAccount ? 'Account Used' : 'Account'}</Label>
                <Select
                  key={`transaction-account-${initialData?.id ?? 'new'}-${data.type ?? 'type'}`}
                  defaultValue={relationshipId(data.account as any) ?? defaultAccount?.id ?? ''}
                  options={accounts.map((account) => ({
                    value: account.id,
                    label: `${account.name} • ${account.accountNumber ?? 'No account number'}`,
                  }))}
                  placeholder={requiresFundingAccount ? 'Select account used' : 'Select account'}
                  onChange={(value) => setData({ ...data, account: value })}
                />
                {requiresFundingAccount && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This amount will be deducted from the selected account balance.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {data.type !== 'transfer' && data.source === 'bill' && (
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

        {data.type !== 'transfer' && data.source === 'loan' && (
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

        {data.type !== 'transfer' && (
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
        )}

        {data.type !== 'transfer' && (
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
        )}

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
