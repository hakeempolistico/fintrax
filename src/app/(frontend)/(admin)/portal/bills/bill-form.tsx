'use client'

import { useState } from 'react'
import Label from '../../../../../components/form/Label'
import Input from '../../../../../components/form/input/InputField'
import Button from '../../../../../components/ui/button/Button'
import Select from '@/components/form/Select'

type BillFormProps = {
  closeModal?: () => void
  handleSave?: (data: any) => void
}

const BillForm = ({ closeModal, handleSave }: BillFormProps) => {
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
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">Create Bill</h4>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {/* Provider */}
        <div>
          <Label>Provider</Label>
          <Input
            onChange={(e) => setData({ ...data, provider: e.target.value })}
            type="text"
            placeholder="e.g. Meralco"
            name="provider"
          />
        </div>

        {/* Customer Account Number */}
        <div>
          <Label>Customer Account Number</Label>
          <Input
            onChange={(e) =>
              setData({
                ...data,
                customerAccountNumber: e.target.value,
              })
            }
            type="text"
            placeholder="1234567890"
            name="customerAccountNumber"
          />
        </div>

        {/* Category */}
        <div>
          <Label>Category</Label>
          <Select
            key="bill-category"
            options={[
              { value: 'electricity', label: 'Electricity' },
              { value: 'water', label: 'Water' },
              { value: 'internet', label: 'Internet' },
              { value: 'mobile', label: 'Mobile' },
              { value: 'telephone', label: 'Telephone' },
              { value: 'insurance', label: 'Insurance' },
              { value: 'credit-card', label: 'Credit Card' },
              { value: 'loan', label: 'Loan' },
              { value: 'government', label: 'Government' },
              { value: 'other', label: 'Other' },
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

        {/* Type */}
        <div>
          <Label>Bill Type</Label>
          <Select
            key="bill-type"
            options={[
              { value: 'subscription', label: 'Subscription' },
              { value: 'variable', label: 'Variable' },
            ]}
            placeholder="Select bill type"
            onChange={(value) => {
              setData({
                ...data,
                type: value,
                ...(value === 'variable' ? { amount: undefined } : {}),
              })
            }}
          />
        </div>
        {data.type === 'subscription' && (
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
              min="0"
              step={0.01}
            />
          </div>
        )}

        {/* Billing Period Start */}
        <div>
          <Label>Billing Period Start</Label>
          <Input
            onChange={(e) =>
              setData({
                ...data,
                billingPeriodStart: e.target.value,
              })
            }
            type="number"
            placeholder="1"
            name="billingPeriodStart"
            min="1"
            max="31"
          />
          <p className="mt-1 text-xs text-gray-500">Day of the month</p>
        </div>

        {/* Billing Period End */}
        <div>
          <Label>Billing Period End</Label>
          <Input
            onChange={(e) =>
              setData({
                ...data,
                billingPeriodEnd: e.target.value,
              })
            }
            type="number"
            placeholder="30"
            name="billingPeriodEnd"
            min="1"
            max="31"
          />
          <p className="mt-1 text-xs text-gray-500">Day of the month</p>
        </div>

        <div>
          <Label>Billing Due Date</Label>
          <Input
            onChange={(e) =>
              setData({
                ...data,
                dueDate: e.target.value,
              })
            }
            type="number"
            placeholder="30"
            name="dueDate"
            min="1"
            max="31"
          />
          <p className="mt-1 text-xs text-gray-500">Day of the month</p>
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

export default BillForm
