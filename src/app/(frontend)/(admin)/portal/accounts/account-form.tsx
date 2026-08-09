'use client'

import { useState } from 'react'
import Label from '../../../../../components/form/Label'
import Input from '../../../../../components/form/input/InputField'
import Button from '../../../../../components/ui/button/Button'
import Select from '@/components/form/Select'

type AccountFormProps = {
  closeModal?: () => void
  handleSave?: (data: any) => void
}
const AccountForm = ({ closeModal, handleSave }: AccountFormProps) => {
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
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">Create Account</h4>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className="col-span-1">
          <Label>Name</Label>
          <Input
            onChange={(e) => setData({ ...data, name: e.target.value })}
            type="text"
            placeholder="Emirhan"
            name="name"
          />
        </div>

        <div className="col-span-1">
          <Label>Source</Label>
          <Input
            onChange={(e) => setData({ ...data, source: e.target.value })}
            type="text"
            placeholder="Boruch"
            name="source"
          />
        </div>

        <div className="col-span-1">
          <Label>Type</Label>

          <Select
            key="account-type"
            options={[
              { value: 'bank', label: 'Bank Account' },
              { value: 'cash', label: 'Cash' },
              { value: 'credit-card', label: 'Credit Card' },
              { value: 'ewallet', label: 'E-Wallet' },
              { value: 'investment', label: 'Investment' },
              { value: 'other', label: 'Other' },
            ]}
            placeholder="Select account type"
            onChange={(value) => {
              setData({ ...data, type: value })
            }}
          />
        </div>

        <div className="col-span-1">
          <Label>Account Number</Label>
          <Input
            onChange={(e) => setData({ ...data, accountNumber: e.target.value })}
            type="text"
            placeholder="1234 1234 1234 1234"
            name="accountNumber"
          />
        </div>

        <div className="col-span-1 sm:col-span-2">
          <Label>Initial Balance</Label>
          <Input
            onChange={(e) => setData({ ...data, balance: e.target.value })}
            type="number"
            placeholder="123456789"
            name="balance"
          />
        </div>
      </div>

      <div className="flex items-center justify-end w-full gap-3 mt-6">
        <Button size="sm" variant="outline" onClick={closeModal}>
          Close
        </Button>
        <Button size="sm">Save Changes</Button>
      </div>
    </form>
  )
}

export default AccountForm
