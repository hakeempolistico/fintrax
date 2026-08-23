'use client'

import Button from '@/components/ui/button/Button'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import { useEffect, useState } from 'react'

type Member = {
  id: string | number
  email: string
  firstName: string
  lastName: string
}

function messageFrom(data: any, fallback: string) {
  return data?.errors?.[0]?.message ?? data?.message ?? fallback
}

export default function SettingsPage() {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    fetch('/api/members/me', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          window.location.href = '/signin'
          return null
        }
        return response.json()
      })
      .then((data) => setMember(data?.user ?? null))
      .finally(() => setLoading(false))
  }, [])

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!member) return

    setSavingProfile(true)
    setProfileMessage('')
    const form = new FormData(event.currentTarget)
    const response = await fetch(`/api/members/${member.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: String(form.get('firstName') ?? '').trim(),
        lastName: String(form.get('lastName') ?? '').trim(),
      }),
    })
    const data = await response.json().catch(() => ({}))
    setSavingProfile(false)

    if (!response.ok) {
      setProfileMessage(messageFrom(data, 'Unable to update your details.'))
      return
    }

    setMember(data?.doc ?? member)
    setProfileMessage('Member details updated successfully.')
  }

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!member) return

    setSavingPassword(true)
    setPasswordMessage('')
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const currentPassword = String(form.get('currentPassword') ?? '')
    const newPassword = String(form.get('newPassword') ?? '')
    const confirmPassword = String(form.get('confirmPassword') ?? '')

    if (newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters.')
      setSavingPassword(false)
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New password and confirmation do not match.')
      setSavingPassword(false)
      return
    }

    const verify = await fetch('/api/members/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: member.email, password: currentPassword }),
    })
    if (!verify.ok) {
      setPasswordMessage('Current password is incorrect.')
      setSavingPassword(false)
      return
    }

    const response = await fetch(`/api/members/${member.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    })
    const data = await response.json().catch(() => ({}))
    setSavingPassword(false)

    if (!response.ok) {
      setPasswordMessage(messageFrom(data, 'Unable to update your password.'))
      return
    }

    formElement.reset()
    setPasswordMessage('Password updated successfully.')
  }

  if (loading) {
    return <div className="py-10 text-sm text-gray-500 dark:text-gray-400">Loading settings...</div>
  }

  if (!member) return null

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update your member details and password.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Member details</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage the information associated with your account.</p>
        </div>
        <form onSubmit={updateProfile} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div><Label>First name</Label><Input name="firstName" defaultValue={member.firstName} /></div>
            <div><Label>Last name</Label><Input name="lastName" defaultValue={member.lastName} /></div>
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={member.email} disabled />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed from Settings.</p>
          </div>
          {profileMessage && <p className="text-sm text-gray-600 dark:text-gray-300">{profileMessage}</p>}
          <div className="flex justify-end"><Button size="sm" disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save changes'}</Button></div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Password</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose a strong password you do not use elsewhere.</p>
        </div>
        <form onSubmit={updatePassword} className="space-y-5">
          <div><Label>Current password</Label><Input name="currentPassword" type="password" placeholder="Enter current password" /></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><Label>New password</Label><Input name="newPassword" type="password" placeholder="At least 8 characters" /></div>
            <div><Label>Confirm new password</Label><Input name="confirmPassword" type="password" placeholder="Repeat new password" /></div>
          </div>
          {passwordMessage && <p className="text-sm text-gray-600 dark:text-gray-300">{passwordMessage}</p>}
          <div className="flex justify-end"><Button size="sm" disabled={savingPassword}>{savingPassword ? 'Updating...' : 'Update password'}</Button></div>
        </form>
      </section>
    </div>
  )
}
