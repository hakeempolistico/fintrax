import AccountCard from '@/app/(frontend)/components/account-card'
import FormInModal from '@/app/(frontend)/modals/FormInModal'
import BasicTableOne from '@/app/(frontend)/tables/BasicTableOne'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Account } from '@/payload-types'
import { getMe, myAccounts } from '@/services/app.service'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Next.js Basic Table | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template',
  // other metadata
}
export default async function AccountsPage() {
  const me = await getMe()
  const accounts = await myAccounts()
  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          {/* <BasicTableOne /> */}
          <div className="grid grid-cols-12 gap-6">
            {accounts.map((account) => (
              <div key={account.id} className="col-span-6 lg:col-span-6 xl:col-span-4">
                <AccountCard key={account.id} account={account} />
              </div>
            ))}
          </div>
        </ComponentCard>
      </div>
      <FormInModal me={me} collection="accounts"></FormInModal>
    </div>
  )
}
