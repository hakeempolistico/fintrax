'use client'

import { useEffect, useState } from 'react'
import { Account } from '@/payload-types'
import Label from '@/components/form/Label'
import Input from '@/components/form/input/InputField'
import Button from '@/components/ui/button/Button'
import Select from '@/components/form/Select'

type EditableAccount = Account & { isDefault?: boolean }

type AccountFormProps = {
  account?: EditableAccount
  closeModal?: () => void
  handleSave?: (data: any) => Promise<boolean | undefined> | boolean | undefined
}

const getInitialData = (account?: EditableAccount) => ({
  name: account?.name ?? '',
  source: account?.source ?? '',
  type: account?.type ?? '',
  accountNumber: account?.accountNumber ?? '',
  balance: account?.balance ?? 0,
  isDefault: account?.isDefault ?? false,
})

const AccountForm = ({ account, closeModal, handleSave }: AccountFormProps) => {
  const [data, setData] = useState(() => getInitialData(account))

  useEffect(() => {
    setData(getInitialData(account))
  }, [account])

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const success = await handleSave?.(data)
    if (success) window.location.reload()
  }

  return (
    <form key={account?.id ?? 'new-account'} onSubmit={onSubmitHandler}>
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {account ? 'Edit Account' : 'Add Account'}
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {account
            ? 'Update your account details and preferences.'
            : 'Add an account to start tracking its balance and activity.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div>
          <Label>Account Name</Label>
          <Input
            key={`name-${account?.id ?? 'new'}`}
            defaultValue={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            type="text"
            placeholder="BPI Savings"
            name="name"
          />
        </div>

        <div>
          <Label>Bank / Provider</Label>
          <Input
            key={`source-${account?.id ?? 'new'}`}
            defaultValue={data.source ?? ''}
            onChange={(e) => setData({ ...data, source: e.target.value })}
            type="text"
            placeholder="BPI"
            name="source"
          />
        </div>

        <div>
          <Label>Account Type</Label>
          <Select
            key={`account-type-${account?.id ?? 'new'}`}
            options={[
              { value: 'bank', label: 'Bank Account' },
              { value: 'cash', label: 'Cash' },
              { value: 'credit-card', label: 'Credit Card' },
              { value: 'e-wallet', label: 'E-Wallet' },
            ]}
            defaultValue={data.type}
            placeholder="Select account type"
            onChange={(value) => setData({ ...data, type: value as Account['type'] })}
          />
        </div>

        <div>
          <Label>Account Number</Label>
          <Input
            key={`account-number-${account?.id ?? 'new'}`}
            defaultValue={data.accountNumber}
            onChange={(e) => setData({ ...data, accountNumber: e.target.value })}
            type="text"
            placeholder="1234 1234 1234 1234"
            name="accountNumber"
          />
        </div>

        <div className="sm:col-span-2">
          <Label>Opening Balance</Label>
          <Input
            key={`balance-${account?.id ?? 'new'}`}
            defaultValue={data.balance}
            onChange={(e) => setData({ ...data, balance: Number(e.target.value) })}
            type="number"
            placeholder="0.00"
            name="balance"
          />
        </div>

        <label className="sm:col-span-2 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/[0.03]">
          <input
            type="checkbox"
            checked={data.isDefault}
            onChange={(e) => setData({ ...data, isDefault: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
          />
          <span>
            <span className="block text-sm font-medium text-gray-800 dark:text-white">
              Set as default account
            </span>
            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
              Fintrax can use this as your preferred account when creating transactions later.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-6 flex w-full items-center justify-end gap-3">
        <Button size="sm" variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button size="sm">{account ? 'Save Changes' : 'Add Account'}</Button>
      </div>
    </form>
  )
}

export default AccountForm
