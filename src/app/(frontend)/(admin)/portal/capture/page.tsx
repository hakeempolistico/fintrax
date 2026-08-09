import AccountCard from '@/app/(frontend)/components/account-card'
import FormInModal from '@/app/(frontend)/modals/FormInModal'
import BasicTableOne from '@/app/(frontend)/tables/BasicTableOne'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Account } from '@/payload-types'
import { getMe, myAccounts } from '@/services/app.service'
import { Metadata } from 'next'
import AiCamera from './ai-camera'

export const metadata: Metadata = {
  title: 'Next.js Basic Table | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template',
  // other metadata
}
export default async function CapturePage() {
  //   const me = await getMe()
  return (
    <div>
      <PageBreadcrumb pageTitle="AI Capture" />
      <div className="space-y-6">
        <ComponentCard title="Capture">
          <AiCamera></AiCamera>
        </ComponentCard>
      </div>
    </div>
  )
}
