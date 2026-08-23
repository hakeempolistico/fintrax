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
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : '—'
const maskAccountNumber = (value: string) => value.length <= 4 ? value : `•••• ${value.replace(/\s/g, '').slice(-4)}`

const getAccountLogo = (account: AccountWithBalance) => {
  const accountIdentity = `${account.name ?? ''} ${account.source ?? ''}`.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (accountIdentity.includes('unionbank')) return '/images/logo/unionbank.png'
  if (accountIdentity.includes('bpi')) return '/images/logo/bpi.png'
  return null
}

export default function AccountCard({ account }: AccountCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const config = accountTypeConfig[account.type]
  const Icon = config.icon
  const logo = getAccountLogo(account)

  const handleUpdate = async (data: any) => {
    const response = await fetch(`/api/accounts/${account.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const result = await response.json()
    if (!response.ok) { alert(result?.errors?.[0]?.message ?? 'Unable to update account.'); return false }
    return true
  }

  const openEditFromView = () => {
    setIsViewOpen(false)
    setIsEditOpen(true)
  }

  return <>
    <div
      role="button"
      tabIndex={0}
      onClick={() => setIsViewOpen(true)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsViewOpen(true) }}
      className="group flex h-full min-w-0 cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl ${logo ? 'border border-gray-200 bg-white dark:border-gray-700' : config.bgClass}`}>
            {logo ? <Image src={logo} alt={`${account.source || account.name} logo`} fill sizes="48px" className="object-contain p-1.5" /> : <Icon className={`h-6 w-6 ${config.iconClass}`} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-base font-semibold text-gray-900 dark:text-white">{account.name}</p>
              {account.isDefault && <span title="Default account" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-500/10"><Star className="h-3.5 w-3.5 fill-current" /></span>}
            </div>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{account.source || config.label}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-white/[0.06] dark:text-gray-300">{config.label}</span>
      </div>

      <div className="mt-6"><p className="text-xs font-medium uppercase tracking-wider text-gray-400">Current balance</p><p className={`mt-1 text-2xl font-bold tracking-tight ${account.currentBalance < 0 ? 'text-error-600 dark:text-error-400' : 'text-gray-900 dark:text-white'}`}>{formatCurrency(account.currentBalance)}</p><p className="mt-1 text-xs text-gray-400">Opening balance {formatCurrency(account.balance ?? 0)}</p></div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"><div className="rounded-xl bg-green-50/70 p-3 dark:bg-green-500/[0.06]"><div className="flex items-center gap-1.5 text-xs text-gray-500"><ArrowDownLeft className="h-3.5 w-3.5 text-success-500" />Money in</div><p className="mt-1 truncate text-sm font-semibold text-green-700 dark:text-green-400">{formatCurrency(account.totalIn)}</p></div><div className="rounded-xl bg-rose-50/70 p-3 dark:bg-rose-500/[0.06]"><div className="flex items-center gap-1.5 text-xs text-gray-500"><ArrowUpRight className="h-3.5 w-3.5 text-error-500" />Money out</div><p className="mt-1 truncate text-sm font-semibold text-rose-700 dark:text-rose-400">{formatCurrency(account.totalOut)}</p></div></div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-gray-400"><span>{maskAccountNumber(account.accountNumber)}</span><span>{account.transactionCount} {account.transactionCount === 1 ? 'transaction' : 'transactions'}</span></div>
    </div>

    <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} className="max-h-[calc(100vh-2rem)] max-w-[680px] overflow-y-auto p-5 lg:p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4 pr-12">
          <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${logo ? 'border border-gray-200 bg-white dark:border-gray-700' : config.bgClass}`}>
            {logo ? <Image src={logo} alt={`${account.source || account.name} logo`} fill sizes="56px" className="object-contain p-2" /> : <Icon className={`h-7 w-7 ${config.iconClass}`} />}
          </div>
          <div>
            <div className="flex items-center gap-2"><h3 className="text-xl font-semibold text-gray-900 dark:text-white">{account.name}</h3>{account.isDefault && <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">Default</span>}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{account.source || config.label}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"><p className="text-xs uppercase tracking-wide text-gray-400">Current Balance</p><p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(account.currentBalance)}</p></div>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"><p className="text-xs uppercase tracking-wide text-gray-400">Opening Balance</p><p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(account.balance ?? 0)}</p></div>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"><p className="text-xs uppercase tracking-wide text-gray-400">Money In</p><p className="mt-1 text-lg font-semibold text-green-700 dark:text-green-400">{formatCurrency(account.totalIn)}</p></div>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"><p className="text-xs uppercase tracking-wide text-gray-400">Money Out</p><p className="mt-1 text-lg font-semibold text-rose-700 dark:text-rose-400">{formatCurrency(account.totalOut)}</p></div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div><p className="text-xs font-medium text-gray-400">Account Type</p><p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{config.label}</p></div>
          <div><p className="text-xs font-medium text-gray-400">Account Number</p><p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{account.accountNumber}</p></div>
          <div><p className="text-xs font-medium text-gray-400">Transactions</p><p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{account.transactionCount}</p></div>
          <div><p className="text-xs font-medium text-gray-400">Default Account</p><p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{account.isDefault ? 'Yes' : 'No'}</p></div>
        </div>

        <div className="border-t border-gray-100 pt-5 dark:border-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <div><h4 className="font-semibold text-gray-900 dark:text-white">Recent transactions</h4><p className="text-xs text-gray-500 dark:text-gray-400">Latest activity linked to this account</p></div>
          </div>
          {account.recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {account.recentTransactions.map((transaction) => {
                const isTransfer = transaction.type === 'transfer'
                const sourceId = typeof transaction.account === 'string' ? transaction.account : transaction.account?.id
                const isIncomingTransfer = isTransfer && sourceId !== account.id
                const isPositive = transaction.type === 'income' || isIncomingTransfer
                return (
                  <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/[0.03]">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium capitalize text-gray-800 dark:text-gray-200">{isTransfer ? (isIncomingTransfer ? 'Transfer in' : 'Transfer out') : transaction.type}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}{transaction.notes ? ` • ${transaction.notes}` : ''}</p>
                    </div>
                    <p className={`shrink-0 text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>{isPositive ? '+' : '-'}{formatCurrency(transaction.amount ?? 0)}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">No linked transactions yet.</div>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-5 dark:border-gray-800">
          <button type="button" onClick={openEditFromView} className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"><Pencil className="h-4 w-4" />Edit Account</button>
        </div>
      </div>
    </Modal>

    <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} className="max-w-[584px] p-5 lg:p-10"><AccountForm account={account} closeModal={() => setIsEditOpen(false)} handleSave={handleUpdate} /></Modal>
  </>
}
