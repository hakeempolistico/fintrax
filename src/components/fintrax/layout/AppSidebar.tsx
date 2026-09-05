'use client'

import { useEffect, useState } from 'react'
import { useSidebar } from '@/context/SidebarContext'
import {
  ArrowLeftRightIcon,
  BriefcaseBusinessIcon,
  ChevronDownIcon,
  FileTextIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  PackageIcon,
  UserRoundIcon,
  WalletCardsIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DollarLineIcon, GridIcon, HorizontaLDots } from '@/icons'

const personalFinanceItems = [
  { icon: <LayoutDashboardIcon className="h-5 w-5" />, name: 'Overview', path: '/portal/personal/overview' },
  { icon: <DollarLineIcon />, name: 'Accounts', path: '/portal/personal/accounts' },
  { icon: <ArrowLeftRightIcon />, name: 'Transactions', path: '/portal/personal/transactions' },
  { icon: <FileTextIcon />, name: 'Bills', path: '/portal/personal/bills' },
  { icon: <LandmarkIcon />, name: 'Loans', path: '/portal/personal/loans' },
]

const businessFinanceItems = [
  { icon: <UserRoundIcon className="h-5 w-5" />, name: 'Clients', path: '/portal/business/clients' },
  { icon: <PackageIcon className="h-5 w-5" />, name: 'Materials', path: '/portal/business/materials' },
]

const isPathActive = (pathname: string, path: string) => pathname === path || pathname.startsWith(`${path}/`)

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const pathname = usePathname()
  const showBrandName = isExpanded || isHovered || isMobileOpen
  const isPersonalFinanceActive = personalFinanceItems.some((item) => isPathActive(pathname, item.path))
  const isBusinessFinanceActive = businessFinanceItems.some((item) => isPathActive(pathname, item.path))
  const [isPersonalFinanceOpen, setIsPersonalFinanceOpen] = useState(isPersonalFinanceActive)
  const [isBusinessFinanceOpen, setIsBusinessFinanceOpen] = useState(isBusinessFinanceActive)

  useEffect(() => {
    setIsPersonalFinanceOpen(isPersonalFinanceActive)
    setIsBusinessFinanceOpen(isBusinessFinanceActive)
  }, [isPersonalFinanceActive, isBusinessFinanceActive])

  const dashboardActive = pathname === '/portal'

  const togglePersonalFinance = () => {
    setIsPersonalFinanceOpen((open) => {
      const next = !open
      if (next) setIsBusinessFinanceOpen(false)
      return next
    })
  }

  const toggleBusinessFinance = () => {
    setIsBusinessFinanceOpen((open) => {
      const next = !open
      if (next) setIsPersonalFinanceOpen(false)
      return next
    })
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:mt-0 ${isExpanded || isMobileOpen || isHovered ? 'w-[290px]' : 'w-[90px]'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex py-7 ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}>
        <Link
          href="/portal"
          className={`flex items-center rounded-2xl transition-all duration-200 ${showBrandName ? 'gap-3 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-white/[0.03]' : 'justify-center'}`}
          aria-label="Fintrax dashboard"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:ring-brand-500/20">
            <Image
              src="/images/logo/logo-fintrax.png"
              alt="Fintrax logo"
              width={44}
              height={44}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>
          {showBrandName && (
            <div className="flex h-11 items-center">
              <span className="text-[20px] font-extrabold tracking-tight text-slate-900 dark:text-white">FIN</span>
              <span className="text-[20px] font-extrabold tracking-tight text-cyan-500">TRAX</span>
            </div>
          )}
        </Link>
      </div>

      <nav className="mb-6">
        <h2
          className={`mb-4 flex text-xs uppercase leading-5 text-gray-400 ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}
        >
          {showBrandName ? 'Menu' : <HorizontaLDots />}
        </h2>

        <ul className="flex flex-col gap-4">
          <li>
            <Link
              href="/portal"
              className={`menu-item group ${dashboardActive ? 'menu-item-active' : 'menu-item-inactive'} ${!showBrandName ? 'lg:justify-center' : ''}`}
            >
              <span className={dashboardActive ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}>
                <GridIcon />
              </span>
              {showBrandName && <span className="menu-item-text">Dashboard</span>}
            </Link>
          </li>

          <li>
            <button
              type="button"
              onClick={togglePersonalFinance}
              className={`menu-item menu-item-inactive group w-full cursor-pointer ${!showBrandName ? 'lg:justify-center' : ''}`}
              aria-expanded={isPersonalFinanceOpen}
              aria-controls="personal-finance-menu"
            >
              <span className="menu-item-icon-inactive">
                <WalletCardsIcon className="h-5 w-5" />
              </span>
              {showBrandName && (
                <>
                  <span className="menu-item-text">Personal Finance</span>
                  <ChevronDownIcon
                    className={`ml-auto h-5 w-5 transition-transform duration-200 ${isPersonalFinanceOpen ? 'rotate-180' : ''}`}
                  />
                </>
              )}
            </button>

            {showBrandName && (
              <div
                id="personal-finance-menu"
                className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  isPersonalFinanceOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="min-h-0">
                  <ul className="ml-9 mt-2 space-y-1">
                    {personalFinanceItems.map((item) => {
                      const active = isPathActive(pathname, item.path)
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.path}
                            className={`menu-dropdown-item ${active ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                          >
                            <span className={active ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}>
                              {item.icon}
                            </span>
                            <span>{item.name}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )}
          </li>

          <li>
            <button
              type="button"
              onClick={toggleBusinessFinance}
              className={`menu-item menu-item-inactive group w-full cursor-pointer ${!showBrandName ? 'lg:justify-center' : ''}`}
              aria-expanded={isBusinessFinanceOpen}
              aria-controls="business-finance-menu"
            >
              <span className="menu-item-icon-inactive">
                <BriefcaseBusinessIcon className="h-5 w-5" />
              </span>
              {showBrandName && (
                <>
                  <span className="menu-item-text">Business Finance</span>
                  <ChevronDownIcon
                    className={`ml-auto h-5 w-5 transition-transform duration-200 ${isBusinessFinanceOpen ? 'rotate-180' : ''}`}
                  />
                </>
              )}
            </button>

            {showBrandName && (
              <div
                id="business-finance-menu"
                className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  isBusinessFinanceOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="min-h-0">
                  <ul className="ml-9 mt-2 space-y-1">
                    {businessFinanceItems.map((item) => {
                      const active = isPathActive(pathname, item.path)
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.path}
                            className={`menu-dropdown-item ${active ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}`}
                          >
                            <span className={active ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}>
                              {item.icon}
                            </span>
                            <span>{item.name}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  )
}
