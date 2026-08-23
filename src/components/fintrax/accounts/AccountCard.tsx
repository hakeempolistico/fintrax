'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AccountWithBalance } from '@/services/app.service'
import AccountForm from './AccountForm'
import { Modal } from '@/components/ui/modal'
import { ArrowDownLeft, ArrowUpRight, Banknote, CreditCard, Landmark, Pencil, Star, WalletCards } from 'lucide-react'

interface AccountCardProps { account: AccountWithBalance }

const accountTypeConfig: Record<NonNullable<AccountWithBalance['type']>, { label: string; icon: React.ElementType; iconClass: string; bgClass: string }> = {
  bank: { label: 'Bank Account', icon: Landmark, iconClass: 'text-blue-600 dark:text-blue-400', bgClass: 'bg-blue-50 dark:bg-blue-500/10' },
  cash: { label: 'Cash', icon: Banknote, iconClass: 'text-green-600 dark:text-green-400', bgClass: 'bg-green-50 dark:bg-green-500/10' },
  'credit-card': { label: 'Credit Card', icon: CreditCard, iconClass: 'text-purple-600 dark:text-purple-400', bgClass: 'bg-purple-50 dark:bg-purple-500/10' },
  'e-wallet': { label: 'E-Wallet', icon: WalletCards, iconClass: 'text-orange-600 dark:text-orange-400', bgClass: 'bg-orange-50 dark:bg-orange-500/10' },
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
const maskAccountNumber = (value: string) => value.length <= 4 ? value : `•••• ${value.replace(/\s/g, '').slice(-4)}`

const getAccountLogo = (account: AccountWithBalance) => {
  const accountIdentity = `${account.name ?? ''} ${account.source ?? ''}`.toLowerCase().replace(/[^a-z0-9]/g, '')

  if (accountIdentity.includes('unionbank')) return '/images/logo/unionbank.png'
  if (accountIdentity.includes('bpi')) return '/images/logo/bpi.png'

  return null
}

export default function AccountCard({ account }: AccountCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const config = accountTypeConfig[account.type]
  const Icon = config.icon
  const logo = getAccountLogo(account)

  const handleUpdate = async (data: any) => {
    const response = await fetch(`/api/accounts/${account.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const result = await response.json()
    if (!response.ok) { alert(result?.errors?.[0]?.message ?? 'Unable to update account.'); return false }
    return true
  }

  return <>
    <div className="group flex h-full min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl ${logo ? 'border border-gray-200 bg-white dark:border-gray-700' : config.bgClass}`}>
            {logo ? (
              <Image
                src={logo}
                alt={`${account.source || account.name} logo`}
                fill
                sizes="48px"
                className="object-contain p-1.5"
              />
            ) : (
              <Icon className={`h-6 w-6 ${config.iconClass}`} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-base font-semibold text-gray-900 dark:text-white">{account.name}</p>
              {account.isDefault && <span title="Default account" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-500/10"><Star className="h-3.5 w-3.5 fill-current" /></span>}
            </div>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{account.source || config.label}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-white/[0.06] dark:text-gray-300">{config.label}</span><button type="button" onClick={() => setIsEditOpen(true)} title="Edit account" className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"><Pencil className="h-4 w-4" /></button></div>
      </div>
      <div className="mt-6"><p className="text-xs font-medium uppercase tracking-wider text-gray-400">Current balance</p><p className={`mt-1 text-2xl font-bold tracking-tight ${account.currentBalance < 0 ? 'text-error-600 dark:text-error-400' : 'text-gray-900 dark:text-white'}`}>{formatCurrency(account.currentBalance)}</p><p className="mt-1 text-xs text-gray-400">Opening balance {formatCurrency(account.balance ?? 0)}</p></div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"><div className="rounded-xl bg-green-50/70 p-3 dark:bg-green-500/[0.06]"><div className="flex items-center gap-1.5 text-xs text-gray-500"><ArrowDownLeft className="h-3.5 w-3.5 text-success-500" />Money in</div><p className="mt-1 truncate text-sm font-semibold text-green-700 dark:text-green-400">{formatCurrency(account.totalIn)}</p></div><div className="rounded-xl bg-rose-50/70 p-3 dark:bg-rose-500/[0.06]"><div className="flex items-center gap-1.5 text-xs text-gray-500"><ArrowUpRight className="h-3.5 w-3.5 text-error-500" />Money out</div><p className="mt-1 truncate text-sm font-semibold text-rose-700 dark:text-rose-400">{formatCurrency(account.totalOut)}</p></div></div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-gray-400"><span>{maskAccountNumber(account.accountNumber)}</span><span>{account.transactionCount} {account.transactionCount === 1 ? 'transaction' : 'transactions'}</span></div>
    </div>
    <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} className="max-w-[584px] p-5 lg:p-10"><AccountForm account={account} closeModal={() => setIsEditOpen(false)} handleSave={handleUpdate} /></Modal>
  </>
}
