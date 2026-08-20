'use client'

import { useState } from 'react'
import Label from '@/components/form/Label'
import Input from '@/components/form/input/InputField'
import Button from '@/components/ui/button/Button'
import Select from '@/components/form/Select'
import { Account, Bill, Loan } from '@/payload-types'

type TransactionFormProps = {
  closeModal?: () => void
  handleSave?: (data: any) => void
  bills?: Bill[]
  accounts?: Account[]
  loans?: Loan[]
}

const TransactionForm = ({
  closeModal,
  handleSave,
  bills = [],
  accounts = [],
  loans = [],
}: TransactionFormProps) => {
  console.log({ bills, accounts, loans })
  const [data, setData] = useState<any>({})

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const success = await handleSave?.(data)

    if (success) {
      window.location.reload()
    }
  }

  return (
    <form onSubmit={onSubmitHandler}>
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
        Create Transaction
      </h4>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {/* Amount */}
        <div>
          <Label>Amount</Label>
          <Input
            onChange={(e) =>
              setData({
                ...data,
                amount: e.target.value,
              })
            }
            type="number"
            placeholder="0.00"
            name="amount"
          />
        </div>

        {/* Transaction Date */}
        <div>
          <Label>Transaction Date</Label>
          <Input
            type="date"
            name="date"
            onChange={(e) =>
              setData({
                ...data,
                date: e.target.value,
              })
            }
          />
        </div>

        {/* Type */}
        <div>
          <Label>Type</Label>
          <Select
            key="transaction-type"
            options={[
              {
                value: 'income',
                label: 'Income',
              },
              {
                value: 'payment',
                label: 'Payment',
              },
              {
                value: 'expense',
                label: 'Expense',
              },
              {
                value: 'transfer',
                label: 'Transfer',
              },
            ]}
            placeholder="Select transaction type"
            onChange={(value) => {
              setData({
                ...data,
                type: value,
              })
            }}
          />
        </div>

        {/* Source */}
        <div>
          <Label>Source</Label>
          <Select
            key="transaction-source"
            options={[
              {
                value: 'account',
                label: 'Account',
              },
              {
                value: 'bill',
                label: 'Bill',
              },
              {
                value: 'loan',
                label: 'Loan',
              },
              {
                value: 'other',
                label: 'Other',
              },
            ]}
            placeholder="Select source"
            onChange={(value) => {
              setData({
                ...data,
                source: value,
                account: undefined,
                bill: undefined,
                loan: undefined,
              })
            }}
          />
        </div>
        {/* Account */}
        {data.source === 'account' && (
          <div>
            <Label>Account</Label>
            <Select
              key="transaction-account"
              options={accounts.map((account) => ({
                value: account.id,
                label: `${account.accountNumber}`,
              }))}
              placeholder="Select account"
              onChange={(value) => {
                setData({
                  ...data,
                  account: value,
                })
              }}
            />
          </div>
        )}

        {/* Bill */}
        {data.source === 'bill' && (
          <div>
            <Label>Bill</Label>
            <Select
              key="transaction-bill"
              options={bills.map((bill) => ({
                value: bill.id,
                label: `${bill.provider}`,
              }))}
              placeholder="Select bill"
              onChange={(value) => {
                setData({
                  ...data,
                  bill: value,
                })
              }}
            />
          </div>
        )}
        {data.source === 'bill' && (
          <div>
            <Label>Payment For</Label>
            <Input
              type="month"
              name="billPaymentFor"
              onChange={(e) =>
                setData({
                  ...data,
                  billPaymentFor: e.target.value ? `${e.target.value}-01` : undefined,
                })
              }
            />
            <p className="mt-1 text-xs text-gray-500">Select the month this payment is for.</p>
          </div>
        )}

        {/* Loan */}
        {data.source === 'loan' && (
          <div>
            <Label>Loan</Label>
            <Select
              key="transaction-loan"
              options={loans.map((loan) => ({
                value: loan.id,
                label: `${loan.name}`,
              }))}
              placeholder="Select loan"
              onChange={(value) => {
                setData({
                  ...data,
                  loan: value,
                })
              }}
            />
          </div>
        )}

        {/* Category */}
        <div>
          <Label>Category</Label>
          <Select
            key="transaction-category"
            options={[
              {
                value: 'salary',
                label: 'Salary',
              },
              {
                value: 'food',
                label: 'Food',
              },
              {
                value: 'transportation',
                label: 'Transportation',
              },
              {
                value: 'shopping',
                label: 'Shopping',
              },
              {
                value: 'utilities',
                label: 'Utilities',
              },
              {
                value: 'rent',
                label: 'Rent',
              },
              {
                value: 'insurance',
                label: 'Insurance',
              },
              {
                value: 'loan-payment',
                label: 'Loan Payment',
              },
              {
                value: 'bill-payment',
                label: 'Bill Payment',
              },
              {
                value: 'entertainment',
                label: 'Entertainment',
              },
              {
                value: 'healthcare',
                label: 'Healthcare',
              },
              {
                value: 'education',
                label: 'Education',
              },
              {
                value: 'travel',
                label: 'Travel',
              },
              {
                value: 'other',
                label: 'Other',
              },
            ]}
            placeholder="Select category"
            onChange={(value) => {
              setData({
                ...data,
                category: value,
              })
            }}
          />
        </div>

        {/* Payment Method */}
        <div>
          <Label>Payment Method</Label>
          <Select
            key="payment-method"
            options={[
              {
                value: 'cash',
                label: 'Cash',
              },
              {
                value: 'bank-transfer',
                label: 'Bank Transfer',
              },
              {
                value: 'credit-card',
                label: 'Credit Card',
              },
              {
                value: 'debit-card',
                label: 'Debit Card',
              },
              {
                value: 'direct-debit',
                label: 'Direct Debit',
              },
              {
                value: 'other',
                label: 'Other',
              },
            ]}
            placeholder="Select payment method"
            onChange={(value) => {
              setData({
                ...data,
                paymentMethod: value,
              })
            }}
          />
        </div>

        {/* Reference */}
        <div>
          <Label>Reference</Label>
          <Input
            onChange={(e) =>
              setData({
                ...data,
                reference: e.target.value,
              })
            }
            type="text"
            placeholder="Receipt or confirmation number"
            name="reference"
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <Label>Notes</Label>
          <Input
            onChange={(e) =>
              setData({
                ...data,
                notes: e.target.value,
              })
            }
            type="text"
            placeholder="Additional notes"
            name="notes"
          />
        </div>
      </div>

      <div className="mt-6 flex w-full items-center justify-end gap-3">
        <Button size="sm" variant="outline" onClick={closeModal}>
          Close
        </Button>

        <Button size="sm">Create</Button>
      </div>
    </form>
  )
}

export default TransactionForm
