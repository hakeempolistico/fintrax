'use client'
import { Member } from '@/payload-types'
import AccountForm from '../(admin)/portal/accounts/account-form'
import Button from '../../../components/ui/button/Button'
import { Modal } from '../../../components/ui/modal'
import { useModal } from '@/hooks/useModal'
import { Camera, Plus, Upload } from 'lucide-react'
import AiCamera from '../(admin)/portal/capture/ai-camera'
import { useRef } from 'react'
import { redirect } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'

type ActionModalsProps = {
  collection: 'accounts' | 'transactions' | 'loans'
  me: Member
}
export default function ActionModals({ me, collection }: ActionModalsProps) {
  // Upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const Form = collection === 'accounts' ? AccountForm : null
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
  }

  // Modals
  const endpoint = collection === 'accounts' ? '/api/accounts' : '/'
  const { isOpen, openModal, closeModal } = useModal()
  const scannerModal = useModal()
  const handleSave = async (data: any) => {
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

    if (!response.ok) {
      return false
    }

    return true
  }

  // Check if sidebar is open
  const { isExpanded, isMobileOpen } = useSidebar()
  console.log({ isExpanded, isMobileOpen })

  return (
    <>
      {!isMobileOpen && (
        <div>
          <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-brand-50 p-3 dark:!bg-purple-600/10">
            <Button
              size="sm"
              onClick={openModal}
              className="!rounded-full !bg-brand-100 !text-brand-500 dark:!bg-purple-500 dark:!text-white"
            >
              <Plus className="h-5 w-5" />
            </Button>

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
            {Form && <Form closeModal={closeModal} handleSave={handleSave} />}
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
    </>
  )
}
