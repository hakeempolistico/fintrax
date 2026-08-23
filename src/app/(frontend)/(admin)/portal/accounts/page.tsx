import AccountCard from '@/components/fintrax/accounts/AccountCard'
import DashboardCard from '@/components/fintrax/dashboard/DashboardCard'
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
            <DashboardCard label="Total balance" number={formatCurrency(totalBalance)} helper="Across all accounts" tone="success" icon={WalletCards} />
            <DashboardCard label="Accounts" number={String(accounts.length)} helper="Connected money sources" tone="brand" icon={Landmark} />
            <DashboardCard label="Money out" number={formatCurrency(totalOut)} helper="Recorded account outflow" tone="danger" icon={TrendingDown} />
            <DashboardCard label="Transactions" number={String(transactionCount)} helper="Linked to your accounts" tone="violet" icon={ReceiptText} />
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
