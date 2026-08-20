'use client'

import { useState } from 'react'
import Label from '../../../../../components/form/Label'
import Input from '../../../../../components/form/input/InputField'
import Button from '../../../../../components/ui/button/Button'
import Select from '@/components/form/Select'
import { Loan } from '@/payload-types'

type LoanFormProps = {
  closeModal?: () => void
  handleSave?: (data: any) => Promise<boolean | void> | boolean | void
  mode?: 'create' | 'edit'
  initialData?: Partial<Loan>
}

const toDateInputValue = (value?: string | null) => (value ? value.slice(0, 10) : '')

const LoanForm = ({ closeModal, handleSave, mode = 'create', initialData }: LoanFormProps) => {
  const [data, setData] = useState<any>(() =>
    mode === 'edit'
      ? {
          name: initialData?.name ?? '',
          lender: initialData?.lender ?? '',
          loanType: initialData?.loanType ?? '',
          accountNumber: initialData?.accountNumber ?? '',
          principalAmount: initialData?.principalAmount ?? '',
          outstandingBalance: initialData?.outstandingBalance ?? '',
          interestRate: initialData?.interestRate ?? '',
          interestType: initialData?.interestType ?? '',
          monthlyPayment: initialData?.monthlyPayment ?? '',
          paymentFrequency: initialData?.paymentFrequency ?? '',
          startDate: toDateInputValue(initialData?.startDate),
          endDate: toDateInputValue(initialData?.endDate),
          status: initialData?.status ?? 'active',
          notes: initialData?.notes ?? '',
        }
      : {},
  )

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const success = await handleSave?.(data)
    if (success) window.location.reload()
  }

  return (
    <form onSubmit={onSubmitHandler}>
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
        {mode === 'edit' ? 'Edit Loan' : 'Create Loan'}
      </h4>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input defaultValue={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} type="text" placeholder="Personal Loan" name="name" />
        </div>
        <div>
          <Label>Lender</Label>
          <Input defaultValue={data.lender} onChange={(e) => setData({ ...data, lender: e.target.value })} type="text" placeholder="Bank / Lender" name="lender" />
        </div>
        <div>
          <Label>Loan Type</Label>
          <Select
            key={`loan-type-${initialData?.id ?? 'new'}`}
            defaultValue={data.loanType}
            options={[
              { value: 'personal', label: 'Personal Loan' },
              { value: 'home', label: 'Home Loan' },
              { value: 'car', label: 'Car Loan' },
              { value: 'education', label: 'Education Loan' },
              { value: 'business', label: 'Business Loan' },
              { value: 'credit-card', label: 'Credit Card' },
              { value: 'other', label: 'Other' },
            ]}
            placeholder="Select loan type"
            onChange={(value) => setData({ ...data, loanType: value })}
          />
        </div>
        <div>
          <Label>Account Number</Label>
          <Input defaultValue={data.accountNumber} onChange={(e) => setData({ ...data, accountNumber: e.target.value })} type="text" placeholder="1234 1234 1234 1234" name="accountNumber" />
        </div>
        <div>
          <Label>Principal Amount</Label>
          <Input defaultValue={data.principalAmount} onChange={(e) => setData({ ...data, principalAmount: e.target.value })} type="number" placeholder="0.00" name="principalAmount" min="0" step={0.01} />
        </div>
        <div>
          <Label>Outstanding Balance</Label>
          <Input defaultValue={data.outstandingBalance} onChange={(e) => setData({ ...data, outstandingBalance: e.target.value })} type="number" placeholder="0.00" name="outstandingBalance" min="0" step={0.01} />
        </div>
        <div>
          <Label>Interest Rate (%)</Label>
          <Input defaultValue={data.interestRate} onChange={(e) => setData({ ...data, interestRate: e.target.value })} type="number" placeholder="5.5" name="interestRate" min="0" step={0.01} />
        </div>
        <div>
          <Label>Interest Type</Label>
          <Select
            key={`interest-type-${initialData?.id ?? 'new'}`}
            defaultValue={data.interestType}
            options={[{ value: 'fixed', label: 'Fixed' }, { value: 'variable', label: 'Variable' }]}
            placeholder="Select interest type"
            onChange={(value) => setData({ ...data, interestType: value })}
          />
        </div>
        <div>
          <Label>Monthly Payment</Label>
          <Input defaultValue={data.monthlyPayment} onChange={(e) => setData({ ...data, monthlyPayment: e.target.value })} type="number" placeholder="0.00" name="monthlyPayment" min="0" step={0.01} />
        </div>
        <div>
          <Label>Payment Frequency</Label>
          <Select
            key={`payment-frequency-${initialData?.id ?? 'new'}`}
            defaultValue={data.paymentFrequency}
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'bi-weekly', label: 'Bi-weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
            placeholder="Select frequency"
            onChange={(value) => setData({ ...data, paymentFrequency: value })}
          />
        </div>
        <div>
          <Label>Start Date</Label>
          <Input defaultValue={data.startDate} type="date" name="startDate" onChange={(e) => setData({ ...data, startDate: e.target.value })} />
        </div>
        <div>
          <Label>End Date</Label>
          <Input defaultValue={data.endDate} type="date" name="endDate" onChange={(e) => setData({ ...data, endDate: e.target.value })} />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            key={`loan-status-${initialData?.id ?? 'new'}`}
            defaultValue={data.status}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'paid-off', label: 'Paid Off' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'defaulted', label: 'Defaulted' },
            ]}
            placeholder="Select status"
            onChange={(value) => setData({ ...data, status: value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Notes</Label>
          <Input defaultValue={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} type="text" placeholder="Additional notes" name="notes" />
        </div>
      </div>

      <div className="mt-6 flex w-full items-center justify-end gap-3">
        <Button size="sm" variant="outline" type="button" onClick={closeModal}>Close</Button>
        <Button size="sm">{mode === 'edit' ? 'Save Changes' : 'Create'}</Button>
      </div>
    </form>
  )
}

export default LoanForm
