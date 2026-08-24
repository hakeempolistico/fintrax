'use client'

import { Account, Bill, Loan, Member } from '@/payload-types'
import AccountForm from '@/components/fintrax/accounts/AccountForm'
import BillForm from '@/components/fintrax/bills/BillForm'
import LoanForm from '@/components/fintrax/loans/LoanForm'
import TransactionForm from '@/components/fintrax/transactions/TransactionForm'
import Button from '@/components/ui/button/Button'
import { Modal } from '@/components/ui/modal'
import { useModal } from '@/hooks/useModal'
import { MessageCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { useSidebar } from '@/context/SidebarContext'

type Props = {
  collection: 'accounts' | 'transactions' | 'loans' | 'bills'
  me: Member
  bills?: Bill[]
  accounts?: Account[]
  loans?: Loan[]
}

export default function ActionModals({ me, collection, bills, accounts, loans }: Props) {
  const createModal = useModal()
  const { isMobileOpen } = useSidebar()

  const config = {
    accounts: { endpoint: '/api/accounts' },
    loans: { endpoint: '/api/loans' },
    bills: { endpoint: '/api/bills' },
    transactions: { endpoint: '/api/transactions' },
  }[collection]

  const handleSave = async (data: any) => {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, member: me.id }),
    })

    const result = await response.json()
    if (!response.ok) {
      alert(result?.errors?.[0]?.message ?? 'Unable to save.')
      return false
    }

    return true
  }

  const renderForm = () => {
    const props = { closeModal: createModal.closeModal, handleSave }

    switch (collection) {
      case 'accounts':
        return <AccountForm {...props} />
      case 'bills':
        return <BillForm {...props} />
      case 'loans':
        return <LoanForm {...props} />
      case 'transactions':
        return (
          <TransactionForm
            {...props}
            bills={bills}
            accounts={accounts}
            loans={loans}
          />
        )
    }
  }

  if (isMobileOpen) return null

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-brand-50 p-3 shadow-lg dark:bg-purple-600/10">
        <Button
          size="sm"
          onClick={createModal.openModal}
          className="!rounded-full !bg-brand-100 !text-brand-500 dark:!bg-purple-500 dark:!text-white"
          aria-label="Add"
        >
          <Plus className="h-5 w-5" />
        </Button>

        <Link
          href="/portal/ai-chat"
          aria-label="AI Chat"
          title="AI Chat"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-500 transition hover:bg-brand-200 dark:bg-purple-500 dark:text-white dark:hover:bg-purple-600"
        >
          <MessageCircle className="h-5 w-5" />
        </Link>
      </div>

      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        className="max-w-[584px] p-5 lg:p-10"
      >
        {renderForm()}
      </Modal>
    </>
  )
}
