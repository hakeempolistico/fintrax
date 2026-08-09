'use client'
import { Member } from '@/payload-types'
import AccountForm from '../(admin)/portal/accounts/account-form'
import Button from '../../../components/ui/button/Button'
import { Modal } from '../../../components/ui/modal'
import { useModal } from '@/hooks/useModal'

type FormInModalProps = {
  collection: 'accounts' | 'transactions' | 'loans'
  me: Member
}
export default function FormInModal({ me, collection }: FormInModalProps) {
  const Form = collection === 'accounts' ? AccountForm : null
  const endpoint = collection === 'accounts' ? '/api/accounts' : '/'
  const { isOpen, openModal, closeModal } = useModal()
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

  return (
    <div>
      <Button
        size="sm"
        onClick={openModal}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 !rounded-full p-0"
      >
        +
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[584px] p-5 lg:p-10">
        {/* Form */}
        {Form && <Form closeModal={closeModal} handleSave={handleSave} />}
      </Modal>
    </div>
  )
}
