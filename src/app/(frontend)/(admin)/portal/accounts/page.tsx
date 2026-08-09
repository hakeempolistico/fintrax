import AccountCard from '@/app/(frontend)/components/account-card'
import InfoCard from '@/app/(frontend)/components/account-card'
import FormInModal from '@/app/(frontend)/modals/FormInModal'
import BasicTableOne from '@/app/(frontend)/tables/BasicTableOne'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Account } from '@/payload-types'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Next.js Basic Table | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template',
  // other metadata
}
const accounts: Account[] = [
  {
    id: '1',
    name: 'BPI Savings',
    source: 'BPI',
    accountNumber: '1234 1234 1234',
    type: 'bank',
    balance: 100000,
    metadata: {},
    member: '1',
    updatedAt: '',
    createdAt: '',
  },
]
export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          {/* <BasicTableOne /> */}
          <div className="grid grid-cols-12 gap-6">
            {accounts.map((account) => (
              <div key={account.id} className="col-span-4">
                <AccountCard key={account.id} account={account} />
              </div>
            ))}
          </div>
        </ComponentCard>
      </div>
      <FormInModal></FormInModal>
    </div>
  )
}
