'use client'

import { useState } from 'react'
import Label from '../../../../../components/form/Label'
import Input from '../../../../../components/form/input/InputField'
import Button from '../../../../../components/ui/button/Button'
import Select from '@/components/form/Select'

type LoanFormProps = {
  closeModal?: () => void
  handleSave?: (data: any) => void
}
const LoanForm = ({ closeModal, handleSave }: LoanFormProps) => {
  const [data, setData] = useState({})
  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const success = await handleSave?.(data)

    if (success) {
      window.location.reload()
    }
  }
  return (
    <form className="" onSubmit={onSubmitHandler}>
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">Create Loan</h4>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {/* Name */}
        <div>
          <Label>Name</Label>
          <Input
            onChange={(e) => setData({ ...data, name: e.target.value })}
            type="text"
            placeholder="Personal Loan"
            name="name"
          />
        </div>

        {/* Lender */}
        <div>
          <Label>Lender</Label>
          <Input
            onChange={(e) => setData({ ...data, lender: e.target.value })}
            type="text"
            placeholder="Bank / Lender"
            name="lender"
          />
        </div>

        {/* Loan Type */}
        <div>
          <Label>Loan Type</Label>
          <Select
            key="loan-type"
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
            onChange={(value) => {
              setData({ ...data, loanType: value })
            }}
          />
        </div>

        {/* Account Number */}
        <div>
          <Label>Account Number</Label>
          <Input
            onChange={(e) => setData({ ...data, accountNumber: e.target.value })}
            type="text"
            placeholder="1234 1234 1234 1234"
            name="accountNumber"
          />
        </div>

        {/* Principal Amount */}
        <div>
          <Label>Principal Amount</Label>
          <Input
            onChange={(e) => setData({ ...data, principalAmount: e.target.value })}
            type="number"
            placeholder="0.00"
            name="principalAmount"
          />
        </div>

        {/* Outstanding Amount */}
        <div>
          <Label>Outstanding Amount</Label>
          <Input
            onChange={(e) => setData({ ...data, outstandingAmount: e.target.value })}
            type="number"
            placeholder="0.00"
            name="outstandingAmount"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <Label>Interest Rate (%)</Label>
          <Input
            onChange={(e) => setData({ ...data, interestRate: e.target.value })}
            type="number"
            placeholder="5.5"
            name="interestRate"
          />
        </div>

        {/* Interest Type */}
        <div>
          <Label>Interest Type</Label>
          <Select
            key="interest-type"
            options={[
              { value: 'fixed', label: 'Fixed' },
              { value: 'variable', label: 'Variable' },
            ]}
            placeholder="Select interest type"
            onChange={(value) => {
              setData({ ...data, interestType: value })
            }}
          />
        </div>

        {/* Monthly Payment */}
        <div>
          <Label>Monthly Payment</Label>
          <Input
            onChange={(e) => setData({ ...data, monthlyPayment: e.target.value })}
            type="number"
            placeholder="0.00"
            name="monthlyPayment"
          />
        </div>

        {/* Payment Frequency */}
        <div>
          <Label>Payment Frequency</Label>
          <Select
            key="payment-frequency"
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'bi-weekly', label: 'Bi-weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
            placeholder="Select frequency"
            onChange={(value) => {
              setData({ ...data, paymentFrequency: value })
            }}
          />
        </div>

        {/* Start Date */}
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            name="startDate"
            onChange={(e) =>
              setData({
                ...data,
                startDate: e.target.value,
              })
            }
          />
        </div>

        {/* End Date */}
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            name="endDate"
            onChange={(e) =>
              setData({
                ...data,
                endDate: e.target.value,
              })
            }
          />
        </div>

        {/* Status */}
        <div>
          <Label>Status</Label>
          <Select
            key="loan-status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'paid-off', label: 'Paid Off' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'defaulted', label: 'Defaulted' },
            ]}
            placeholder="Select status"
            onChange={(value) => {
              setData({ ...data, status: value })
            }}
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <Label>Notes</Label>
          <Input
            onChange={(e) => setData({ ...data, notes: e.target.value })}
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

export default LoanForm
