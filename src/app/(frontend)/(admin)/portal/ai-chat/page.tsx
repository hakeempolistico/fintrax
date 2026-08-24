import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import AiChatClient from '@/components/fintrax/ai/AiChatClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Chat | Fintrax',
  description: 'Chat with Fintrax AI about your finances.',
}

export default function AiChatPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="AI Chat" />
      <div className="mx-auto max-w-5xl">
        <AiChatClient />
      </div>
    </div>
  )
}
