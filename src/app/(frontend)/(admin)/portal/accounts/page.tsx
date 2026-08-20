import AccountCard from '@/components/fintrax/accounts/AccountCard'
import ActionModals from '@/components/fintrax/modals/ActionModals'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { getMe, myAccounts } from '@/services/app.service'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Accounts | Fintrax', description: 'Manage your accounts in Fintrax' }
export default async function AccountsPage() {
  const me = await getMe(); const accounts = await myAccounts()
  return <div><PageBreadcrumb pageTitle="Accounts" /><div className="space-y-6"><ComponentCard title="Accounts"><div className="grid grid-cols-12 gap-6">{accounts.map((account) => <div key={account.id} className="col-span-12 sm:col-span-6 lg:col-span-6 xl:col-span-4"><AccountCard account={account} /></div>)}</div></ComponentCard></div><ActionModals me={me} collection="accounts" /></div>
}
