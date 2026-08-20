'use client'

import AppHeader from '@/components/fintrax/layout/AppHeader'
import AppSidebar from '@/components/fintrax/layout/AppSidebar'
import Backdrop from '@/components/fintrax/layout/Backdrop'
import { useSidebar } from '@/context/SidebarContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar()
  const mainContentMargin = isMobileOpen ? 'ml-0' : isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">{children}</div>
      </div>
    </div>
  )
}
