import AccountCard from '@/components/fintrax/accounts/AccountCard'
import ActionModals from '@/components/fintrax/modals/ActionModals'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { getMe, myAccountsWithBalances } from '@/services/app.service'
import { Metadata } from 'next'
import { Landmark, ReceiptText, TrendingDown, WalletCards } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Accounts | Fintrax',
  description: 'See your accounts, balances, and account activity in Fintrax',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)

export default async function AccountsPage() {
  const [me, accounts] = await Promise.all([getMe(), myAccountsWithBalances()])
  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0)
  const totalOut = accounts.reduce((sum, account) => sum + account.totalOut, 0)
  const transactionCount = accounts.reduce((sum, account) => sum + account.transactionCount, 0)

  const stats = [
    { label: 'Total balance', value: formatCurrency(totalBalance), helper: 'Across all accounts', icon: WalletCards },
    { label: 'Accounts', value: String(accounts.length), helper: 'Connected money sources', icon: Landmark },
    { label: 'Money out', value: formatCurrency(totalOut), helper: 'Recorded account outflow', icon: TrendingDown },
    { label: 'Transactions', value: String(transactionCount), helper: 'Linked to your accounts', icon: ReceiptText },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Accounts" />

      <div className="space-y-6">
        <section>
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Your money, all in one place</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Balances update automatically from transactions linked to each account.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, helper, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/[0.06]"><Icon className="h-4 w-4 text-gray-600 dark:text-gray-300" /></div>
                </div>
                <p className="mt-4 truncate text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="mt-1 text-xs text-gray-400">{helper}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02] sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My accounts</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Opening balance plus your recorded account activity.</p>
            </div>
          </div>

          {accounts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {accounts.map((account) => <AccountCard key={account.id} account={account} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-14 text-center dark:border-gray-700">
              <WalletCards className="mx-auto h-9 w-9 text-gray-400" />
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">No accounts yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">Add your first bank account, wallet, cash account, or credit card to start tracking your balance.</p>
            </div>
          )}
        </section>
      </div>

      <ActionModals me={me} collection="accounts" />
    </div>
  )
}
