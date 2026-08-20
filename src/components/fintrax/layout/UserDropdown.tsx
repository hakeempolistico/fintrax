'use client'

import { Dropdown } from '@/components/ui/dropdown/Dropdown'
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useState } from 'react'

export type HeaderUser = {
  firstName: string
  lastName: string
  email: string
}

type UserDropdownProps = {
  user: HeaderUser
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          setIsOpen((open) => !open)
        }}
        className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-gray-50 dark:hover:bg-white/[0.04]"
        aria-label="Open user menu"
        aria-expanded={isOpen}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700">
          <UserRound className="h-5 w-5" />
        </div>

        <div className="hidden min-w-0 sm:block">
          <p className="max-w-40 truncate text-sm font-semibold text-gray-800 dark:text-white/90">
            {user.firstName || user.email}
          </p>
        </div>

        <ChevronDown
          className={`hidden h-4 w-4 text-gray-400 transition-transform sm:block ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute right-0 mt-3 flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-white/[0.03]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
              {fullName || 'Fintrax User'}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-800">
          <DropdownItem
            tag="a"
            href="/signin"
            onItemClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  )
}
