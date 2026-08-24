'use client'

import { useState } from 'react'
import Label from '@/components/form/Label'
import Input from '@/components/form/input/InputField'
import Button from '@/components/ui/button/Button'
import Select from '@/components/form/Select'

type AccountFormProps = {
  closeModal?: () => void
  handleSave?: (data: any) => Promise<boolean | void> | boolean | void
}

const AccountForm = ({ closeModal, handleSave }: AccountFormProps) => {
  const [data, setData] = useState<any>({})

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const success = await handleSave?.(data)
    if (success) window.location.reload()
  }

  return (
    <form onSubmit={onSubmitHandler}>
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">Create Account</h4>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className="col-span-1">
          <Label>Name</Label>
          <Input onChange={(e) => setData({ ...data, name: e.target.value })} type="text" placeholder="BPI Savings" name="name" />
        </div>
        <div className="col-span-1">
          <Label>Source</Label>
          <Input onChange={(e) => setData({ ...data, source: e.target.value })} type="text" placeholder="BPI" name="source" />
        </div>
        <div className="col-span-1">
          <Label>Type</Label>
          <Select
            key="account-type"
            options={[
              { value: 'bank', label: 'Bank Account' },
              { value: 'cash', label: 'Cash' },
              { value: 'credit-card', label: 'Credit Card' },
              { value: 'e-wallet', label: 'E-Wallet' },
            ]}
            placeholder="Select account type"
            onChange={(value) => setData({ ...data, type: value })}
          />
        </div>
        <div className="col-span-1">
          <Label>Account Number</Label>
          <Input onChange={(e) => setData({ ...data, accountNumber: e.target.value })} type="text" placeholder="1234 1234 1234 1234" name="accountNumber" />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <Label>Initial Balance</Label>
          <Input onChange={(e) => setData({ ...data, balance: Number(e.target.value) })} type="number" placeholder="0.00" name="balance" />
        </div>
      </div>

      <div className="mt-6 flex w-full items-center justify-end gap-3">
        <Button size="sm" variant="outline" type="button" onClick={closeModal}>Close</Button>
        <Button size="sm" type="submit">Create</Button>
      </div>
    </form>
  )
}

export default AccountForm
