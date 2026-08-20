'use client'

import { useSidebar } from '@/context/SidebarContext'
import { ArrowLeftRightIcon, FileTextIcon, LandmarkIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DollarLineIcon, GridIcon, HorizontaLDots } from '@/icons'

const navItems = [
  { icon: <GridIcon />, name: 'Dashboard', path: '/portal' },
  { icon: <DollarLineIcon />, name: 'Accounts', path: '/portal/accounts' },
  { icon: <FileTextIcon />, name: 'Bills', path: '/portal/bills' },
  { icon: <LandmarkIcon />, name: 'Loans', path: '/portal/loans' },
  { icon: <ArrowLeftRightIcon />, name: 'Transactions', path: '/portal/transactions' },
]

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const pathname = usePathname()
  const showBrandName = isExpanded || isHovered || isMobileOpen

  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:mt-0 ${isExpanded || isMobileOpen || isHovered ? 'w-[290px]' : 'w-[90px]'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex py-7 ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}>
        <Link href="/portal" className={`flex items-center rounded-2xl transition-all duration-200 ${showBrandName ? 'gap-3 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-white/[0.03]' : 'justify-center'}`} aria-label="Fintrax dashboard">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:ring-brand-500/20">
            <Image src="/images/logo/logo-fintrax.png" alt="Fintrax logo" width={44} height={44} className="h-9 w-9 object-contain" priority />
          </div>
          {showBrandName && <div className="flex h-11 items-center"><span className="text-[20px] font-extrabold tracking-tight text-slate-900 dark:text-white">FIN</span><span className="text-[20px] font-extrabold tracking-tight text-cyan-500">TRAX</span></div>}
        </Link>
      </div>
      <nav className="mb-6">
        <h2 className={`mb-4 flex text-xs uppercase leading-5 text-gray-400 ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}>
          {showBrandName ? 'Menu' : <HorizontaLDots />}
        </h2>
        <ul className="flex flex-col gap-4">
          {navItems.map((nav) => {
            const active = pathname === nav.path
            return <li key={nav.name}><Link href={nav.path} className={`menu-item group ${active ? 'menu-item-active' : 'menu-item-inactive'} ${!showBrandName ? 'lg:justify-center' : ''}`}><span className={active ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}>{nav.icon}</span>{showBrandName && <span className="menu-item-text">{nav.name}</span>}</Link></li>
          })}
        </ul>
      </nav>
    </aside>
  )
}
