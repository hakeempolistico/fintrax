'use client'

import { Dropdown } from '@/components/ui/dropdown/Dropdown'
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

type CurrentMember = {
  email?: string
  firstName?: string
  lastName?: string
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [member, setMember] = useState<CurrentMember | null>(null)

  useEffect(() => {
    fetch('/api/members/me', { credentials: 'include' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setMember(data?.user ?? null))
      .catch(() => setMember(null))
  }, [])

  const name = [member?.firstName, member?.lastName].filter(Boolean).join(' ') || 'Member'

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    setIsOpen((prev) => !prev)
  }

  function closeDropdown() {
    setIsOpen(false)
  }

  async function signOut(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    await fetch('/api/members/logout', { method: 'POST', credentials: 'include' }).catch(() => null)
    window.location.href = '/signin'
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
        aria-label="Open user menu"
      >
        <span className="mr-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {(member?.firstName?.[0] ?? member?.email?.[0] ?? 'M').toUpperCase()}
        </span>
        <span className="block mr-1 font-medium text-theme-sm">{member?.firstName || 'Member'}</span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M4.3125 8.65625L9 13.3437L13.6875 8.65625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="px-1">
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">{name}</span>
          <span className="mt-0.5 block truncate text-theme-xs text-gray-500 dark:text-gray-400">{member?.email ?? ''}</span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/portal/settings"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <svg className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 8.25A3.75 3.75 0 1 0 12 15.75 3.75 3.75 0 0 0 12 8.25ZM9.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM10.1 2.75h3.8l.35 1.75c.55.2 1.07.5 1.54.89l1.69-.58 1.9 3.29-1.34 1.17c.05.28.08.57.08.87s-.03.59-.08.87l1.34 1.17-1.9 3.29-1.69-.58c-.47.39-.99.69-1.54.89l-.35 1.75h-3.8l-.35-1.75a6.02 6.02 0 0 1-1.54-.89l-1.69.58-1.9-3.29 1.34-1.17A5.1 5.1 0 0 1 5.88 12c0-.3.03-.59.08-.87L4.62 9.96l1.9-3.29 1.69.58c.47-.39.99-.69 1.54-.89l.35-1.75Z" />
              </svg>
              Settings
            </DropdownItem>
          </li>
        </ul>

        <Link
          href="/signin"
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <svg className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M14 5a1 1 0 0 1 1-1h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4a1 1 0 1 1 0-2h4V6h-4a1 1 0 0 1-1-1ZM10.7 7.3a1 1 0 0 1 0 1.4L8.4 11H16a1 1 0 1 1 0 2H8.4l2.3 2.3a1 1 0 1 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 0 1 1.4 0Z" />
          </svg>
          Sign out
        </Link>
      </Dropdown>
    </div>
  )
}
