'use client'
import { Account, Bill, Loan, Member } from '@/payload-types'
import AccountForm from '../(admin)/portal/accounts/account-form'
import Button from '../../../components/ui/button/Button'
import { Modal } from '../../../components/ui/modal'
import { useModal } from '@/hooks/useModal'
import { Camera, Plus, Upload } from 'lucide-react'
import AiCamera from '../(admin)/portal/capture/ai-camera'
import { useRef, useState } from 'react'
import { redirect } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import LoanForm from '../(admin)/portal/loans/loan-form'
import TransactionForm from '../(admin)/portal/transactions/transaction-form'
import BillForm from '../(admin)/portal/bills/bill-form'

type ActionModalsProps = {
  collection: 'accounts' | 'transactions' | 'loans' | 'bills'
  me: Member
  bills?: Bill[]
  accounts?: Account[]
  loans?: Loan[]
}
export default function ActionModals({
  me,
  collection,
  bills,
  accounts,
  loans,
}: ActionModalsProps) {
  // Upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  let Form = null
  let endpoint = null

  switch (collection) {
    case 'accounts':
      Form = AccountForm
      endpoint = '/api/accounts'
      break
    case 'loans':
      Form = LoanForm
      endpoint = '/api/loans'
      break
    case 'bills':
      Form = BillForm
      endpoint = '/api/bills'
      break
    case 'transactions':
      Form = TransactionForm
      endpoint = '/api/transactions'
      break
    default:
      break
  }
  const [isUploading, setIsUploading] = useState(false)
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true)
    const file = e.target.files?.[0]
    if (!file) {
      return setIsUploading(false)
    }

    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch('/api/aicapture', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) {
      alert(data?.message ?? 'Failed to upload image. Try again later.')
    }
    if (data?.redirect) {
      redirect(data?.redirect)
    }
    setIsUploading(false)
  }

  const { isOpen, openModal, closeModal } = useModal()
  const scannerModal = useModal()
  const handleSave = async (data: any) => {
    if (endpoint) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          member: me.id,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        alert(`${result?.errors?.[0]?.name}: ${result?.errors?.[0]?.message}`)
        return false
      }

      return true
    }

    return false
  }

  // Check if sidebar is open
  const { isMobileOpen } = useSidebar()
  return (
    <>
      {!isMobileOpen && (
        <div>
          <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-brand-50 p-3 dark:!bg-purple-600/10">
            {Form && (
              <Button
                size="sm"
                onClick={openModal}
                className="!rounded-full !bg-brand-100 !text-brand-500 dark:!bg-purple-500 dark:!text-white"
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}

            <Button
              size="sm"
              onClick={scannerModal.openModal}
              className="!rounded-full !bg-brand-100 !text-brand-500 dark:!bg-purple-500 dark:!text-white"
            >
              <Camera className="h-5 w-5" />
            </Button>

            <Button
              size="sm"
              className="!rounded-full !bg-brand-100 !text-brand-500 dark:!bg-purple-500 dark:!text-white"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-5 w-5" />
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </div>

          <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[584px] p-5 lg:p-10">
            {Form && (
              <Form
                closeModal={closeModal}
                handleSave={handleSave}
                bills={bills}
                accounts={accounts}
                loans={loans}
              />
            )}
          </Modal>

          <Modal
            isOpen={scannerModal.isOpen}
            onClose={scannerModal.closeModal}
            className="max-w-[584px] p-5 lg:p-10"
          >
            <AiCamera />
          </Modal>
        </div>
      )}

      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm dark:bg-gray-950/95">
          <div className="flex flex-col items-center justify-center px-6 text-center">
            {/* Animated loader */}

            <div className="relative flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-brand-500/10" />

              <div className="absolute inset-2 rounded-full border-4 border-brand-100 dark:border-brand-900/50" />

              <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-t-brand-500 border-r-brand-500" />

              <div className="h-10 w-10 rounded-full bg-brand-500/10 dark:bg-brand-500/20" />

              <div className="h-3 w-3 animate-pulse rounded-full bg-brand-500" />
            </div>

            {/* Text */}

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Analyzing your document
              </h2>

              <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                We're reading the information from your image. This may take a moment.
              </p>
            </div>

            {/* Progress dots */}

            <div className="mt-6 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.3s]" />

              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.15s]" />

              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
