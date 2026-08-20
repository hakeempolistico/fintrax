'use client'

import { ThemeToggleButton } from '@/components/common/ThemeToggleButton'
import { useSidebar } from '@/context/SidebarContext'
import Image from 'next/image'
import Link from 'next/link'
import UserDropdown, { HeaderUser } from './UserDropdown'

type AppHeaderProps = {
  user: HeaderUser
}

export default function AppHeader({ user }: AppHeaderProps) {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar()

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar()
    else toggleMobileSidebar()
  }

  return (
    <header className="sticky top-0 z-99999 flex w-full border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="z-99999 flex h-10 w-10 items-center justify-center rounded-lg border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle sidebar"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.22 7.28a.75.75 0 0 1 1.06-1.06L12 10.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L13.06 12l4.72 4.72a.75.75 0 1 1-1.06 1.06L12 13.06l-4.72 4.72a.75.75 0 1 1-1.06-1.06L10.94 12 6.22 7.28Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M.58 1c0-.41.34-.75.75-.75h13.34a.75.75 0 0 1 0 1.5H1.33A.75.75 0 0 1 .58 1Zm0 10c0-.41.34-.75.75-.75h13.34a.75.75 0 0 1 0 1.5H1.33a.75.75 0 0 1-.75-.75Zm.75-5.75a.75.75 0 0 0 0 1.5H8a.75.75 0 0 0 0-1.5H1.33Z" fill="currentColor" />
              </svg>
            )}
          </button>

          <Link href="/portal" className="flex items-center gap-2 lg:hidden">
            <Image src="/images/logo/logo-fintrax.png" width={36} height={36} alt="Fintrax" className="h-9 w-9 object-contain" priority />
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              FIN<span className="text-cyan-500">TRAX</span>
            </span>
          </Link>
        </div>

        <div className="flex w-full items-center justify-between gap-4 px-5 py-4 shadow-theme-md lg:w-auto lg:justify-end lg:px-0 lg:shadow-none">
          <ThemeToggleButton />
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  )
}
